import type { Metadata } from 'next';
import { CheckCircle2 } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { ButtonLink } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Container, Section } from '@/components/ui/container';
import { site, waLink } from '@/content/site';
import { ClearCartOnMount } from '@/components/clear-cart-on-mount';

export const metadata: Metadata = {
  title: 'تم استلام الطلب',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; provider?: string }>;
}) {
  const { ref } = await searchParams;

  return (
    <>
      <ClearCartOnMount />

      <PageHeader
        eyebrow="تم بنجاح"
        title="استلمنا طلبك"
        description="وصلنا إشعار الدفع وسنبدأ التنفيذ فوراً. تفاصيل الطلب وصلت إلى بريدك."
      />

      <Section>
        <Container size="narrow">
          <Card className="border-emerald-200 bg-emerald-50 text-center">
            <CheckCircle2 className="mx-auto mb-5 h-16 w-16 text-emerald-600" />
            <h2 className="mb-3 text-2xl text-emerald-900">شكراً لثقتك</h2>

            {ref ? (
              <p className="mb-6 text-sm text-emerald-800">
                رقم طلبك:{' '}
                <strong className="numeric rounded-lg bg-white px-3 py-1 font-mono text-navy-900">
                  {ref}
                </strong>
                <br />
                <span className="mt-2 block">احتفظ بهذا الرقم للرجوع إليه في أي مراسلة.</span>
              </p>
            ) : null}

            <div className="mx-auto mb-8 max-w-md space-y-3 rounded-xl border border-emerald-200 bg-white p-6 text-right text-sm leading-8 text-slate-700">
              <p className="font-extrabold text-navy-900">ما يحدث الآن:</p>
              <p>◾ يصلك بريد تأكيد يتضمّن تفاصيل الطلب.</p>
              <p>◾ المنتجات الرقمية: يصلك رابط تحميل صالح 72 ساعة.</p>
              <p>◾ الخدمات: نتواصل معك خلال يوم عمل لبدء التنفيذ.</p>
              <p>◾ الاستشارات: احجز موعدك من صفحة حجز الاستشارة.</p>
              <p>◾ المطبوعات: تُشحن خلال 3–7 أيام عمل.</p>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <ButtonLink href="/booking" variant="gold">
                حجز موعد الاستشارة
              </ButtonLink>
              <ButtonLink
                href={waLink(ref ? `السلام عليكم، بخصوص طلبي رقم ${ref}` : undefined)}
                external
                variant="whatsapp"
              >
                متابعة على واتساب
              </ButtonLink>
            </div>

            <p className="numeric mt-8 text-xs text-slate-500" dir="ltr">
              {site.contact.phoneLocal} · {site.contact.email}
            </p>
          </Card>
        </Container>
      </Section>
    </>
  );
}
