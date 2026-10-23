#!/bin/bash
# اختبار تكامل للوحة المالك ولرموز الدخول لمرة واحدة — مقابل خادم حقيقي وقاعدة حقيقية
set -u
WORK=${WORK:-/tmp/abz-test}
JAR_DIR=${JAR_DIR:-$WORK}
mkdir -p "$WORK" "$JAR_DIR"
BASE=${BASE:-https://localhost:3443}
MAILBOX=${MAILBOX:-/tmp/abz-test-mailbox.jsonl}
PASS=0; FAIL=0
ok()   { echo "  ✅ $1"; PASS=$((PASS+1)); }
bad()  { echo "  ❌ $1"; FAIL=$((FAIL+1)); }
check(){ if [ "$2" = "$3" ]; then ok "$1 ($3)"; else bad "$1 — المتوقَّع $3 والناتج $2"; fi; }

# البريد يُكتب في المصيدة من عملية أخرى، فالقراءة بعد تأخير ثابت هشّة:
# ننتظر وصول الرسالة حتى مدة معقولة ثم نستخرج الرابط.
last_link() { # $1 = بريد المستلم
  local deadline=$((SECONDS + 20)) link=''
  while [ "$SECONDS" -lt "$deadline" ]; do
    link=$(python3 -I - "$1" "$MAILBOX" <<'PYEOF'
import json, re, sys
email, mailbox = sys.argv[1], sys.argv[2]
link = None
try:
    lines = open(mailbox, encoding='utf-8').read().splitlines()
except FileNotFoundError:
    lines = []
for line in lines:
    try:
        message = json.loads(line)
    except ValueError:
        continue  # سطر لم يكتمل كتابته بعد
    if email in message.get('to', []):
        found = re.search(r'https?://[^\s<>"]*verify\?token=[^\s<>")]+', message.get('text', ''))
        if found:
            link = found.group(0)
print(link or '')
PYEOF
)
    [ -n "$link" ] && break
    sleep 1
  done
  printf '%s' "$link"
}

echo "── 1) رموز الدخول لمرة واحدة ──"
curl -sk -X POST $BASE/api/account/login -H 'Content-Type: application/json' \
  -d '{"email":"client@example.com"}' -o "$WORK/r1.json" -w '' 
sleep 1
LINK=$(last_link client@example.com)
if [ -n "$LINK" ]; then ok "وصل رابط الدخول بالبريد"; else bad "لم يصل رابط دخول"; fi

C1=$(curl -sk -o /dev/null -w '%{http_code}' -c "$JAR_DIR/c1.jar" "$LINK")
check "الاستخدام الأول للرابط يُحوِّل" "$C1" "307"
SESS=$(grep -c abz_session "$JAR_DIR/c1.jar")
check "صدرت كعكة الجلسة" "$SESS" "1"

C2=$(curl -sk -c "$JAR_DIR/c2.jar" -o /dev/null -w '%{redirect_url}' "$LINK")
case "$C2" in
  *error*) ok "الاستخدام الثاني لنفس الرابط مرفوض" ;;
  *) bad "الاستخدام الثاني قُبِل! ($C2)" ;;
esac
S2=$(grep -c abz_session "$JAR_DIR/c2.jar" || true)
check "لم تصدر جلسة من الاستخدام الثاني" "$S2" "0"

echo
echo "── 2) تفويض اللوحة ──"
A1=$(curl -sk -o /dev/null -w '%{http_code}' $BASE/admin)
check "/admin بلا جلسة يُحوِّل لصفحة الدخول" "$A1" "307"

# جلسة عميل عادي لا تفتح اللوحة
A2=$(curl -sk -b "$JAR_DIR/c1.jar" -o /dev/null -w '%{redirect_url}' $BASE/admin)
case "$A2" in
  *admin/login*) ok "جلسة العميل لا تفتح اللوحة" ;;
  *) bad "جلسة العميل فتحت اللوحة! ($A2)" ;;
esac

for ep in orders bookings subscriptions products; do
  R=$(curl -sk -o /dev/null -w '%{http_code}' -X POST $BASE/api/admin/$ep \
      -H 'Content-Type: application/json' -d '{"reference":"X","id":"X","slug":"contract-templates-pack","published":true,"action":"cancel","status":"cancelled"}')
  check "POST /api/admin/$ep بلا جلسة" "$R" "401"
done

R=$(curl -sk -o /dev/null -w '%{http_code}' -b "$JAR_DIR/c1.jar" -X POST $BASE/api/admin/orders \
    -H 'Content-Type: application/json' -d '{"reference":"X","action":"cancel"}')
check "POST إداري بجلسة عميل" "$R" "401"

echo
echo "── 3) طلب دخول إداري ببريد غير مصرَّح ──"
BODY=$(curl -sk -X POST $BASE/api/admin/login -H 'Content-Type: application/json' -d '{"email":"intruder@example.com"}')
echo "$BODY" | grep -q '"ok":true' && ok "الرد لا يكشف أن البريد غير مصرَّح" || bad "الرد كشف الحالة: $BODY"
sleep 1
IL=$(last_link intruder@example.com)
if [ -z "$IL" ]; then ok "لم يُرسَل أي رابط إلى بريد غير مصرَّح"; else bad "أُرسل رابط إلى بريد غير مصرَّح!"; fi

echo
echo "── 4) دخول المالك ──"
curl -sk -X POST $BASE/api/admin/login -H 'Content-Type: application/json' \
  -d '{"email":"aboelezzlawfirm@gmail.com"}' -o /dev/null
sleep 1
OLINK=$(last_link aboelezzlawfirm@gmail.com)
if [ -n "$OLINK" ]; then ok "وصل رابط دخول المالك"; else bad "لم يصل رابط للمالك"; fi

curl -sk -c "$JAR_DIR/owner.jar" -o /dev/null "$OLINK"
grep -q abz_admin "$JAR_DIR/owner.jar" && ok "صدرت كعكة الإدارة abz_admin" || bad "لم تصدر كعكة إدارة"
grep abz_admin "$JAR_DIR/owner.jar" | grep -q HttpOnly && ok "الكعكة HttpOnly" || bad "الكعكة ليست HttpOnly"

AH=$(curl -sk -b "$JAR_DIR/owner.jar" -o "$WORK/admin.html" -w '%{http_code}' $BASE/admin)
check "المالك يفتح اللوحة" "$AH" "200"
grep -q 'نظرة عامة' "$WORK/admin.html" && grep -q 'سجلّ التدقيق' "$WORK/admin.html" && ok "اللوحة تُرسم بأقسامها" || bad "اللوحة لم تُرسم"
grep -q 'إيراد الطلبات المدفوعة' "$WORK/admin.html" && ok "اللوحة تُظهر المؤشّرات" || bad "المؤشّرات غائبة"

# إعادة استخدام رابط المالك
R2=$(curl -sk -o /dev/null -w '%{redirect_url}' "$OLINK")
case "$R2" in *error*) ok "رابط المالك لمرة واحدة" ;; *) bad "أُعيد استخدام رابط المالك! ($R2)" ;; esac

# كعكة إدارة مُلفَّقة
printf '127.0.0.1\tFALSE\t/\tFALSE\t0\tabz_admin\tZm9yZ2VkLnBheWxvYWQ.c2ln\n' > "$JAR_DIR/forged.jar"
F=$(curl -sk -b "$JAR_DIR/forged.jar" -o /dev/null -w '%{http_code}' $BASE/admin)
check "كعكة إدارة مُلفَّقة مرفوضة" "$F" "307"

echo
echo "── 5) صفحات اللوحة ──"
for page in orders bookings subscriptions customers products messages notifications audit; do
  S=$(curl -sk -b "$JAR_DIR/owner.jar" -o "$WORK/p.html" -w '%{http_code}' $BASE/admin/$page)
  check "/admin/$page" "$S" "200"
done

echo
echo "════ ناجح: $PASS — فاشل: $FAIL ════"
[ "$FAIL" -eq 0 ]
