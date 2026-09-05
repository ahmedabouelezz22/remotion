import type { Metadata } from 'next';
import { CreditCard, Lock, Receipt, Truck } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { StoreGrid } from '@/components/store-grid';
import { Card } from '@/components/ui/card';
import { Container, Section } from '@/components/ui/container';

export const metadata: Metadata = {
  title: 'المتجر القانوني',
  description:
    'خدمات قانونية بأسعار معلومة: استشارات، صياغة ومراجعة عقود، مذكّرات، لوائح داخلية، اتفاقيات سرّية، نماذج جاهزة، وباقات شهرية للشركات.',
  alternates: { canonical: '/store' },
};

const assurances = [
  { icon: Receipt, title: 'سعر معلوم مسبقاً', body: 'نطاق كل خدمة وسعرها معروضان قبل الشراء — لا تفاوض أوّلي على الأتعاب.' },
  { icon: Lock, title: 'دفع آمن', body: 'الدفع يتم على صفحة البوابة نفسها؛ لا تُخزَّن بيانات بطاقتك على هذا الموقع إطلاقاً.' },
  { icon: CreditCard, title: 'وسائل متعددة', body: 'تحويل بنكي وإنستاباي ومحافظ إلكترونية و PayPal، والبطاقات عبر Paymob عند تفعيلها.' },
  { icon: Truck, title: 'تسليم واضح', body: 'المنتجات الرقمية تُحمَّل فوراً، والخدمات تبدأ خلال يوم عمل، والمطبوعات تُشحن خلال 3–7 أيام.' },
];

export default function StorePage() {
  return (
    <>
      <PageHeader
        eyebrow="المتجر"
        title="خدمات قانونية بأسعار معلومة"
        description="اختر الخدمة التي تناسبك واطّلع على نطاقها ومخرجاتها وسعرها قبل الشراء. الدفع أونلاين، وتنفيذ الخدمة يبدأ فور تأكيد الدفع."
      />

      <Section>
        <Container size="wide">
          <div className="mb-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {assurances.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title} className="bg-sand-100">
                  <Icon className="mb-3 h-6 w-6 text-gold-600" />
                  <h2 className="mb-1.5 text-sm font-extrabold text-navy-900">{item.title}</h2>
                  <p className="text-xs leading-7 text-slate-600">{item.body}</p>
                </Card>
              );
            })}
          </div>

          <StoreGrid />
        </Container>
      </Section>
    </>
  );
}
