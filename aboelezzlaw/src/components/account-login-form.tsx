'use client';

import { useState } from 'react';
import { CheckCircle2, Loader2, Mail, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Field, controlClass } from '@/components/ui/field';
import { site, waLink } from '@/content/site';

type Status = 'idle' | 'sending' | 'sent' | 'error';

export function AccountLoginForm({ initialError }: { initialError?: string }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [feedback, setFeedback] = useState('');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus('sending');
    setFeedback('');

    try {
      const response = await fetch('/api/account/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = (await response.json()) as { ok: boolean; message: string };

      setStatus(data.ok ? 'sent' : 'error');
      setFeedback(data.message);
    } catch {
      setStatus('error');
      setFeedback('تعذّر الاتصال بالخادم. حاول مرة أخرى.');
    }
  }

  if (status === 'sent') {
    return (
      <Card className="border-emerald-200 bg-emerald-50 text-center">
        <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-emerald-600" />
        <h2 className="mb-3 text-xl text-emerald-900">تفقّد بريدك</h2>
        <p className="mx-auto mb-6 max-w-md text-sm leading-8 text-emerald-800">{feedback}</p>
        <p className="text-xs text-emerald-700">
          لم تجد الرسالة؟ راجِع مجلد «البريد غير المرغوب» (Spam).
        </p>
        <Button variant="outline" size="sm" className="mt-6" onClick={() => setStatus('idle')}>
          إرسال رابط جديد
        </Button>
      </Card>
    );
  }

  const busy = status === 'sending';

  return (
    <Card className="mx-auto max-w-md">
      <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-navy-900/6 text-navy-900">
        <Mail className="h-6 w-6" />
      </span>

      <h2 className="mb-2.5 text-xl text-navy-900">الدخول إلى حسابك</h2>
      <p className="mb-7 text-sm leading-8 text-slate-600">
        أدخل البريد الذي استخدمته في طلباتك، ويصلك رابط دخول مؤقّت. لا حاجة إلى كلمة مرور —
        فلا شيء يمكن أن يُسرق أو يُنسى.
      </p>

      {initialError ? (
        <div
          role="alert"
          className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
        >
          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="font-semibold leading-7">{initialError}</p>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Field label="البريد الإلكتروني" htmlFor="login-email" required>
          <input
            id="login-email"
            type="email"
            dir="ltr"
            autoComplete="email"
            required
            className={`${controlClass()} text-right`}
            placeholder="name@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={busy}
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

        <Button type="submit" size="lg" disabled={busy} className="w-full">
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              جارٍ الإرسال...
            </>
          ) : (
            'أرسل رابط الدخول'
          )}
        </Button>
      </form>
    </Card>
  );
}
