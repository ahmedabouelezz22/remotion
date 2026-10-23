import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  Calculator,
  CheckCircle2,
  FileText,
  MessageSquare,
  Scale,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { ButtonLink } from '@/components/ui/button';
import { Badge, Card } from '@/components/ui/card';
import { Container, Section, SectionHeading } from '@/components/ui/container';
import { sortedArticles } from '@/content/blog';
import { faqs } from '@/content/faq';
import { products } from '@/content/products';
import { services } from '@/content/services';
import { site, waLink } from '@/content/site';
import { formatDateAr, formatPrice } from '@/lib/utils';

const iconMap = {
  building: Building2,
  'file-text': FileText,
  calculator: Calculator,
  users: Users,
  scale: Scale,
  'shield-check': ShieldCheck,
} as const;

const pillars = [
  {
    title: 'رأي مكتوب ومُسبَّب',
    body: 'كل استشارة تنتهي بمستند مكتوب يبيّن الرأي وسنده وبدائله، لا بإجابة شفهية تُنسى.',
  },
  {
    title: 'تقدير للكلفة قبل البدء',
    body: 'يُحدَّد نطاق العمل والأتعاب ومدة التنفيذ كتابةً قبل الشروع، فلا مفاجآت في الفاتورة.',
  },
  {
    title: 'قراءة اقتصادية للمسألة',
    body: 'الحل القانوني الصحيح ليس دائماً الأجدى مالياً. نضع الكلفة والزمن في ميزان القرار.',
  },
  {
    title: 'سرّية ملتزمة',
    body: 'المستندات لا تُتداول خارج المكتب، ويمكن توقيع اتفاقية عدم إفصاح قبل إرسال أي ورقة.',
  },
];

export default function HomePage() {
  const featuredProducts = products.filter((product) => product.featured).slice(0, 3);
  const latestArticles = sortedArticles.slice(0, 3);

  return (
    <>
      {/* ── القسم الافتتاحي ── */}
      <section className="relative overflow-hidden bg-navy-900 text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 18% 22%, #c9a227 0, transparent 42%), radial-gradient(circle at 82% 72%, #ffffff 0, transparent 38%)',
          }}
        />
        <Container size="wide" className="relative py-20 sm:py-28">
          <div className="grid items-center gap-14 lg:grid-cols-[1.15fr_1fr]">
            <div>
              <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold-500/35 bg-gold-500/10 px-4 py-1.5 text-xs font-bold tracking-wide text-gold-300">
                <ShieldCheck className="h-3.5 w-3.5" />
                خدمات قانونية عن بُعد في جميع أنحاء العالم العربي
              </span>

              <h1 className="text-3xl leading-[1.35] sm:text-4xl lg:text-[2.85rem]">
                خدمات قانونية متخصصة
                <span className="block text-gold-400">عن بُعد، وبنفس دقّة الحضور</span>
              </h1>

              <p className="mt-6 max-w-xl text-[1.05rem] leading-9 text-navy-100/85">
                صياغة ومراجعة العقود، والتقاضي والنزاعات، وخدمات الشركات والشركات الناشئة، وقانون
                العمل، والامتثال الرقمي. نطاق العمل والأتعاب يُحدَّدان كتابةً قبل البدء، والتسليم
                رأي مكتوب قابل للتنفيذ.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <ButtonLink href="/booking" variant="gold" size="lg">
                  احجز استشارة
                  <ArrowLeft className="h-4 w-4" />
                </ButtonLink>
                <ButtonLink
                  href={waLink('السلام عليكم، أود الاستفسار عن خدماتكم القانونية.')}
                  external
                  variant="whatsapp"
                  size="lg"
                >
                  <MessageSquare className="h-4 w-4" />
                  تواصل فوري عبر واتساب
                </ButtonLink>
              </div>

              <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-white/12 pt-8">
                {[
                  { value: '+1000', label: 'خدمة قانونية منجزة' },
                  { value: '2', label: 'ولايتان قضائيتان' },
                  { value: '24س', label: 'مدة الرد المعتادة' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <dt className="sr-only">{stat.label}</dt>
                    <dd>
                      <span className="numeric block font-display text-2xl font-black text-gold-400" dir="ltr">
                        {stat.value}
                      </span>
                      <span className="mt-1 block text-xs leading-6 text-navy-100/65">
                        {stat.label}
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <Card className="border-white/12 bg-white/[0.06] backdrop-blur-sm">
              <h2 className="mb-1 text-lg font-extrabold text-white">كيف نعمل</h2>
              <p className="mb-6 text-sm text-navy-100/70">أربع خطوات واضحة من أول تواصل.</p>
              <ol className="space-y-5">
                {[
                  { step: '١', title: 'تواصل وتحديد النطاق', body: 'تشرح المسألة، ونحدّد ما نحتاجه من مستندات.' },
                  { step: '٢', title: 'عرض مكتوب', body: 'نطاق العمل والأتعاب والمدة — كتابةً قبل البدء.' },
                  { step: '٣', title: 'الدراسة والتنفيذ', body: 'تحليل المستندات وإعداد الرأي أو المستند المطلوب.' },
                  { step: '٤', title: 'التسليم والمتابعة', body: 'مستند مكتوب وجلسة مناقشة للخطوات التالية.' },
                ].map((item) => (
                  <li key={item.step} className="flex gap-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold-500 font-display text-sm font-black text-navy-950">
                      {item.step}
                    </span>
                    <div>
                      <h3 className="text-[0.95rem] font-bold text-white">{item.title}</h3>
                      <p className="mt-1 text-sm leading-7 text-navy-100/70">{item.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Card>
          </div>
        </Container>
      </section>

      {/* ── الخدمات ── */}
      <Section>
        <Container size="wide">
          <SectionHeading
            eyebrow="مجالات العمل"
            title="خدمات مبنيّة على تخصّص لا على تعميم"
            description="كل خدمة لها نطاق محدّد ومخرجات معلومة مسبقاً، حتى تعرف ما ستتسلّمه قبل أن تبدأ."
          />
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => {
              const Icon = iconMap[service.icon as keyof typeof iconMap] ?? Scale;
              return (
                <Card key={service.slug} hover className="flex flex-col">
                  <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-navy-900/6 text-navy-900">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mb-2.5 text-lg text-navy-900">{service.title}</h3>
                  <p className="mb-6 flex-1 text-sm leading-8 text-slate-600">{service.short}</p>
                  <Link
                    href={`/services/${service.slug}`}
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-navy-900 transition-colors hover:text-gold-600"
                  >
                    تفاصيل الخدمة
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </Link>
                </Card>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* ── المنهج ── */}
      <Section tone="sand">
        <Container size="wide">
          <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr]">
            <SectionHeading
              align="start"
              eyebrow="المنهج"
              title="ما الذي يميّز العمل هنا"
              description="الفارق ليس في معرفة النصوص — النصوص متاحة للجميع. الفارق في ترتيب الأولويات وتقدير الكلفة."
            />
            <div className="grid gap-5 sm:grid-cols-2">
              {pillars.map((pillar) => (
                <Card key={pillar.title} className="bg-white">
                  <CheckCircle2 className="mb-3 h-6 w-6 text-gold-600" />
                  <h3 className="mb-2 text-base text-navy-900">{pillar.title}</h3>
                  <p className="text-sm leading-8 text-slate-600">{pillar.body}</p>
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* ── المتجر ── */}
      <Section>
        <Container size="wide">
          <SectionHeading
            eyebrow="المتجر"
            title="خدمات ومنتجات بأسعار معلومة"
            description="اطّلع على النطاق والسعر قبل التواصل — دون تفاوض أوّلي على الأتعاب."
          />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {featuredProducts.map((product) => (
              <Card key={product.slug} hover className="flex flex-col">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <Badge tone="muted">{product.category}</Badge>
                  {product.badge ? <Badge tone="gold">{product.badge}</Badge> : null}
                </div>
                <h3 className="mb-2.5 text-lg text-navy-900">{product.name}</h3>
                <p className="mb-6 flex-1 text-sm leading-8 text-slate-600">{product.summary}</p>
                <div className="mb-5 flex items-baseline gap-2">
                  <span className="numeric font-display text-2xl font-black text-navy-900">
                    {formatPrice(product.price, product.currency)}
                  </span>
                  {product.billingPeriod ? (
                    <span className="text-xs font-semibold text-slate-500">
                      / {product.billingPeriod}
                    </span>
                  ) : null}
                </div>
                <ButtonLink href={`/store/${product.slug}`} variant="outline" size="sm">
                  التفاصيل
                </ButtonLink>
              </Card>
            ))}
          </div>
          <div className="mt-10 text-center">
            <ButtonLink href="/store" variant="primary">
              تصفّح المتجر بالكامل
              <ArrowLeft className="h-4 w-4" />
            </ButtonLink>
          </div>
        </Container>
      </Section>

      {/* ── المدونة ── */}
      <Section tone="sand">
        <Container size="wide">
          <SectionHeading
            eyebrow="المدونة"
            title="تحليلات قانونية موثّقة بمصادرها"
            description="مقالات أصلية تُحيل إلى نصوصها ومصادرها الرسمية بروابط مباشرة."
          />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {latestArticles.map((article) => (
              <Link key={article.slug} href={`/blog/${article.slug}`} className="group block">
                <Card hover className="flex h-full flex-col bg-white">
                  <Badge tone="navy">{article.category}</Badge>
                  <h3 className="mt-4 mb-2.5 text-lg leading-8 text-navy-900 transition-colors group-hover:text-gold-600">
                    {article.title}
                  </h3>
                  <p className="mb-5 flex-1 text-sm leading-8 text-slate-600">{article.excerpt}</p>
                  <time className="numeric text-xs font-semibold text-slate-400" dateTime={article.publishedAt}>
                    {formatDateAr(article.publishedAt)}
                  </time>
                </Card>
              </Link>
            ))}
          </div>
          <div className="mt-10 text-center">
            <ButtonLink href="/blog" variant="outline">
              كل المقالات
            </ButtonLink>
          </div>
        </Container>
      </Section>

      {/* ── الأسئلة الشائعة ── */}
      <Section>
        <Container size="narrow">
          <SectionHeading eyebrow="أسئلة شائعة" title="ما يسأل عنه معظم العملاء" />
          <div className="mt-12 space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-sand-200 bg-white px-6 py-5 transition-colors open:border-gold-400/60"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-navy-900">
                  {faq.question}
                  <span className="shrink-0 text-xl text-gold-600 transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-4 text-[0.95rem] leading-8 text-slate-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </Container>
      </Section>

      {/* ── دعوة للتواصل ── */}
      <Section tone="navy">
        <Container size="narrow" className="text-center">
          <h2 className="text-2xl text-white sm:text-3xl">لديك مسألة تحتاج رأياً قانونياً؟</h2>
          <p className="mx-auto mt-5 max-w-xl leading-9 text-navy-100/80">
            احجز استشارة أو راسلنا مباشرة. سنوضّح لك نطاق العمل والأتعاب والمدة قبل أي التزام.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/booking" variant="gold" size="lg">
              احجز استشارة
            </ButtonLink>
            <ButtonLink href="/contact" variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-navy-900">
              اتصل بنا
            </ButtonLink>
          </div>
          <p className="numeric mt-8 text-sm text-navy-100/60" dir="ltr">
            {site.contact.phoneLocal} · {site.contact.email}
          </p>
        </Container>
      </Section>
    </>
  );
}
