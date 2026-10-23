'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * زرّ إجراء إداري.
 *
 * كل إجراء يمرّ بخطوة تأكيد صريحة تُظهر ما سيحدث بالضبط ولمن، وما يحتاج
 * سبباً لا يُنفَّذ بدونه. التأكيد في الواجهة راحة للمالك، أما المنع الحقيقي
 * فعلى الخادم: المسار يفحص الصلاحية وحالة السجلّ ويرفض الانتقالات غير
 * الصحيحة ويكتب أثراً في `admin_audit`.
 */
export function AdminAction({
  endpoint,
  body,
  label,
  confirm,
  reasonLabel,
  reasonRequired,
  tone = 'neutral',
}: {
  endpoint: string;
  body: Record<string, unknown>;
  label: string;
  confirm: string;
  reasonLabel?: string;
  reasonRequired?: boolean;
  tone?: 'neutral' | 'danger' | 'positive';
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const tones = {
    neutral: 'border-sand-300 text-navy-900 hover:border-navy-900',
    danger: 'border-red-200 text-red-700 hover:border-red-500',
    positive: 'border-emerald-200 text-emerald-700 hover:border-emerald-500',
  };

  async function run() {
    if (reasonRequired && !reason.trim()) {
      setError(`${reasonLabel ?? 'السبب'} مطلوب.`);
      return;
    }

    setBusy(true);
    setError('');

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, ...(reason.trim() ? { reason: reason.trim(), note: reason.trim() } : {}) }),
      });
      const data = (await response.json()) as {
        ok: boolean;
        message?: string;
        warnings?: string[];
      };

      if (!data.ok) {
        setError(data.message ?? 'تعذّر تنفيذ الإجراء.');
        setBusy(false);
        return;
      }

      if (data.warnings?.length) {
        // تحذير لا يُخفى: نُفِّذ الإجراء عندنا لكن خطوة خارجية تحتاج المالك
        window.alert(data.warnings.join('\n'));
      }

      setOpen(false);
      setReason('');
      setBusy(false);
      router.refresh();
    } catch {
      setError('تعذّر الاتصال بالخادم.');
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors',
          tones[tone],
        )}
      >
        {label}
      </button>
    );
  }

  return (
    <div className="min-w-[15rem] rounded-xl border border-sand-300 bg-sand-50 p-3">
      <p className="mb-3 text-xs leading-6 text-navy-900">{confirm}</p>

      {reasonLabel ? (
        <input
          type="text"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder={reasonLabel}
          disabled={busy}
          className="mb-3 w-full rounded-lg border border-sand-300 bg-white px-3 py-2 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-gold-500/35"
        />
      ) : null}

      {error ? <p className="mb-3 text-xs font-semibold text-red-600">{error}</p> : null}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={run}
          disabled={busy}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60',
            tone === 'danger' ? 'bg-red-600' : 'bg-navy-900',
          )}
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          تأكيد
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError('');
            setReason('');
          }}
          disabled={busy}
          className="rounded-lg border border-sand-300 px-3 py-1.5 text-xs font-bold text-slate-600"
        >
          إلغاء
        </button>
      </div>
    </div>
  );
}
