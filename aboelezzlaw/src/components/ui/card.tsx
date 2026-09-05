import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Card({
  children,
  className,
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-sand-200 bg-white p-6 shadow-[0_1px_3px_rgba(11,31,58,0.06)]',
        hover &&
          'transition-all duration-300 hover:-translate-y-1 hover:border-gold-400/60 hover:shadow-[0_12px_32px_rgba(11,31,58,0.12)]',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Badge({
  children,
  tone = 'gold',
}: {
  children: ReactNode;
  tone?: 'gold' | 'navy' | 'muted' | 'green';
}) {
  const tones = {
    gold: 'bg-gold-500/15 text-gold-600 border-gold-500/30',
    navy: 'bg-navy-900/8 text-navy-800 border-navy-900/15',
    muted: 'bg-sand-100 text-slate-600 border-sand-200',
    green: 'bg-emerald-500/12 text-emerald-700 border-emerald-500/25',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold',
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}
