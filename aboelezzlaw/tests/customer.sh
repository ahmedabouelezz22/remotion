#!/bin/bash
# المسارات التي يراها العميل — وهي بالضبط ما كان معطّلاً في الموقع القديم:
# نموذج الاتصال، الحجز، الدفع، التسليم، صفحة الحساب، ودورة الاشتراك.
set -u
WORK=${WORK:-/tmp/abz-test}
JAR_DIR=${JAR_DIR:-$WORK}
mkdir -p "$WORK" "$JAR_DIR"
BASE=${BASE:-https://localhost:3443}
MB=${MAILBOX:-/tmp/abz-test-mailbox.jsonl}
PSQL="psql ${DATABASE_URL:?DATABASE_URL غير مضبوط} -At -c"
CRON_SECRET_VALUE=$(grep '^CRON_SECRET=' .env.production.local 2>/dev/null | cut -d= -f2-)
HMAC_SECRET=$(grep '^PAYMOB_HMAC_SECRET=' .env.production.local 2>/dev/null | cut -d= -f2-)
# كل محاولة في الاختبار تُرسَل بعنوان IP خاص بها حيث يلزم، فحدّ المعدّل
# (وهو لكل عنوان) لا يتسرّب من سيناريو إلى آخر فيُفسد نتيجة لا علاقة له بها.
ip(){ printf 'X-Forwarded-For: 203.0.113.%s' "$1"; }
PASS=0; FAIL=0
ok(){ echo "  ✅ $1"; PASS=$((PASS+1)); }
bad(){ echo "  ❌ $1"; FAIL=$((FAIL+1)); }
check(){ if [ "$2" = "$3" ]; then ok "$1 ($3)"; else bad "$1 — المتوقَّع $3 والناتج $2"; fi; }

mail_to(){ # $1 = بريد، $2 = نصّ يُبحث عنه في الموضوع أو المتن
  python3 -I - "$MB" "$1" "${2:-}" <<'PYEOF'
import json, sys
mailbox, email, needle = sys.argv[1], sys.argv[2], sys.argv[3]
hits = 0
try:
    lines = open(mailbox, encoding='utf-8').read().splitlines()
except FileNotFoundError:
    lines = []
for line in lines:
    try:
        message = json.loads(line)
    except ValueError:
        continue
    if email in message.get('to', []) and (
        not needle or needle in message.get('subject', '') or needle in message.get('text', '')
    ):
        hits += 1
print(hits)
PYEOF
}

wait_mail(){ # ينتظر وصول رسالة مطابقة
  local deadline=$((SECONDS + 20))
  while [ "$SECONDS" -lt "$deadline" ]; do
    [ "$(mail_to "$1" "${2:-}")" -gt 0 ] && return 0
    sleep 1
  done
  return 1
}

link_for(){ # $1 = بريد، $2 = نمط المسار
  python3 -I - "$MB" "$1" "$2" <<'PYEOF'
import json, re, sys
mailbox, email, pattern = sys.argv[1], sys.argv[2], sys.argv[3]
link = None
try:
    lines = open(mailbox, encoding='utf-8').read().splitlines()
except FileNotFoundError:
    lines = []
for line in lines:
    try:
        message = json.loads(line)
    except ValueError:
        continue
    if email in message.get('to', []):
        found = re.search(r'https?://[^\s<>"]*' + re.escape(pattern) + r'[^\s<>")]*', message.get('text', ''))
        if found:
            link = found.group(0)
print(link or '')
PYEOF
}

echo "── 1) نموذج «اتصل بنا» — العطل الأصلي رقم 2 ──"
C=$(curl -sk -o "$WORK/c.json" -w '%{http_code}' -H 'Content-Type: application/json' \
  -H "$(ip 11)" -X POST $BASE/api/contact -d '{
  "name":"سائل اختبار","email":"asker@example.com","phone":"01555000111",
  "subject":"استفسار عن مراجعة عقد توريد","message":"لديّ عقد توريد مع مورد خارجي وأحتاج مراجعة بنود الضمان والتحكيم فيه قبل التوقيع."}')
check "الإرسال ناجح" "$C" "200"
if wait_mail aboelezzlawfirm@gmail.com 'اتصل بنا'; then ok "وصل إشعار المكتب"; else bad "لم يصل إشعار المكتب"; fi
check "الرسالة محفوظة في القاعدة" "$($PSQL "select count(*) from messages where email='asker@example.com'")" "1"
check "قيد إشعار مسجَّل" "$($PSQL "select count(*) from notification_log where kind='contact'")" "4"

echo
echo "── 2) الحقل الفخّ (honeypot) ──"
C=$(curl -sk -o /dev/null -w '%{http_code}' -H 'Content-Type: application/json' \
  -H "$(ip 12)" -X POST $BASE/api/contact -d '{
  "name":"بوت","email":"bot@example.com","phone":"01000000000",
  "subject":"سبام","message":"نصّ طويل بما يكفي ليتجاوز التحقّق الأدنى في النموذج.",
  "company":"http://spam.example"}')
check "يُجاب بنجاح صامت لا بخطأ" "$C" "200"
check "ولا يُحفظ شيء" "$($PSQL "select count(*) from messages where email='bot@example.com'")" "0"

echo
echo "── 3) الحجز: منع الحجز المزدوج من القاعدة ──"
# أول يوم عمل (أحد–خميس) بعد أسبوعين — ساعات العمل معرّفة في site.ts
D=$(python3 -I -c "
import datetime
d = datetime.date.today() + datetime.timedelta(days=14)
while d.weekday() in (4, 5):  # الجمعة والسبت
    d += datetime.timedelta(days=1)
print(d.isoformat())
")
BOOK='{"name":"حاجز أول","email":"first@example.com","phone":"01111222333",
 "type":"مراجعة أو صياغة عقد","channel":"واتساب","date":"'$D'","time":"12:00",
 "details":"مراجعة عقد وكالة تجارية مع موزّع في الخليج قبل التوقيع."}'
C=$(curl -sk -o /dev/null -w '%{http_code}' -H 'Content-Type: application/json' -H "$(ip 20)" -X POST $BASE/api/booking -d "$BOOK")
check "الحجز الأول" "$C" "200"
C=$(curl -sk -o "$WORK/b2.json" -w '%{http_code}' -H 'Content-Type: application/json' -H "$(ip 21)" -X POST $BASE/api/booking \
  -d "$(echo "$BOOK" | sed 's/حاجز أول/حاجز ثانٍ/; s/first@/second@/')")
check "نفس الموعد لعميل آخر مرفوض" "$C" "409"
check "لا حجزين في نفس الوقت" "$($PSQL "select count(*) from bookings where slot_date='$D' and slot_time='12:00'")" "1"
check "الموعد مُستبعد من المتاح" "$(curl -sk "$BASE/api/booking/availability?date=$D" | grep -c '12:00')" "1"
if wait_mail first@example.com 'حجز'; then ok "وصل تأكيد الاستلام للعميل"; else bad "لم يصل تأكيد للعميل"; fi

echo
echo "── 4) الحجز خارج أيام العمل وخارج ساعاته ──"
# الجمعة والسبت خارج ساعات العمل المعرّفة في site.ts
FRI=$(python3 -I -c "
import datetime
d = datetime.date.today() + datetime.timedelta(days=1)
while d.weekday() != 4:  # الجمعة
    d += datetime.timedelta(days=1)
print(d.isoformat())
")
C=$(curl -sk -o /dev/null -w '%{http_code}' -H 'Content-Type: application/json' -H "$(ip 22)" -X POST $BASE/api/booking \
  -d '{"name":"حاجز","email":"fri@example.com","phone":"01111222444","type":"استشارة قانونية عامة",
       "channel":"واتساب","date":"'$FRI'","time":"12:00","details":"محاولة حجز في يوم غير عمل للتحقّق."}')
check "يوم غير عمل مرفوض" "$C" "400"
C=$(curl -sk -o /dev/null -w '%{http_code}' -H 'Content-Type: application/json' -H "$(ip 23)" -X POST $BASE/api/booking \
  -d '{"name":"حاجز","email":"dawn@example.com","phone":"01111222555","type":"استشارة قانونية عامة",
       "channel":"واتساب","date":"'$D'","time":"03:00","details":"محاولة حجز الثالثة فجراً للتحقّق من الفحص."}')
check "ساعة خارج المواعيد مرفوضة" "$C" "400"
# المدى الأقصى والماضي مُغطَّيان في اختبارات الوحدات؛ هنا نكتفي بما يحتاج خادماً

echo
echo "── 4ب) حدّ المعدّل على الحجز ──"
# عنوان واحد يحاول خمس مرّات، والحدّ أربع محاولات كل ربع ساعة
FLOOD='{"name":"مكرِّر","email":"flood@example.com","phone":"01111222777",
 "type":"استشارة قانونية عامة","channel":"واتساب","date":"'$D'","time":"TIME",
 "details":"محاولة متكرّرة للتحقّق من حدّ المعدّل على الحجز."}'
LAST=''
for slot in 14:00 15:00 16:00 17:00 11:00; do
  LAST=$(curl -sk -o /dev/null -w '%{http_code}' -H 'Content-Type: application/json' -H "$(ip 90)" \
    -X POST $BASE/api/booking -d "${FLOOD/TIME/$slot}")
done
check "المحاولة الخامسة من نفس العنوان مرفوضة" "$LAST" "429"
check "والمسموح به أربع محاولات فقط" "$($PSQL "select count(*) from bookings where email='flood@example.com'")" "4"

echo
echo "── 5) التسعير من الخادم لا من المتصفّح ──"
R=$(curl -sk -H 'Content-Type: application/json' -X POST $BASE/api/checkout -d '{
 "name":"متلاعب","email":"tamper@example.com","phone":"01012345678","method":"manual",
 "items":[{"slug":"consultation-60","quantity":1,"price":1,"unitPrice":1}]}')
REF=$(echo "$R" | python3 -I -c "import json,sys;print(json.load(sys.stdin).get('reference',''))")
if [ -n "$REF" ]; then ok "أُنشئ الطلب $REF"; else bad "لم يُنشأ طلب: $R"; fi
check "الإجمالي من الكتالوج لا من الطلب" "$($PSQL "select total::int from orders where id='$REF'")" "1500"

echo
echo "── 6) webhook الدفع: التوقيع وعدم التكرار ──"
PAY=$(curl -sk -H 'Content-Type: application/json' -X POST $BASE/api/checkout -d '{
 "name":"مشترٍ","email":"paid@example.com","phone":"01012345678","method":"manual",
 "items":[{"slug":"contract-templates-pack","quantity":1}]}')
PREF=$(echo "$PAY" | python3 -I -c "import json,sys;print(json.load(sys.stdin).get('reference',''))")

hook_body(){ python3 -I - "$PREF" <<'PYEOF'
import json, sys
print(json.dumps({'type': 'TRANSACTION', 'obj': {
  'amount_cents': 120000, 'created_at': '2026-10-23T12:00:00Z', 'currency': 'EGP',
  'error_occured': False, 'has_parent_transaction': False, 'id': 555001,
  'integration_id': 4242, 'is_3d_secure': True, 'is_auth': False, 'is_capture': False,
  'is_refunded': False, 'is_standalone_payment': True, 'is_voided': False,
  'order': {'id': 991, 'merchant_order_id': sys.argv[1]}, 'owner': 1234, 'pending': False,
  'source_data': {'pan': '2346', 'sub_type': 'MasterCard', 'type': 'card'},
  'success': True,
}}, ensure_ascii=False))
PYEOF
}
BODY=$(hook_body)
SIG=$(python3 -I - "$BODY" "$HMAC_SECRET" <<'PYEOF'
import hashlib, hmac, json, sys
obj = json.loads(sys.argv[1])['obj']
ORDER = ['amount_cents','created_at','currency','error_occured','has_parent_transaction','id',
         'integration_id','is_3d_secure','is_auth','is_capture','is_refunded',
         'is_standalone_payment','is_voided','order.id','owner','pending','source_data.pan',
         'source_data.sub_type','source_data.type','success']
def read(path):
    value = obj
    for key in path.split('.'):
        value = value.get(key) if isinstance(value, dict) else None
    if isinstance(value, bool):
        return 'true' if value else 'false'
    return '' if value is None else str(value)
print(hmac.new(sys.argv[2].encode(), ''.join(read(p) for p in ORDER).encode(), hashlib.sha512).hexdigest())
PYEOF
)
C=$(curl -sk -o /dev/null -w '%{http_code}' -H 'Content-Type: application/json' \
  -X POST "$BASE/api/payments/paymob/webhook?hmac=deadbeef" -d "$BODY")
check "توقيع مُلفَّق مرفوض" "$C" "401"
check "الطلب لم يُدفع" "$($PSQL "select status from orders where id='$PREF'")" "pending"

C=$(curl -sk -o /dev/null -w '%{http_code}' -H 'Content-Type: application/json' \
  -X POST "$BASE/api/payments/paymob/webhook?hmac=$SIG" -d "$BODY")
check "توقيع صحيح مقبول" "$C" "200"
check "الطلب صار مدفوعاً" "$($PSQL "select status from orders where id='$PREF'")" "paid"
if wait_mail paid@example.com 'api/download'; then ok "وصل رابط التحميل"; else bad "لم يصل رابط التحميل"; fi
BEFORE=$(mail_to paid@example.com 'api/download')

C=$(curl -sk -o /dev/null -w '%{http_code}' -H 'Content-Type: application/json' \
  -X POST "$BASE/api/payments/paymob/webhook?hmac=$SIG" -d "$BODY")
check "إعادة الإشعار مقبولة بهدوء" "$C" "200"
sleep 2
check "ولا تُكرّر التسليم" "$(mail_to paid@example.com 'api/download')" "$BEFORE"

echo
echo "── 7) رابط التحميل: صلاحيته وتلفيقه ──"
DL=$(link_for paid@example.com 'api/download')
HDR=$(curl -sk -o "$WORK/pack.zip" -w '%{http_code} %{size_download}' "$DL")
check "التحميل يعمل" "$(echo $HDR|cut -d' ' -f1)" "200"
N=$(python3 -I -c "import zipfile;print(len(zipfile.ZipFile('$WORK/pack.zip').namelist()))" 2>/dev/null || echo 0)
check "الحزمة تحتوي 13 ملفاً" "$N" "13"
TOK=$(echo "$DL" | sed 's/.*token=//')
C=$(curl -sk -o /dev/null -w '%{http_code}' "$BASE/api/download?token=${TOK%?}X")
check "رمز مُلفَّق مرفوض" "$C" "403"
C=$(curl -sk -o /dev/null -w '%{http_code}' "$BASE/api/download")
check "بلا رمز مرفوض" "$C" "400"

echo
echo "── 8) صفحة الحساب: لا يرى عميل طلبات غيره ──"
curl -sk -o /dev/null -H 'Content-Type: application/json' -X POST $BASE/api/account/login -d '{"email":"paid@example.com"}'
wait_mail paid@example.com 'api/account/verify' || true
L1=$(link_for paid@example.com 'api/account/verify')
curl -sk -c "$JAR_DIR/buyer.jar" -o /dev/null "$L1"
curl -sk -b "$JAR_DIR/buyer.jar" "$BASE/account" > "$WORK/acc1.html"
grep -q "$PREF" "$WORK/acc1.html" && ok "العميل يرى طلبه" || bad "العميل لا يرى طلبه"
grep -q 'مدفوع' "$WORK/acc1.html" && ok "الحالة معروضة" || bad "الحالة غائبة"
grep -q 'api/download' "$WORK/acc1.html" && ok "رابط التحميل في الصفحة" || bad "لا رابط تحميل"

curl -sk -o /dev/null -H 'Content-Type: application/json' -X POST $BASE/api/account/login -d '{"email":"tamper@example.com"}'
wait_mail tamper@example.com 'api/account/verify' || true
L2=$(link_for tamper@example.com 'api/account/verify')
curl -sk -c "$JAR_DIR/other.jar" -o /dev/null "$L2"
curl -sk -b "$JAR_DIR/other.jar" "$BASE/account" > "$WORK/acc2.html"
grep -q "$PREF" "$WORK/acc2.html" && bad "عميل آخر يرى طلب غيره!" || ok "عميل آخر لا يرى طلب غيره"
grep -q "$REF" "$WORK/acc2.html" && ok "ويرى طلبه هو" || bad "لا يرى طلبه"

printf '127.0.0.1\tFALSE\t/\tTRUE\t0\tabz_session\tZm9yZ2VkLnNpZw\n' > "$JAR_DIR/forged-session.jar"
curl -sk -b "$JAR_DIR/forged-session.jar" "$BASE/account" > "$WORK/acc3.html"
grep -q "$PREF" "$WORK/acc3.html" && bad "كعكة مُلفَّقة منحت وصولاً!" || ok "كعكة جلسة مُلفَّقة لا تمنح شيئاً"

echo
echo "── 9) مهمة الاشتراكات محمية بسرّ ──"
C=$(curl -sk -o /dev/null -w '%{http_code}' "$BASE/api/cron/subscriptions")
check "بلا سرّ مرفوضة" "$C" "401"
C=$(curl -sk -o /dev/null -w '%{http_code}' "$BASE/api/cron/subscriptions?secret=wrong")
check "بسرّ خاطئ مرفوضة" "$C" "401"
C=$(curl -sk -o "$WORK/cron.json" -w '%{http_code}' "$BASE/api/cron/subscriptions?secret=$CRON_SECRET_VALUE")
check "بالسرّ الصحيح تعمل" "$C" "200"

echo
echo "── 10) دورة حياة الاشتراك ──"
SID=$($PSQL "insert into subscriptions
 (id,email,name,phone,product_slug,status,period,current_period_start,current_period_end,provider)
 values ('SUB-TEST-1','sub@example.com','مشترك','01009998877','retainer-basic','active','شهري',
         now() - interval '27 days', now() + interval '2 days','manual')
 returning id" | head -1)
check "أُنشئ اشتراك تجريبي" "$SID" "SUB-TEST-1"
curl -sk -o /dev/null "$BASE/api/cron/subscriptions?secret=$CRON_SECRET_VALUE"
check "أُرسل تذكير عتبة 3 أيام" "$($PSQL "select last_reminder_days from subscriptions where id='SUB-TEST-1'")" "3"
if wait_mail sub@example.com 'يومين'; then ok "الرسالة تقول «بعد يومين» لا «خلال 7 أيام»"; else bad "صياغة المدة خاطئة"; fi
N1=$(mail_to sub@example.com 'تذكير')
curl -sk -o /dev/null "$BASE/api/cron/subscriptions?secret=$CRON_SECRET_VALUE"
sleep 1
check "لا يتكرّر التذكير لنفس العتبة" "$(mail_to sub@example.com 'تذكير')" "$N1"

$PSQL "update subscriptions set current_period_end = now() - interval '1 day' where id='SUB-TEST-1'" >/dev/null
curl -sk -o /dev/null "$BASE/api/cron/subscriptions?secret=$CRON_SECRET_VALUE"
check "انتهاء الدورة بلا تجديد ⇒ متأخّر السداد" "$($PSQL "select status from subscriptions where id='SUB-TEST-1'")" "past_due"

echo
echo "── 11) إيقاف التجديد من جهة العميل ──"
$PSQL "update subscriptions set status='active', cancel_at_period_end=false,
       current_period_end = now() + interval '10 days' where id='SUB-TEST-1'" >/dev/null
C=$(curl -sk -o /dev/null -w '%{http_code}' -b "$JAR_DIR/buyer.jar" -H 'Content-Type: application/json' \
   -X POST $BASE/api/account/cancel-subscription -d '{"id":"SUB-TEST-1"}')
check "عميل آخر لا يُلغي اشتراكاً ليس له" "$C" "404"
check "الاشتراك لم يتغيّر" "$($PSQL "select cancel_at_period_end from subscriptions where id='SUB-TEST-1'")" "f"

echo
echo "════ ناجح: $PASS — فاشل: $FAIL ════"
[ "$FAIL" -eq 0 ]
