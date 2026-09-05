import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const controlBase =
  'w-full rounded-xl border bg-white px-4 py-3 text-[0.95rem] text-navy-900 transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500/35 disabled:bg-sand-100 disabled:text-slate-500';

export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={htmlFor} className="text-sm font-bold text-navy-900">
        {label}
        {required ? <span className="text-red-600"> *</span> : null}
      </label>
      {children}
      {hint && !error ? <p className="text-xs text-slate-500">{hint}</p> : null}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="text-xs font-semibold text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function controlClass(error?: string) {
  return cn(
    controlBase,
    error ? 'border-red-400 focus:border-red-500' : 'border-sand-200 focus:border-gold-500',
  );
}

/** حقل الفخّ: مخفي بصرياً وعن قارئات الشاشة، ويملؤه الآلي وحده */
export function Honeypot({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label htmlFor="company">اترك هذا الحقل فارغاً</label>
      <input
        id="company"
        name="company"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
