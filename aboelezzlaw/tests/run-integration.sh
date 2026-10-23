#!/usr/bin/env bash
#
# اختبار التكامل — مقابل خادم إنتاج حقيقي وقاعدة حقيقية وبريد حقيقي الاستقبال.
#
# لماذا كل هذا التجهيز بدلاً من محاكاة الطبقات؟ لأن أهمّ ما نتحقّق منه لا يظهر
# في المحاكاة: الكعكات الآمنة لا تُرسَل إلا على https (ولذلك نُنهي TLS أمام
# الخادم)، وعدم تكرار استخدام رمز الدخول قيدٌ في القاعدة لا في الكود،
# ومنع الحجز المزدوج فهرس جزئي في PostgreSQL. اختبار يمحو هذه الطبقات
# يُمرّر ثغرات حقيقية.
#
# المتطلّبات: PostgreSQL 16 (ملفّاته التنفيذية في PATH أو
# /usr/lib/postgresql/16/bin)، Node 20+، Python 3، openssl، curl.
#
# يقبل DATABASE_URL جاهزاً (كما في CI مع خدمة postgres)، وإلا أنشأ نسخة محلّية.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORK="$(mktemp -d)"
export WORK JAR_DIR="$WORK/jars"
export MAILBOX="$WORK/mailbox.jsonl"
export TLS_DIR="$WORK"
export BASE="https://localhost:3443"
mkdir -p "$JAR_DIR"

PIDS=()
OWN_PG=0

cleanup() {
  local code=$?
  for pid in "${PIDS[@]:-}"; do kill "$pid" 2>/dev/null || true; done
  if [ "$OWN_PG" = "1" ]; then
    su pgtest -c "PATH=$PGBIN:\$PATH pg_ctl -D $PGDATA stop -m immediate" >/dev/null 2>&1 || true
  fi
  if [ "${KEEP_WORK:-0}" = "1" ]; then
    echo "ملفّات التشغيل محفوظة في: $WORK"
  else
    rm -rf "$WORK"
  fi
  exit $code
}
trap cleanup EXIT INT TERM

step() { printf '\n\033[1m▸ %s\033[0m\n' "$1"; }

# منفذ مشغول يعني أن تشغيلاً سابقاً ما زال قائماً، وبدون هذا الفحص تُجرى
# الاختبارات على الخادم القديم فتبدو ناجحة أو فاشلة بلا علاقة بالكود الحالي
free_port() {
  local port=$1
  (exec 3<>"/dev/tcp/127.0.0.1/$port") 2>/dev/null || return 0
  exec 3<&- 2>/dev/null || true
  echo "   المنفذ $port مشغول — إيقاف ما يستخدمه"
  fuser -k -n tcp "$port" >/dev/null 2>&1 || true
  sleep 2
  if (exec 3<>"/dev/tcp/127.0.0.1/$port") 2>/dev/null; then
    exec 3<&- 2>/dev/null || true
    echo "المنفذ $port لا يزال مشغولاً. أوقف ما يستخدمه ثم أعد التشغيل." >&2
    exit 1
  fi
}

step "تحرير المنافذ"
for port in 3100 3443 1025; do free_port "$port"; done

# ── قاعدة البيانات ──
if [ -z "${DATABASE_URL:-}" ]; then
  step "تجهيز PostgreSQL محلّي"
  PGBIN="$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | tail -1 || true)"
  [ -n "$PGBIN" ] || { echo "لم يُعثر على ملفّات PostgreSQL التنفيذية. اضبط DATABASE_URL أو ثبّت postgresql."; exit 1; }
  [ "$(id -u)" = "0" ] || { echo "تجهيز نسخة محلّية يحتاج root. اضبط DATABASE_URL على قاعدة اختبار جاهزة."; exit 1; }

  PGDATA=/home/pgtest/pgdata
  id pgtest >/dev/null 2>&1 || useradd -m pgtest
  rm -rf "$PGDATA" /home/pgtest/sock
  mkdir -p "$PGDATA" /home/pgtest/sock
  chown -R pgtest:pgtest /home/pgtest
  su pgtest -c "PATH=$PGBIN:\$PATH initdb -D $PGDATA -A trust -U pgtest" >/dev/null
  su pgtest -c "PATH=$PGBIN:\$PATH pg_ctl -D $PGDATA -o '-p 55432 -k /home/pgtest/sock' -l /home/pgtest/pg.log start" >/dev/null
  OWN_PG=1
  sleep 2
  su pgtest -c "PATH=$PGBIN:\$PATH createdb -h /home/pgtest/sock -p 55432 -U pgtest aboelezz" >/dev/null
  su pgtest -c "PATH=$PGBIN:\$PATH psql -h /home/pgtest/sock -p 55432 -U pgtest -d postgres -c 'CREATE ROLE app LOGIN SUPERUSER'" >/dev/null
  export DATABASE_URL="postgres://app@127.0.0.1:55432/aboelezz"
fi
echo "   القاعدة: ${DATABASE_URL%%\?*}"

# ── مصيدة البريد ──
step "تشغيل مصيدة SMTP"
python3 -I "$ROOT/tests/helpers/fake-smtp.py" 1025 > "$WORK/smtp.log" 2>&1 &
PIDS+=($!)
sleep 1
grep -q 'sink up' "$WORK/smtp.log" || { cat "$WORK/smtp.log"; exit 1; }

# ── شهادة TLS محلّية ──
step "إنشاء شهادة اختبار"
openssl req -x509 -newkey rsa:2048 -nodes -keyout "$WORK/key.pem" -out "$WORK/cert.pem" \
  -days 1 -subj "/CN=localhost" -addext "subjectAltName=DNS:localhost" >/dev/null 2>&1

# ── بيئة الخادم ──
# أسرار الاختبار عشوائية في كل تشغيل، فلا يُستنسخ سرّ من مستودع إلى إنتاج
cat > "$ROOT/.env.production.local" <<ENV
DATABASE_URL=$DATABASE_URL
AUTH_SECRET=$(openssl rand -hex 32)
DOWNLOAD_SECRET=$(openssl rand -hex 32)
CRON_SECRET=$(openssl rand -hex 16)
PAYMOB_HMAC_SECRET=$(openssl rand -hex 16)
OWNER_EMAILS=aboelezzlawfirm@gmail.com
SMTP_HOST=127.0.0.1
SMTP_PORT=1025
SMTP_FROM=no-reply@aboelezzlaw.test
ENV

step "بناء الإنتاج"
(cd "$ROOT" && npm run build > "$WORK/build.log" 2>&1) || { tail -30 "$WORK/build.log"; exit 1; }

step "تشغيل الخادم ومنهي TLS"
(cd "$ROOT" && npx next start -p 3100 > "$WORK/server.log" 2>&1) &
PIDS+=($!)
node "$ROOT/tests/helpers/tls-proxy.mjs" > "$WORK/tls.log" 2>&1 &
PIDS+=($!)

for _ in $(seq 1 40); do
  sleep 1
  if curl -sk -o /dev/null "$BASE/" 2>/dev/null; then break; fi
done
curl -sk -o /dev/null -w '' "$BASE/" || { tail -20 "$WORK/server.log" "$WORK/tls.log"; exit 1; }
echo "   الخادم جاهز على $BASE"

# ── التشغيل ──
FAILED=0
step "المجموعة 1: الدخول والتفويض"
psql "$DATABASE_URL" -c "TRUNCATE orders, bookings, subscriptions, messages, login_tokens, admin_audit, notification_log, product_flags" >/dev/null 2>&1 || true
: > "$MAILBOX"
bash "$ROOT/tests/admin.sh" || FAILED=1

step "المجموعة 2: إجراءات اللوحة ودورة حياة الطلب"
bash "$ROOT/tests/actions.sh" || FAILED=1

rm -f "$ROOT/.env.production.local"

if [ "$FAILED" = "0" ]; then
  printf '\n\033[1;32m✔ كل اختبارات التكامل نجحت\033[0m\n'
else
  printf '\n\033[1;31m✘ فشل في اختبارات التكامل\033[0m\n'
fi
exit "$FAILED"
