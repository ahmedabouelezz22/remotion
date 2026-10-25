'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Copy, Loader2, Lock, ShieldCheck, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Field, Honeypot, controlClass } from '@/components/ui/field';
import { resolveLines, useCart } from '@/components/cart-provider';
import { dict, path, type Locale } from '@/content/i18n';
import { productText } from '@/content/products';
import { site, waLink } from '@/content/site';
import { cn, formatPrice } from '@/lib/utils';

export interface ProviderOption {
  id: 'paymob' | 'paypal' | 'manual';
  label: string;
  description: string;
}

type Status = 'idle' | 'submitting' | 'instructions' | 'error';

const initialValues = {
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  notes: '',
  company: '',
};

export function CheckoutForm({
  providers,
  locale,
}: {
  providers: ProviderOption[];
  locale: Locale;
}) {
  const { lines, subtotal, shipping, total, requiresShipping, clear, ready } = useCart();
  const items = resolveLines(lines);
  const t = dict(locale);

  const [values, setValues] = useState(initialValues);
  const [method, setMethod] = useState<ProviderOption['id']>(providers[0]?.id ?? 'manual');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [feedback, setFeedback] = useState('');
  const [instructions, setInstructions] = useState('');
  const [reference, setReference] = useState('');

  const update = (key: keyof typeof initialValues) => (value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => (current[key] ? { ...current, [key]: '' } : current));
  };

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus('submitting');
    setErrors({});
    setFeedback('');

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          method,
          locale,
          items: lines.map((line) => ({ slug: line.slug, quantity: line.quantity })),
        }),
      });

      const data = (await response.json()) as {
        ok: boolean;
        kind?: 'redirect' | 'instructions';
        url?: string;
        instructions?: string;
        reference?: string;
        message?: string;
        errors?: Record<string, string>;
      };

      if (!data.ok) {
        setErrors(data.errors ?? {});
        setStatus('error');
        setFeedback(data.message ?? t.checkoutExtra.orderFailed);
        return;
      }

      if (data.kind === 'redirect' && data.url) {
        // السلة تُفرَّغ بعد العودة الناجحة فقط، حتى لا تضيع إن ألغى العميل الدفع
        window.location.href = data.url;
        return;
      }

      setInstructions(data.instructions ?? '');
      setReference(data.reference ?? '');
      setStatus('instructions');
      clear();
    } catch {
      setStatus('error');
      setFeedback(t.common.serverError);
    }
  }

  if (status === 'instructions') {
    return (
      <Card className="border-emerald-200 bg-emerald-50">
        <ShieldCheck className="mb-4 h-12 w-12 text-emerald-600" />
        <h2 className="mb-2 text-xl text-emerald-900">{t.checkoutExtra.registeredTitle}</h2>
        <p className="mb-6 text-sm leading-8 text-emerald-800">
          {t.checkoutExtra.registeredBody}
        </p>

        <pre className="mb-5 overflow-x-auto whitespace-pre-wrap rounded-xl border border-emerald-200 bg-white p-5 text-sm leading-8 text-navy-900">
          {instructions}
        </pre>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigator.clipboard?.writeText(instructions)}
          >
            <Copy className="h-4 w-4" />
            {t.checkoutExtra.copyDetails}
          </Button>
          <a
            href={waLink(t.checkoutExtra.receiptMessage(reference))}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-whatsapp-600 px-4 py-2 text-sm font-bold text-white"
          >
            {t.checkoutExtra.sendReceipt}
          </a>
        </div>
      </Card>
    );
  }

  if (ready && items.length === 0) {
    return (
      <Card className="py-14 text-center">
        <h2 className="mb-2.5 text-xl text-navy-900">{t.cart.empty}</h2>
        <p className="mb-8 text-sm text-slate-600">{t.checkoutExtra.emptyBody}</p>
        <Link
          href={path(locale, '/store')}
          className="inline-flex min-h-[48px] items-center rounded-xl bg-navy-900 px-6 py-3 font-bold text-white"
        >
          {t.cart.browseStore}
        </Link>
      </Card>
    );
  }

  const busy = status === 'submitting';

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-6">
        <Card>
          <h2 className="mb-6 text-lg text-navy-900">{t.checkoutExtra.buyerDetails}</h2>
          <Honeypot value={values.company} onChange={update('company')} />

          <div className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={t.checkout.name} htmlFor="c-name" required error={errors.name}>
                <input
                  id="c-name"
                  autoComplete="name"
                  className={controlClass(errors.name)}
                  value={values.name}
                  onChange={(e) => update('name')(e.target.value)}
                  disabled={busy}
                />
              </Field>
              <Field label={t.checkout.phone} htmlFor="c-phone" required error={errors.phone}>
                <input
                  id="c-phone"
                  type="tel"
                  dir="ltr"
                  autoComplete="tel"
                  className={`${controlClass(errors.phone)} numeric text-right`}
                  placeholder={t.forms.phonePlaceholder}
                  value={values.phone}
                  onChange={(e) => update('phone')(e.target.value)}
                  disabled={busy}
                />
              </Field>
            </div>

            <Field
              label={t.checkout.email}
              htmlFor="c-email"
              required
              error={errors.email}
              hint={t.checkoutExtra.emailHint}
            >
              <input
                id="c-email"
                type="email"
                dir="ltr"
                autoComplete="email"
                className={`${controlClass(errors.email)} text-right`}
                value={values.email}
                onChange={(e) => update('email')(e.target.value)}
                disabled={busy}
              />
            </Field>

            {requiresShipping ? (
              <div className="grid gap-5 sm:grid-cols-[2fr_1fr]">
                <Field
                  label={t.checkoutExtra.shippingAddress}
                  htmlFor="c-address"
                  required
                  error={errors.address}
                >
                  <input
                    id="c-address"
                    autoComplete="street-address"
                    className={controlClass(errors.address)}
                    value={values.address}
                    onChange={(e) => update('address')(e.target.value)}
                    disabled={busy}
                  />
                </Field>
                <Field label={t.checkout.city} htmlFor="c-city" required error={errors.city}>
                  <input
                    id="c-city"
                    autoComplete="address-level2"
                    className={controlClass(errors.city)}
                    value={values.city}
                    onChange={(e) => update('city')(e.target.value)}
                    disabled={busy}
                  />
                </Field>
              </div>
            ) : null}

            <Field label={t.checkoutExtra.notesOptional} htmlFor="c-notes" error={errors.notes}>
              <textarea
                id="c-notes"
                rows={3}
                className={`${controlClass(errors.notes)} resize-y`}
                placeholder={t.forms.notesPlaceholder}
                value={values.notes}
                onChange={(e) => update('notes')(e.target.value)}
                disabled={busy}
              />
            </Field>
          </div>
        </Card>

        <Card>
          <h2 className="mb-6 text-lg text-navy-900">{t.checkout.method}</h2>
          <div className="space-y-3">
            {providers.map((provider) => (
              <label
                key={provider.id}
                className={cn(
                  'flex cursor-pointer gap-4 rounded-xl border-2 p-5 transition-all',
                  method === provider.id
                    ? 'border-gold-500 bg-gold-50'
                    : 'border-sand-200 hover:border-slate-300',
                )}
              >
                <input
                  type="radio"
                  name="method"
                  value={provider.id}
                  checked={method === provider.id}
                  onChange={() => setMethod(provider.id)}
                  disabled={busy}
                  className="mt-1.5 h-4 w-4 shrink-0 accent-[#d4af37]"
                />
                <span>
                  <span className="block font-extrabold text-navy-900">{provider.label}</span>
                  <span className="mt-1 block text-sm leading-7 text-slate-600">
                    {provider.description}
                  </span>
                </span>
              </label>
            ))}
          </div>

          <p className="mt-5 flex items-start gap-2 text-xs leading-6 text-slate-500">
            <Lock className="mt-0.5 h-4 w-4 shrink-0" />
            {t.checkoutExtra.cardNote}
          </p>
        </Card>
      </div>

      <Card className="h-fit lg:sticky lg:top-24">
        <h2 className="mb-5 text-lg text-navy-900">{t.checkout.orderSummary}</h2>

        <ul className="mb-5 space-y-3 border-b border-sand-200 pb-5 text-sm">
          {items.map(({ product, quantity }) => (
            <li key={product.slug} className="flex justify-between gap-3">
              <span className="min-w-0 text-slate-700">
                {productText(product, locale).name}
                {quantity > 1 ? <span className="numeric text-slate-500"> × {quantity}</span> : null}
              </span>
              <span className="numeric shrink-0 font-bold text-navy-900">
                {formatPrice(product.price * quantity, locale)}
              </span>
            </li>
          ))}
        </ul>

        <dl className="space-y-3 border-b border-sand-200 pb-5 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-600">{t.cartPage.subtotalLabel}</dt>
            <dd className="numeric font-bold text-navy-900">{formatPrice(subtotal, locale)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-600">{t.cart.shipping}</dt>
            <dd className="numeric font-bold text-navy-900">
              {requiresShipping ? formatPrice(shipping, locale) : t.cartPage.noShipping}
            </dd>
          </div>
        </dl>

        <div className="flex items-baseline justify-between gap-4 py-5">
          <span className="font-extrabold text-navy-900">{t.cart.total}</span>
          <span className="numeric font-display text-2xl font-black text-navy-900">
            {formatPrice(total, locale)}
          </span>
        </div>

        {status === 'error' && feedback ? (
          <div
            role="alert"
            className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold leading-7">{feedback}</p>
              <a
                href={waLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block font-bold underline"
              >
                {t.checkoutExtra.completeOnWhatsapp(site.contact.phoneLocal)}
              </a>
            </div>
          </div>
        ) : null}

        <Button type="submit" variant="gold" size="lg" disabled={busy} className="w-full">
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t.checkoutExtra.processing}
            </>
          ) : (
            t.checkoutExtra.confirmAndPay
          )}
        </Button>

        <p className="mt-4 text-center text-xs leading-6 text-slate-500">
          {t.checkoutExtra.agreePrefix}{' '}
          <Link href={path(locale, '/terms')} className="font-semibold underline">
            {t.footer.terms}
          </Link>{' '}
          {t.checkoutExtra.agreeAnd}{' '}
          <Link href={path(locale, '/privacy')} className="font-semibold underline">
            {t.footer.privacy}
          </Link>
          .
        </p>
      </Card>
    </form>
  );
}
