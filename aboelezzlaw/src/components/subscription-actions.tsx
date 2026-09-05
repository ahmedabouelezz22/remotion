'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CancelSubscriptionButton({ id }: { id: string }) {
  const router = useRouter();
  const [state, setState] = useState<'idle' | 'confirming' | 'working' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function cancel() {
    setState('working');
    try {
      const response = await fetch('/api/account/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = (await response.json()) as { ok: boolean; message: string };
      setMessage(data.message);
      setState(data.ok ? 'done' : 'error');
      if (data.ok) router.refresh();
    } catch {
      setMessage('تعذّر الاتصال بالخادم.');
      setState('error');
    }
  }

  if (state === 'done' || state === 'error') {
    return (
      <p
        className={`text-xs font-semibold leading-6 ${
          state === 'done' ? 'text-emerald-700' : 'text-red-600'
        }`}
      >
        {message}
      </p>
    );
  }

  if (state === 'confirming') {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-600">تأكيد إيقاف التجديد؟</span>
        <Button size="sm" variant="outline" onClick={cancel}>
          نعم، أوقفه
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setState('idle')}>
          تراجع
        </Button>
      </div>
    );
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={state === 'working'}
      onClick={() => setState('confirming')}
      className="text-slate-500 hover:text-red-600"
    >
      {state === 'working' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'إيقاف التجديد التلقائي'}
    </Button>
  );
}
