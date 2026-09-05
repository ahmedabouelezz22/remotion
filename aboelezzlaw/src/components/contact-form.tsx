'use client';

import { useState } from 'react';
import { CheckCircle2, Loader2, Send, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field, Honeypot, controlClass } from '@/components/ui/field';
import { site, waLink } from '@/content/site';

type Status = 'idle' | 'sending' | 'success' | 'error';

const initialValues = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
  company: '',
};

export function ContactForm() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [feedback, setFeedback] = useState('');

  const update = (key: keyof typeof initialValues) => (value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    // إزالة خطأ الحقل بمجرد أن يبدأ المستخدم تصحيحه
    setErrors((current) => (current[key] ? { ...current, [key]: '' } : current));
  };

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus('sending');
    setErrors({});
    setFeedback('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = (await response.json()) as {
        ok: boolean;
        message: string;
        errors?: Record<string, string>;
      };

      if (!data.ok) {
        setErrors(data.errors ?? {});
        setStatus('error');
        setFeedback(data.message);
        return;
      }

      setStatus('success');
      setFeedback(data.message);
      setValues(initialValues);
    } catch {
      setStatus('error');
      setFeedback(
        'تعذّر الاتصال بالخادم. تحقّق من اتصالك بالإنترنت، أو راسلنا مباشرة على واتساب.',
      );
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-emerald-600" />
        <h3 className="mb-2 text-xl font-extrabold text-emerald-900">تم إرسال رسالتك</h3>
        <p className="mb-6 leading-8 text-emerald-800">{feedback}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setStatus('idle')}>
            إرسال رسالة أخرى
          </Button>
          <a
            href={waLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-xl bg-[#128C7E] px-4 py-2 text-sm font-bold text-white"
          >
            متابعة على واتساب
          </a>
        </div>
      </div>
    );
  }

  const busy = status === 'sending';

  return (
    <form onSubmit={handleSubmit} noValidate className="relative space-y-5">
      <Honeypot value={values.company} onChange={update('company')} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="الاسم" htmlFor="name" required error={errors.name}>
          <input
            id="name"
            name="name"
            autoComplete="name"
            className={controlClass(errors.name)}
            placeholder="الاسم الكامل"
            value={values.name}
            onChange={(event) => update('name')(event.target.value)}
            disabled={busy}
            aria-invalid={Boolean(errors.name)}
          />
        </Field>

        <Field label="رقم الهاتف" htmlFor="phone" required error={errors.phone}>
          <input
            id="phone"
            name="phone"
            type="tel"
            dir="ltr"
            autoComplete="tel"
            className={`${controlClass(errors.phone)} numeric text-right`}
            placeholder="01xxxxxxxxx"
            value={values.phone}
            onChange={(event) => update('phone')(event.target.value)}
            disabled={busy}
            aria-invalid={Boolean(errors.phone)}
          />
        </Field>
      </div>

      <Field label="البريد الإلكتروني" htmlFor="email" required error={errors.email}>
        <input
          id="email"
          name="email"
          type="email"
          dir="ltr"
          autoComplete="email"
          className={`${controlClass(errors.email)} text-right`}
          placeholder="name@example.com"
          value={values.email}
          onChange={(event) => update('email')(event.target.value)}
          disabled={busy}
          aria-invalid={Boolean(errors.email)}
        />
      </Field>

      <Field label="موضوع الرسالة" htmlFor="subject" required error={errors.subject}>
        <input
          id="subject"
          name="subject"
          className={controlClass(errors.subject)}
          placeholder="مثال: استفسار عن مراجعة عقد توريد"
          value={values.subject}
          onChange={(event) => update('subject')(event.target.value)}
          disabled={busy}
          aria-invalid={Boolean(errors.subject)}
        />
      </Field>

      <Field
        label="الرسالة"
        htmlFor="message"
        required
        error={errors.message}
        hint="كلّما كان الوصف أوضح، كان الرد أدقّ وأسرع."
      >
        <textarea
          id="message"
          name="message"
          rows={6}
          className={`${controlClass(errors.message)} resize-y`}
          placeholder="اشرح طلبك أو استفسارك بإيجاز..."
          value={values.message}
          onChange={(event) => update('message')(event.target.value)}
          disabled={busy}
          aria-invalid={Boolean(errors.message)}
        />
      </Field>

      {status === 'error' && feedback ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
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
              مراسلتنا على واتساب {site.contact.phoneLocal}
            </a>
          </div>
        </div>
      ) : null}

      <Button type="submit" size="lg" disabled={busy} className="w-full sm:w-auto">
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            جارٍ الإرسال...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            إرسال الرسالة
          </>
        )}
      </Button>

      <p className="text-xs leading-6 text-slate-500">
        بإرسالك النموذج توافق على معالجة بياناتك للرد على استفسارك وفق{' '}
        <a href="/privacy" className="font-semibold underline">
          سياسة الخصوصية
        </a>
        . لا تُرسل مستندات سرّية عبر النموذج قبل الاتفاق على وسيلة آمنة.
      </p>
    </form>
  );
}
