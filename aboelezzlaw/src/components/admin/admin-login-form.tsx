'use client';

import { useState } from 'react';
import { CheckCircle2, Loader2, ShieldCheck, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Field, controlClass } from '@/components/ui/field';

type Status = 'idle' | 'sending' | 'sent' | 'error';

export function AdminLoginForm({ initialError }: { initialError?: string }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [feedback, setFeedback] = useState('');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus('sending');
    setFeedback('');

    try {
      const response = await fetch('/api/admin/login', {
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
      <Card className="mx-auto max-w-md text-center">
        <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-emerald-600" />
        <h2 className="mb-3 text-lg text-navy-900">تفقّد بريدك</h2>
        <p className="mb-6 text-sm leading-8 text-slate-600">{feedback}</p>
        <Button variant="outline" size="sm" onClick={() => setStatus('idle')}>
          إرسال رابط جديد
        </Button>
      </Card>
    );
  }

  const busy = status === 'sending';
  const error = status === 'error' ? feedback : initialError;

  return (
    <Card className="mx-auto max-w-md">
      <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-navy-900/6 text-navy-900">
        <ShieldCheck className="h-6 w-6" />
      </span>
      <h1 className="mb-2 text-lg text-navy-900">دخول المالك</h1>
      <p className="mb-6 text-sm leading-7 text-slate-600">
        أدخل بريد المالك المسجَّل. يصلك رابط دخول صالح لمرّة واحدة — لا كلمة مرور تُسرَق ولا
        تُنسى.
      </p>

      {error ? (
        <p className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-7 text-red-800">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="البريد الإلكتروني" htmlFor="admin-email" required>
          <input
            id="admin-email"
            type="email"
            dir="ltr"
            required
            autoComplete="email"
            className={controlClass()}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={busy}
          />
        </Field>

        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {busy ? 'جارٍ الإرسال…' : 'أرسل رابط الدخول'}
        </Button>
      </form>
    </Card>
  );
}
