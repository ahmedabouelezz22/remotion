import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CreditCard, Lock, Receipt, Truck } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { StoreGrid } from '@/components/store-grid';
import { Card } from '@/components/ui/card';
import { Container, Section } from '@/components/ui/container';
import { dict, isLocale, type Locale } from '@/content/i18n';
import { catalogue } from '@/lib/catalogue';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const t = dict(raw as Locale);
  return {
    title: t.store.title,
    description: t.store.description,
    alternates: { canonical: `/${raw}/store` },
  };
}

// حالة النشر تُقرأ من القاعدة في كل طلب، فلا تُقدَّم صفحة ثابتة تعرض منتجاً سُحب
export const dynamic = 'force-dynamic';

const icons = [Receipt, Lock, CreditCard, Truck];

export default async function StorePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = dict(locale);

  const items = await catalogue();

  return (
    <>
      <PageHeader
        eyebrow={t.store.title}
        title={t.storeExtra.pageTitle}
        description={t.storeExtra.pageDescription}
      />

      <Section>
        <Container size="wide">
          <div className="mb-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {t.storeExtra.assurances.map((item, index) => {
              const Icon = icons[index] ?? Receipt;
              return (
                <Card key={item.title} className="bg-sand-100">
                  <Icon className="mb-3 h-6 w-6 text-gold-600" />
                  <h2 className="mb-1.5 text-sm font-extrabold text-navy-900">{item.title}</h2>
                  <p className="text-xs leading-7 text-slate-600">{item.body}</p>
                </Card>
              );
            })}
          </div>

          <StoreGrid catalogue={items} locale={locale} />
        </Container>
      </Section>
    </>
  );
}
