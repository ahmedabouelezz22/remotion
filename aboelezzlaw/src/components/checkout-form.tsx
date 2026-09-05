'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Copy, Loader2, Lock, ShieldCheck, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Field, Honeypot, controlClass } from '@/components/ui/field';
import { resolveLines, useCart } from '@/components/cart-provider';
import { site, waLink } from '@/content/site';
import { formatPrice, cn } from '@/lib/utils';

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

export function CheckoutForm({ providers }: { providers: ProviderOption[] }) {
  const { lines, subtotal, shipping, total, requiresShipping, clear, ready } = useCart();
  const items = resolveLines(lines);

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
        setFeedback(data.message ?? 'تعذّر إتمام الطلب.');
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
      setFeedback('تعذّر الاتصال بالخادم. تحقّق من اتصالك أو راسلنا على واتساب لإتمام الطلب.');
    }
  }

  if (status === 'instructions') {
    return (
      <Card className="border-emerald-200 bg-emerald-50">
        <ShieldCheck className="mb-4 h-12 w-12 text-emerald-600" />
        <h2 className="mb-2 text-xl text-emerald-900">تم تسجيل طلبك</h2>
        <p className="mb-6 text-sm leading-8 text-emerald-800">
          وصلنا طلبك ووصلك تأكيد على بريدك. أكمل التحويل وفق البيانات التالية ليُفعَّل الطلب.
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
            نسخ البيانات
          </Button>
          <a
            href={waLink(`السلام عليكم، أرسل إيصال التحويل لطلب رقم ${reference}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-[#128C7E] px-4 py-2 text-sm font-bold text-white"
          >
            إرسال الإيصال على واتساب
          </a>
        </div>
      </Card>
    );
  }

  if (ready && items.length === 0) {
    return (
      <Card className="py-14 text-center">
        <h2 className="mb-2.5 text-xl text-navy-900">سلتك فارغة</h2>
        <p className="mb-8 text-sm text-slate-600">أضف خدمة أو منتجاً قبل الانتقال إلى الدفع.</p>
        <Link
          href="/store"
          className="inline-flex rounded-xl bg-navy-900 px-6 py-3 font-bold text-white"
        >
          تصفّح المتجر
        </Link>
      </Card>
    );
  }

  const busy = status === 'submitting';

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-6">
        <Card>
          <h2 className="mb-6 text-lg text-navy-900">بيانات المشتري</h2>
          <Honeypot value={values.company} onChange={update('company')} />

          <div className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="الاسم" htmlFor="c-name" required error={errors.name}>
                <input
                  id="c-name"
                  autoComplete="name"
                  className={controlClass(errors.name)}
                  value={values.name}
                  onChange={(e) => update('name')(e.target.value)}
                  disabled={busy}
                />
              </Field>
              <Field label="رقم الهاتف" htmlFor="c-phone" required error={errors.phone}>
                <input
                  id="c-phone"
                  type="tel"
                  dir="ltr"
                  autoComplete="tel"
                  className={`${controlClass(errors.phone)} numeric text-right`}
                  placeholder="01xxxxxxxxx"
                  value={values.phone}
                  onChange={(e) => update('phone')(e.target.value)}
                  disabled={busy}
                />
              </Field>
            </div>

            <Field
              label="البريد الإلكتروني"
              htmlFor="c-email"
              required
              error={errors.email}
              hint="يصلك عليه تأكيد الطلب وروابط تحميل المنتجات الرقمية."
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
                <Field label="عنوان الشحن" htmlFor="c-address" required error={errors.address}>
                  <input
                    id="c-address"
                    autoComplete="street-address"
                    className={controlClass(errors.address)}
                    value={values.address}
                    onChange={(e) => update('address')(e.target.value)}
                    disabled={busy}
                  />
                </Field>
                <Field label="المدينة" htmlFor="c-city" required error={errors.city}>
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

            <Field label="ملاحظات (اختياري)" htmlFor="c-notes" error={errors.notes}>
              <textarea
                id="c-notes"
                rows={3}
                className={`${controlClass(errors.notes)} resize-y`}
                placeholder="أي تفاصيل تساعدنا على تنفيذ طلبك بدقّة..."
                value={values.notes}
                onChange={(e) => update('notes')(e.target.value)}
                disabled={busy}
              />
            </Field>
          </div>
        </Card>

        <Card>
          <h2 className="mb-6 text-lg text-navy-900">وسيلة الدفع</h2>
          <div className="space-y-3">
            {providers.map((provider) => (
              <label
                key={provider.id}
                className={cn(
                  'flex cursor-pointer gap-4 rounded-xl border-2 p-5 transition-all',
                  method === provider.id
                    ? 'border-gold-500 bg-gold-500/8'
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
            الدفع بالبطاقة يتم على صفحة بوابة الدفع نفسها. لا يستقبل هذا الموقع بيانات بطاقتك ولا
            يخزّنها في أي مرحلة.
          </p>
        </Card>
      </div>

      <Card className="h-fit lg:sticky lg:top-24">
        <h2 className="mb-5 text-lg text-navy-900">ملخّص الطلب</h2>

        <ul className="mb-5 space-y-3 border-b border-sand-200 pb-5 text-sm">
          {items.map(({ product, quantity }) => (
            <li key={product.slug} className="flex justify-between gap-3">
              <span className="min-w-0 text-slate-700">
                {product.name}
                {quantity > 1 ? <span className="numeric text-slate-400"> × {quantity}</span> : null}
              </span>
              <span className="numeric shrink-0 font-bold text-navy-900">
                {formatPrice(product.price * quantity, product.currency)}
              </span>
            </li>
          ))}
        </ul>

        <dl className="space-y-3 border-b border-sand-200 pb-5 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-600">المجموع الفرعي</dt>
            <dd className="numeric font-bold text-navy-900">{formatPrice(subtotal)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-600">الشحن</dt>
            <dd className="numeric font-bold text-navy-900">
              {requiresShipping ? formatPrice(shipping) : 'لا يوجد'}
            </dd>
          </div>
        </dl>

        <div className="flex items-baseline justify-between gap-4 py-5">
          <span className="font-extrabold text-navy-900">الإجمالي</span>
          <span className="numeric font-display text-2xl font-black text-navy-900">
            {formatPrice(total)}
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
                إتمام الطلب عبر واتساب {site.contact.phoneLocal}
              </a>
            </div>
          </div>
        ) : null}

        <Button type="submit" variant="gold" size="lg" disabled={busy} className="w-full">
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              جارٍ المعالجة...
            </>
          ) : (
            'تأكيد الطلب والدفع'
          )}
        </Button>

        <p className="mt-4 text-center text-xs leading-6 text-slate-500">
          بتأكيد الطلب توافق على{' '}
          <Link href="/terms" className="font-semibold underline">
            الشروط والأحكام
          </Link>{' '}
          و
          <Link href="/privacy" className="font-semibold underline">
            سياسة الخصوصية
          </Link>
          .
        </p>
      </Card>
    </form>
  );
}
