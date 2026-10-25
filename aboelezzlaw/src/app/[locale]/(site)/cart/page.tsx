import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CartView } from '@/components/cart-view';
import { dict, isLocale, type Locale } from '@/content/i18n';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const t = dict(raw as Locale);
  return {
    title: t.cart.title,
    description: t.cartPage.description,
    // السلة صفحة معاملات لا قيمة لها في الفهرسة
    robots: { index: false, follow: true },
  };
}

export default async function CartPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  return <CartView locale={raw as Locale} />;
}
