#!/bin/bash
# اختبار تكامل لإجراءات اللوحة: دورة حياة الطلب، المواعيد، النشر، الأثر
set -u
WORK=${WORK:-/tmp/abz-test}
JAR_DIR=${JAR_DIR:-$WORK}
mkdir -p "$WORK" "$JAR_DIR"
BASE=${BASE:-https://localhost:3443}
MB=${MAILBOX:-/tmp/abz-test-mailbox.jsonl}
PSQL="psql ${DATABASE_URL:?DATABASE_URL غير مضبوط} -At -c"
PASS=0; FAIL=0
ok(){ echo "  ✅ $1"; PASS=$((PASS+1)); }
bad(){ echo "  ❌ $1"; FAIL=$((FAIL+1)); }
check(){ if [ "$2" = "$3" ]; then ok "$1 ($3)"; else bad "$1 — المتوقَّع $3 والناتج $2"; fi; }
post(){ curl -sk -b "$JAR_DIR/owner.jar" -H 'Content-Type: application/json' -H "Origin: $BASE" -X POST "$BASE$1" -d "$2"; }
code(){ curl -sk -b "$JAR_DIR/owner.jar" -o "$WORK/out.json" -w '%{http_code}' -H 'Content-Type: application/json' -H "Origin: $BASE" -X POST "$BASE$1" -d "$2"; }

echo "── 1) طلب تحويل يدوي ──"
ORDER=$(curl -sk -H 'Content-Type: application/json' -X POST $BASE/api/checkout -d '{
 "name":"عميل اختبار","email":"buyer@example.com","phone":"01012345678",
 "method":"manual","items":[{"slug":"contract-templates-pack","quantity":1}]}')
REF=$(echo "$ORDER" | python3 -I -c "import json,sys;print(json.load(sys.stdin).get('reference',''))")
if [ -n "$REF" ]; then ok "أُنشئ الطلب $REF"; else bad "لم يُنشأ طلب: $ORDER"; exit 1; fi
check "الحالة في القاعدة" "$($PSQL "select status from orders where id='$REF'")" "pending"

echo
echo "── 2) تأكيد التحويل ──"
C=$(code /api/admin/orders "{\"reference\":\"$REF\",\"action\":\"confirm-transfer\"}")
check "تأكيد بلا مرجع تحويل مرفوض" "$C" "400"
check "الحالة لم تتغيّر" "$($PSQL "select status from orders where id='$REF'")" "pending"

C=$(code /api/admin/orders "{\"reference\":\"$REF\",\"action\":\"confirm-transfer\",\"reason\":\"INSTAPAY-99881\"}")
check "تأكيد بمرجع ناجح" "$C" "200"
check "الطلب صار مدفوعاً" "$($PSQL "select status from orders where id='$REF'")" "paid"
check "مرجع المزوّد مسجَّل" "$($PSQL "select provider_ref from orders where id='$REF'")" "manual:INSTAPAY-99881"

# انتظار وصول بريد التسليم ثم استخراج الرابط الموقَّع منه
DL=''
deadline=$((SECONDS + 20))
while [ "$SECONDS" -lt "$deadline" ]; do
  DL=$(python3 -I - "$MB" <<'PYEOF'
import json, re, sys
link = None
try:
    lines = open(sys.argv[1], encoding='utf-8').read().splitlines()
except FileNotFoundError:
    lines = []
for line in lines:
    try:
        message = json.loads(line)
    except ValueError:
        continue
    if 'buyer@example.com' in message.get('to', []):
        found = re.search(r'https?://[^\s<>"]*api/download\?[^\s<>")]+', message.get('text', ''))
        if found:
            link = found.group(0)
print(link or '')
PYEOF
)
  [ -n "$DL" ] && break
  sleep 1
done
if [ -n "$DL" ]; then ok "وصل رابط التحميل للعميل"; else bad "لم يصل رابط تحميل"; fi
if [ -n "$DL" ]; then
  HDR=$(curl -sk -o "$WORK/dl.zip" -w '%{http_code} %{size_download}' "$DL")
  SIZE=$(echo $HDR | cut -d' ' -f2)
  check "التحميل يعمل" "$(echo $HDR | cut -d' ' -f1)" "200"
  if [ "$SIZE" -gt 50000 ]; then ok "حجم الملف $SIZE بايت"; else bad "حجم غير متوقَّع: $SIZE"; fi
  N=$(python3 -I -c "import zipfile;print(len(zipfile.ZipFile('"$WORK/dl.zip"').namelist()))" 2>/dev/null || echo 0)
  check "عدد الملفات في الحزمة" "$N" "13"
fi

echo
echo "── 3) قيود الانتقال ──"
C=$(code /api/admin/orders "{\"reference\":\"$REF\",\"action\":\"confirm-transfer\",\"reason\":\"X\"}")
check "لا يُؤكَّد تحويل لطلب مدفوع" "$C" "409"
C=$(code /api/admin/orders "{\"reference\":\"$REF\",\"action\":\"cancel\"}")
check "لا يُلغى طلب مدفوع" "$C" "409"
C=$(code /api/admin/orders '{"reference":"ABZ-DOES-NOT-EXIST","action":"cancel"}')
check "مرجع غير موجود" "$C" "404"

C=$(code /api/admin/orders "{\"reference\":\"$REF\",\"action\":\"refund\",\"reason\":\"طلب العميل\"}")
check "الاسترداد ناجح" "$C" "200"
check "الحالة مسترد" "$($PSQL "select status from orders where id='$REF'")" "refunded"
C=$(code /api/admin/orders "{\"reference\":\"$REF\",\"action\":\"refund\",\"reason\":\"مرة ثانية\"}")
check "لا يُسترد مرتين" "$C" "409"

echo
echo "── 4) CSRF ──"
C=$(curl -sk -b "$JAR_DIR/owner.jar" -o /dev/null -w '%{http_code}' -H 'Content-Type: application/json' \
   -H 'Origin: https://evil.example' -X POST $BASE/api/admin/orders -d '{"reference":"X","action":"cancel"}')
check "طلب من مصدر أجنبي مرفوض" "$C" "403"

echo
echo "── 5) المواعيد ──"
# أول يوم عمل (أحد–خميس) بعد أسبوعين — الخادم يرفض أيام الإجازة
SLOTD=$(python3 -I -c "
import datetime
d = datetime.date.today() + datetime.timedelta(days=14)
while d.weekday() in (4, 5):
    d += datetime.timedelta(days=1)
print(d.isoformat())
")
B=$(curl -sk -H 'Content-Type: application/json' -X POST $BASE/api/booking -d "{
 \"name\":\"حاجز اختبار\",\"email\":\"booker@example.com\",\"phone\":\"01098765432\",
 \"type\":\"استشارة قانونية عامة\",\"channel\":\"مكالمة هاتفية\",\"date\":\"$SLOTD\",\"time\":\"11:00\",\"details\":\"موضوع اختباري لمراجعة عقد توريد مع مورد خارجي\"}")
BID=$($PSQL "select id from bookings where email='booker@example.com' order by created_at desc limit 1")
if [ -n "$BID" ]; then ok "أُنشئ الحجز $BID"; else bad "لم يُنشأ حجز: $B"; fi
check "الموعد محجوز" "$(curl -sk "$BASE/api/booking/availability?date=$SLOTD" | grep -c '11:00')" "1"

C=$(code /api/admin/bookings "{\"id\":\"$BID\",\"status\":\"completed\"}")
check "الإنهاء قبل التأكيد مسموح (انتقال صالح)" "$C" "200"
C=$(code /api/admin/bookings "{\"id\":\"$BID\",\"status\":\"completed\"}")
check "لا تكرار لنفس الحالة" "$C" "409"
check "الموعد تحرّر بعد الإنهاء" "$(curl -sk "$BASE/api/booking/availability?date=$SLOTD" | grep -c '11:00')" "0"

echo
echo "── 6) سحب منتج من البيع ──"
C=$(code /api/admin/products '{"slug":"contract-templates-pack","published":false,"note":"مراجعة"}')
check "السحب ناجح" "$C" "200"
check "العلامة في القاعدة" "$($PSQL "select published from product_flags where slug='contract-templates-pack'")" "f"
O2=$(curl -sk -o "$WORK/chk.json" -w '%{http_code}' -H 'Content-Type: application/json' -X POST $BASE/api/checkout -d '{
 "name":"عميل","email":"b2@example.com","phone":"01012345678","method":"manual",
 "items":[{"slug":"contract-templates-pack","quantity":1}]}')
check "الشراء مرفوض على الخادم بعد السحب" "$O2" "400"
curl -sk $BASE/ar/store > "$WORK/store.html"
grep -q 'قريباً' "$WORK/store.html" && ok "المتجر يُظهره كغير متاح" || bad "المتجر ما زال يعرضه للبيع"

C=$(code /api/admin/products '{"slug":"contract-templates-pack","published":true}')
check "إعادة النشر" "$C" "200"
O3=$(curl -sk -o /dev/null -w '%{http_code}' -H 'Content-Type: application/json' -X POST $BASE/api/checkout -d '{
 "name":"عميل","email":"b3@example.com","phone":"01012345678","method":"manual",
 "items":[{"slug":"contract-templates-pack","quantity":1}]}')
check "الشراء متاح بعد إعادة النشر" "$O3" "200"

C=$(code /api/admin/products '{"slug":"nope-not-a-product","published":true}')
check "منتج غير موجود" "$C" "404"

echo
echo "── 7) الأثر والسجلّات ──"
AUD=$($PSQL "select count(*) from admin_audit where actor_email='aboelezzlawfirm@gmail.com'")
if [ "$AUD" -ge 6 ]; then ok "سجلّ التدقيق يحتوي $AUD إجراءً"; else bad "سجلّ التدقيق ناقص: $AUD"; fi
$PSQL "select action from admin_audit order by id" > "$WORK/actions.txt"
for a in order.confirm-transfer order.refund booking.completed product.unpublish product.publish admin.login.success admin.login.denied; do
  grep -qx "$a" "$WORK/actions.txt" && ok "أثر: $a" || bad "أثر مفقود: $a"
done
DENIED=$($PSQL "select count(*) from admin_audit where action='admin.login.denied'")
if [ "$DENIED" -ge 1 ]; then ok "محاولة الدخول غير المصرَّحة مسجَّلة"; else bad "لم تُسجَّل محاولة الدخول"; fi

NL=$($PSQL "select count(*) from notification_log")
if [ "$NL" -ge 6 ]; then ok "سجلّ الإشعارات يحتوي $NL قيداً"; else bad "سجلّ الإشعارات ناقص: $NL"; fi
$PSQL "select distinct kind from notification_log" > "$WORK/kinds.txt"
for k in contact booking order-created payment-succeeded; do
  grep -qx "$k" "$WORK/kinds.txt" || echo "     (لا قيد لنوع $k — قد لا يكون شُغّل في هذا الاختبار)"
done
grep -qx booking "$WORK/kinds.txt" && ok "قيد إشعار الحجز" || bad "لا قيد لإشعار الحجز"
grep -qx order-created "$WORK/kinds.txt" && ok "قيد إشعار الطلب" || bad "لا قيد لإشعار الطلب"
FAILED=$($PSQL "select count(*) from notification_log where ok=false")
if [ "$FAILED" -ge 1 ]; then ok "فشل القنوات غير المضبوطة مسجَّل ($FAILED)"; else bad "فشل القنوات لم يُسجَّل"; fi

echo
echo "── 8) السجلّات تظهر في اللوحة ──"
curl -sk -b "$JAR_DIR/owner.jar" $BASE/ar/admin/audit > "$WORK/audit.html"
grep -q 'تأكيد تحويل بنكي' "$WORK/audit.html" && ok "صفحة التدقيق تُظهر الإجراء" || bad "صفحة التدقيق لا تُظهره"
curl -sk -b "$JAR_DIR/owner.jar" $BASE/ar/admin/notifications?only=failures > "$WORK/notif.html"
grep -q 'فشل' "$WORK/notif.html" && ok "صفحة الإشعارات تُظهر الفشل" || bad "صفحة الإشعارات لا تُظهر الفشل"
curl -sk -b "$JAR_DIR/owner.jar" $BASE/ar/admin/orders > "$WORK/ord.html"
grep -q "$REF" "$WORK/ord.html" && ok "صفحة الطلبات تُظهر الطلب" || bad "الطلب غائب عن اللوحة"
curl -sk -b "$JAR_DIR/owner.jar" $BASE/ar/admin/customers > "$WORK/cust.html"
grep -q 'buyer@example.com' "$WORK/cust.html" && ok "صفحة العملاء تجمع العميل" || bad "العميل غائب"

echo
echo "── 9) الخروج ──"
curl -sk -b "$JAR_DIR/owner.jar" -c "$JAR_DIR/out.jar" -o /dev/null -X POST $BASE/api/admin/logout
AFTER=$(curl -sk -b "$JAR_DIR/out.jar" -o /dev/null -w '%{http_code}' $BASE/ar/admin)
check "بعد الخروج لا وصول" "$AFTER" "307"

echo
echo "════ ناجح: $PASS — فاشل: $FAIL ════"
[ "$FAIL" -eq 0 ]
