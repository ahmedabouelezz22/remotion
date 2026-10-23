import type { Metadata } from 'next';
import { CalendarDays, FileCheck2, MessageSquare, Timer } from 'lucide-react';
import { BookingForm } from '@/components/booking-form';
import { PageHeader } from '@/components/page-header';
import { Card } from '@/components/ui/card';
import { Container, Section } from '@/components/ui/container';
import { site } from '@/content/site';

export const metadata: Metadata = {
  title: 'حجز استشارة',
  description:
    'احجز موعد استشارة قانونية مع مكتب أحمد أبو العز — اختر التاريخ والموعد ووسيلة التواصل، ويصلك تأكيد خلال يوم عمل واحد.',
  alternates: { canonical: '/booking' },
};

const steps = [
  {
    icon: CalendarDays,
    title: 'اختر الموعد',
    body: 'حدّد التاريخ والساعة من المواعيد المتاحة ضمن أيام العمل.',
  },
  {
    icon: FileCheck2,
    title: 'أرسل المستندات',
    body: 'أرسل ما لديك من مستندات قبل الجلسة لتُدرس مسبقاً.',
  },
  {
    icon: MessageSquare,
    title: 'الجلسة',
    body: 'مناقشة مركّزة على الرأي والخيارات لا على جمع المعلومات.',
  },
  {
    icon: Timer,
    title: 'الملخّص',
    body: 'تتسلّم ملخّصاً مكتوباً بالرأي والخطوات التالية.',
  },
];

export default function BookingPage() {
  return (
    <>
      <PageHeader
        eyebrow="حجز موعد"
        title="احجز استشارة قانونية"
        description={`املأ البيانات واختر الموعد المناسب. ${site.workingHours.label}`}
      />

      <Section>
        <Container size="wide">
          <div className="grid gap-12 lg:grid-cols-[1.35fr_1fr]">
            <Card className="order-2 p-7 sm:p-9 lg:order-1">
              <h2 className="mb-2 text-xl text-navy-900">بيانات الحجز</h2>
              <p className="mb-8 text-sm leading-8 text-slate-600">
                طلب الحجز يصل فوراً إلى المكتب عبر البريد وواتساب، ويُثبَّت الموعد بعد التأكيد.
              </p>
              <BookingForm />
            </Card>

            <div className="order-1 space-y-4 lg:order-2">
              <Card className="bg-navy-900 text-white">
                <h2 className="mb-5 text-lg text-white">كيف تسير الاستشارة</h2>
                <ol className="space-y-5">
                  {steps.map((step, index) => {
                    const Icon = step.icon;
                    return (
                      <li key={step.title} className="flex gap-4">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-500 text-navy-950">
                          <Icon className="h-5 w-5" />
                        </span>
                        <div>
                          <h3 className="numeric text-[0.95rem] font-bold text-white">
                            {index + 1}. {step.title}
                          </h3>
                          <p className="mt-1 text-sm leading-7 text-navy-100/70">{step.body}</p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </Card>

              <Card className="border-gold-400/50 bg-gold-500/8">
                <h3 className="mb-2.5 text-base text-navy-900">ملاحظات مهمة</h3>
                <ul className="space-y-2.5 text-sm leading-7 text-slate-700">
                  <li>• الحجز طلب مبدئي ولا يصبح نهائياً إلا بتأكيد المكتب.</li>
                  <li>• المواعيد المعروضة بتوقيت القاهرة.</li>
                  <li>• لإلغاء الموعد أو تعديله، تواصل معنا قبل 24 ساعة على الأقل.</li>
                  <li>• لا تُرسل مستندات سرّية قبل الاتفاق على وسيلة نقل آمنة.</li>
                </ul>
              </Card>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
