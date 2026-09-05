import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, CheckCircle2, Clock, FileText, Info } from 'lucide-react';
import { AddToCart } from '@/components/add-to-cart';
import { PageHeader } from '@/components/page-header';
import { ButtonLink } from '@/components/ui/button';
import { Badge, Card } from '@/components/ui/card';
import { Container, Section } from '@/components/ui/container';
import { getProduct, kindLabels, products, SHIPPING_FLAT_RATE } from '@/content/products';
import { site, waLink } from '@/content/site';
import { formatPrice } from '@/lib/utils';

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: 'المنتج غير موجود' };

  return {
    title: product.name,
    description: product.summary,
    alternates: { canonical: `/store/${product.slug}` },
    openGraph: { title: product.name, description: product.summary },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const related = products
    .filter((item) => item.slug !== product.slug && item.category === product.category)
    .slice(0, 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.summary,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency,
      availability: 'https://schema.org/InStock',
      url: `${site.url}/store/${product.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger -- بيانات منظَّمة مولَّدة من كتالوج ثابت
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHeader eyebrow={product.category} title={product.name} description={product.summary} />

      <Section>
        <Container size="wide">
          <div className="grid gap-10 lg:grid-cols-[1.35fr_1fr]">
            <div>
              <div className="article-body">
                <h2>تفاصيل الخدمة</h2>
                <p>{product.description}</p>
              </div>

              <h2 className="mt-12 mb-5 text-xl text-navy-900">ما يشمله</h2>
              <ul className="space-y-3.5">
                {product.highlights.map((item) => (
                  <li key={item} className="flex gap-3 text-[0.95rem] leading-8 text-slate-700">
                    <CheckCircle2 className="mt-1.5 h-5 w-5 shrink-0 text-gold-600" />
                    {item}
                  </li>
                ))}
              </ul>

              {product.kind === 'digital' ? (
                <Card className="mt-10 border-emerald-200 bg-emerald-50">
                  <h3 className="mb-2 flex items-center gap-2 text-base text-emerald-900">
                    <Info className="h-5 w-5" />
                    كيف يصلك المنتج
                  </h3>
                  <p className="text-sm leading-8 text-emerald-800">
                    بعد تأكيد الدفع يصلك على بريدك رابط تحميل مؤمَّن صالح لمدة 72 ساعة. الملفات
                    الرقمية غير قابلة للاسترداد بعد التحميل بحكم طبيعتها.
                  </p>
                </Card>
              ) : null}

              {product.kind === 'physical' ? (
                <Card className="mt-10 border-sand-200 bg-sand-100">
                  <h3 className="mb-2 flex items-center gap-2 text-base text-navy-900">
                    <Info className="h-5 w-5 text-gold-600" />
                    الشحن
                  </h3>
                  <p className="text-sm leading-8 text-slate-700">
                    تُضاف أجرة شحن ثابتة قدرها{' '}
                    <strong className="numeric">{SHIPPING_FLAT_RATE} ج.م</strong> داخل مصر، ويصل
                    الطلب خلال 3–7 أيام عمل. للشحن خارج مصر تواصل معنا لتحديد الأجرة قبل الطلب.
                  </p>
                </Card>
              ) : null}

              {product.requiresBooking ? (
                <Card className="mt-10 border-gold-400/50 bg-gold-500/8">
                  <h3 className="mb-2 flex items-center gap-2 text-base text-navy-900">
                    <Clock className="h-5 w-5 text-gold-600" />
                    تحديد الموعد
                  </h3>
                  <p className="mb-4 text-sm leading-8 text-slate-700">
                    بعد إتمام الدفع، احجز موعد الجلسة من صفحة حجز الاستشارة. يمكنك أيضاً حجز الموعد
                    أولاً والدفع بعد تأكيده.
                  </p>
                  <ButtonLink href="/booking" variant="outline" size="sm">
                    الذهاب إلى صفحة الحجز
                  </ButtonLink>
                </Card>
              ) : null}
            </div>

            <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
              <Card>
                <Badge tone="muted">{kindLabels[product.kind]}</Badge>

                <div className="my-5 flex items-baseline gap-2.5">
                  <span className="numeric font-display text-3xl font-black text-navy-900">
                    {formatPrice(product.price, product.currency)}
                  </span>
                  {product.compareAtPrice ? (
                    <span className="numeric text-base text-slate-400 line-through">
                      {formatPrice(product.compareAtPrice, product.currency)}
                    </span>
                  ) : null}
                  {product.billingPeriod ? (
                    <span className="text-sm font-semibold text-slate-500">
                      / {product.billingPeriod}
                    </span>
                  ) : null}
                </div>

                <dl className="mb-6 space-y-2.5 border-y border-sand-200 py-4 text-sm">
                  {product.durationMinutes ? (
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">مدة الجلسة</dt>
                      <dd className="numeric font-bold text-navy-900">
                        {product.durationMinutes} دقيقة
                      </dd>
                    </div>
                  ) : null}
                  {product.pages ? (
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">عدد الصفحات</dt>
                      <dd className="numeric font-bold text-navy-900">{product.pages}</dd>
                    </div>
                  ) : null}
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">التصنيف</dt>
                    <dd className="font-bold text-navy-900">{product.category}</dd>
                  </div>
                </dl>

                <AddToCart product={product} />

                <p className="mt-4 text-center text-xs leading-6 text-slate-500">
                  الدفع يتم على صفحة بوابة الدفع — لا تُخزَّن بيانات بطاقتك هنا.
                </p>
              </Card>

              <Card className="bg-sand-100">
                <h3 className="mb-2.5 flex items-center gap-2 text-base text-navy-900">
                  <FileText className="h-5 w-5 text-gold-600" />
                  عندك سؤال قبل الشراء؟
                </h3>
                <p className="mb-5 text-sm leading-8 text-slate-600">
                  إن كنت غير متأكد من أن هذه الخدمة تناسب حالتك، راسلنا ووضّح مسألتك وسنرشدك إلى
                  الخيار الصحيح — ولو كان خياراً أرخص.
                </p>
                <ButtonLink
                  href={waLink(`السلام عليكم، لديّ استفسار عن: ${product.name}`)}
                  external
                  variant="whatsapp"
                  size="sm"
                >
                  استفسار على واتساب
                </ButtonLink>
              </Card>
            </div>
          </div>

          {related.length > 0 ? (
            <div className="mt-16">
              <h2 className="mb-6 text-xl text-navy-900">من نفس التصنيف</h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((item) => (
                  <Link key={item.slug} href={`/store/${item.slug}`} className="group block">
                    <Card hover className="h-full">
                      <h3 className="mb-2.5 text-base leading-8 text-navy-900 transition-colors group-hover:text-gold-600">
                        {item.name}
                      </h3>
                      <p className="mb-4 text-sm leading-7 text-slate-600">{item.summary}</p>
                      <span className="numeric font-display text-lg font-black text-navy-900">
                        {formatPrice(item.price, item.currency)}
                      </span>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          <Link
            href="/store"
            className="mt-12 inline-flex items-center gap-2 text-sm font-bold text-navy-900 transition-colors hover:text-gold-600"
          >
            <ArrowRight className="h-4 w-4" />
            العودة إلى المتجر
          </Link>
        </Container>
      </Section>
    </>
  );
}
