import type { Metadata } from 'next';
import { CheckoutForm, type ProviderOption } from '@/components/checkout-form';
import { PageHeader } from '@/components/page-header';
import { Card } from '@/components/ui/card';
import { Container, Section } from '@/components/ui/container';
import { enabledProviders } from '@/lib/payments';

export const metadata: Metadata = {
  title: 'إتمام الطلب',
  description: 'أكمل بيانات الطلب واختر وسيلة الدفع المناسبة.',
  robots: { index: false, follow: false },
};

// المزوّدون المتاحون يعتمدون على متغيّرات البيئة، فلا يصلح توليد الصفحة مسبقاً
export const dynamic = 'force-dynamic';

export default function CheckoutPage() {
  const providers: ProviderOption[] = enabledProviders().map((provider) => ({
    id: provider.id,
    label: provider.label,
    description: provider.description,
  }));

  return (
    <>
      <PageHeader
        eyebrow="إتمام الطلب"
        title="بيانات الطلب والدفع"
        description="خطوة واحدة تفصلك عن إتمام الطلب. بياناتك تُستخدم لتنفيذ الطلب والتواصل معك بشأنه فقط."
      />

      <Section>
        <Container size="wide">
          {providers.length === 0 ? (
            <Card className="mx-auto max-w-xl border-amber-200 bg-amber-50 text-center">
              <h2 className="mb-2.5 text-lg text-amber-900">وسائل الدفع غير مهيّأة بعد</h2>
              <p className="text-sm leading-8 text-amber-800">
                لم يُضبط أي مزوّد دفع في متغيّرات البيئة. راجِع ملف README لضبط بيانات التحويل
                البنكي على الأقل — وهو خيار يعمل فوراً بلا حساب بوابة دفع.
              </p>
            </Card>
          ) : (
            <CheckoutForm providers={providers} />
          )}
        </Container>
      </Section>
    </>
  );
}
