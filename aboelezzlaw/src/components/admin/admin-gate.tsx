import { redirect } from 'next/navigation';
import { requireOwner } from '@/lib/admin';
import { Card } from '@/components/ui/card';
import { Container } from '@/components/ui/container';

/**
 * بوّابة صفحات اللوحة.
 *
 * تُنادى في أعلى **كل** صفحة إدارية قبل أي استعلام. الترتيب مقصود: لا
 * تُقرأ بيانات عميل واحد قبل التحقّق من التفويض، فحتى لو فشل الرسم لم
 * تُحمَّل البيانات أصلاً.
 */
export async function ownerOrRedirect(): Promise<string> {
  const check = await requireOwner();

  if (check.ok) return check.email;

  if (check.reason === 'unconfigured') {
    // لا تحويل: مشكلة إعداد على الخادم وليست مشكلة دخول
    throw new AdminUnconfigured();
  }

  // بريد غير مصرَّح أو بلا جلسة ⇒ صفحة الدخول. لا نكشف أيّ الحالتين.
  redirect('/admin/login');
}

export class AdminUnconfigured extends Error {
  constructor() {
    super('OWNER_EMAILS غير مضبوط');
    this.name = 'AdminUnconfigured';
  }
}

export function AdminUnconfiguredNotice() {
  return (
    <Container size="narrow" className="py-20">
      <Card className="border-amber-200 bg-amber-50">
        <h1 className="mb-4 text-xl text-amber-900">لوحة الإدارة غير مهيّأة</h1>
        <p className="mb-4 text-sm leading-8 text-amber-900/90">
          لتشغيل اللوحة يلزم ضبط متغيّر البيئة <code className="font-mono">OWNER_EMAILS</code> على
          بريد المالك (أو عدّة عناوين مفصولة بفاصلة) من إعدادات الاستضافة، ثم إعادة النشر.
        </p>
        <p className="text-sm leading-8 text-amber-900/90">
          كما يلزم ضبط <code className="font-mono">AUTH_SECRET</code> و{' '}
          <code className="font-mono">DATABASE_URL</code> وبريد صادر — وإلا لا يمكن إصدار جلسة
          إدارية ولا تسجيل أثر الإجراءات.
        </p>
      </Card>
    </Container>
  );
}
