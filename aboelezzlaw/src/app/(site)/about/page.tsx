import type { Metadata } from 'next';
import Image from 'next/image';
import { Award, BookOpen, Building2, GraduationCap, Globe, Shield } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { ButtonLink } from '@/components/ui/button';
import { Badge, Card } from '@/components/ui/card';
import { Container, Section, SectionHeading } from '@/components/ui/container';
import { site } from '@/content/site';

export const metadata: Metadata = {
  title: 'من نحن',
  description:
    'تعرّف على أحمد أبو العز — مستشار قانوني متخصص في القانون التجاري وقانون الشركات والتقاضي، وباحث دكتوراه في القانون.',
  alternates: { canonical: '/about' },
};

/**
 * ملاحظة للمالك: المحتوى أدناه منقول من موقعك الحالي.
 * راجِعه وحدّثه كلما تغيّرت سيرتك المهنية، واحذف أي جهة لا ترغب في ذكرها.
 */

const credentials = [
  { icon: GraduationCap, title: 'ماجستير في القانون', body: 'مع دبلومات متخصصة متعددة في مجالات القانون التجاري والشركات.' },
  { icon: BookOpen, title: 'باحث دكتوراه في القانون', body: 'بحث يتناول الأطر التنظيمية والاقتصادية، بمنهج يجمع التحليل القانوني بالتحليل الاقتصادي.' },
  { icon: Award, title: 'أكثر من 1000 خدمة قانونية', body: 'صياغة ومراجعة عقود، ومذكّرات، وتمثيل، واستشارات منجزة لعملاء أفراد ومؤسسات.' },
  { icon: Globe, title: 'دورات دولية', body: 'دورات من جامعات دولية، منها جامعة بنسلفانيا وجامعات في لندن ولوند.' },
  { icon: Building2, title: 'عمل مع مؤسسات كبرى', body: 'تقديم الاستشارة القانونية لمؤسسات وشركات في مصر والمملكة العربية السعودية.' },
  { icon: Shield, title: 'إتقان العربية والإنجليزية', body: 'صياغة ومراجعة العقود والمذكّرات باللغتين، بما يخدم التعاملات عبر الحدود.' },
];

const clients = ['اتصالات مصر', 'إنفينيتي', 'مؤسسة بهية', 'مؤسسات في المملكة العربية السعودية'];

const expertise = [
  'جميع أنواع العقود',
  'التقاضي والنزاعات',
  'الخدمات القانونية للشركات',
  'عقود العمل',
  'اتفاقيات السرّية (NDA)',
  'مذكّرات التفاهم (MOU)',
  'اللوائح الداخلية للشركات',
  'المذكّرات القانونية',
  'التمثيل أمام المحاكم والجهات',
  'نزاعات الشركات',
  'القطاع المصرفي والاستثماري',
  'النزاعات التجارية والمدنية',
  'الأخطاء الطبية',
  'منازعات العمل',
  'القانون الإداري',
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="من نحن"
        title="عن أحمد أبو العز"
        description="مستشار قانوني ذو خبرة واسعة في تقديم الخدمات القانونية الشاملة، مع تخصّص في صياغة العقود والقانون التجاري وقانون الشركات والتقاضي وحل النزاعات."
      />

      <Section>
        <Container size="wide">
          <div className="grid items-start gap-12 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-sm">
              <Image
                src={site.brand.founderPhoto}
                alt="أحمد أبو العز — المؤسس والمستشار القانوني"
                width={720}
                height={900}
                className="h-auto w-full object-cover"
                priority
              />
            </div>

            <div className="article-body">
              <h2>مستشار قانوني متخصص</h2>
              <p>
                يقدّم المكتب خدمات قانونية متخصصة عن بُعد لعملاء في مصر والمملكة العربية السعودية
                وسائر المنطقة، بما يوفّر على الموكّل عناء الحضور الشخصي دون أن ينتقص من دقّة العمل
                أو سرّيته.
              </p>

              <h2>الفكرة التي يقوم عليها العمل</h2>
              <p>
                كثير من الاستشارات القانونية تُقدَّم بوصفها إجابة عن سؤال «ما الحكم؟» وحده. غير أن
                صاحب القرار — شركةً كان أو فرداً — يحتاج إلى إجابة عن سؤالين متلازمين: ما الحكم
                القانوني؟ وما كلفة كل خيار متاح في ضوئه؟
              </p>
              <p>
                الجمع بين الممارسة القانونية والبحث الأكاديمي يجعل هذا السؤال المزدوج جزءاً من
                منهج العمل لا إضافةً عليه. فالحل الذي يصمد قانوناً ولا يصمد اقتصادياً ليس حلاً
                عملياً، والعكس صحيح.
              </p>

              <h2>الالتزام المهني</h2>
              <p>
                السرّية المهنية التزام قانوني لا خيار تجاري. لا تُفصح المستندات ولا محتوى الاستشارة
                لأي طرف ثالث إلا بموافقة كتابية من الموكّل أو تنفيذاً لالتزام قانوني، ويمكن توقيع
                اتفاقية عدم إفشاء قبل إرسال أي مستند.
              </p>
              <p>
                كما تُحدَّد الأتعاب ونطاق العمل ومدة التنفيذ كتابةً قبل الشروع في أي عمل، فلا تنشأ
                مفاجآت بعد التسليم.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="sand">
        <Container size="wide">
          <SectionHeading eyebrow="المؤهلات" title="الخلفية العلمية والمهنية" />
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {credentials.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title} className="bg-white">
                  <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-navy-900/6 text-navy-900">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mb-2.5 text-lg text-navy-900">{item.title}</h3>
                  <p className="text-sm leading-8 text-slate-600">{item.body}</p>
                </Card>
              );
            })}
          </div>
        </Container>
      </Section>

      <Section>
        <Container size="wide">
          <SectionHeading
            eyebrow="جهات تعاملنا معها"
            title="ثقة مؤسسات وشركات"
            description="جهات قُدِّمت لها استشارات أو خدمات قانونية. تُذكر للتعريف بنطاق الخبرة، ولا يتضمّن ذلك إفشاء أي معلومة تخصّها."
          />
          <div className="mx-auto mt-12 flex max-w-3xl flex-wrap justify-center gap-3">
            {clients.map((client) => (
              <span
                key={client}
                className="rounded-xl border border-sand-200 bg-white px-6 py-4 text-sm font-bold text-navy-900 shadow-sm"
              >
                {client}
              </span>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="sand">
        <Container size="wide">
          <SectionHeading eyebrow="مجالات الخبرة" title="ما نتعامل معه" />
          <div className="mt-12 flex flex-wrap justify-center gap-2.5">
            {expertise.map((item) => (
              <Badge key={item} tone="navy">
                {item}
              </Badge>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="navy">
        <Container size="narrow" className="text-center">
          <h2 className="text-2xl text-white sm:text-3xl">هل نبدأ بمسألتك؟</h2>
          <p className="mx-auto mt-5 max-w-xl leading-9 text-navy-100/80">
            احجز استشارة لمناقشة مسألتك، أو تصفّح المتجر لمعرفة نطاق كل خدمة وسعرها مسبقاً.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/booking" variant="gold" size="lg">
              احجز استشارة
            </ButtonLink>
            <ButtonLink
              href="/store"
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-navy-900"
            >
              المتجر
            </ButtonLink>
          </div>
        </Container>
      </Section>
    </>
  );
}
