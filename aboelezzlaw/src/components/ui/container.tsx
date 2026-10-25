import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Container({
  children,
  className,
  size = 'default',
}: {
  children: ReactNode;
  className?: string;
  size?: 'default' | 'narrow' | 'wide';
}) {
  const widths = {
    narrow: 'max-w-3xl',
    default: 'max-w-6xl',
    wide: 'max-w-7xl',
  };
  return <div className={cn('mx-auto w-full px-5 sm:px-8', widths[size], className)}>{children}</div>;
}

export function Section({
  children,
  className,
  tone = 'default',
  id,
}: {
  children: ReactNode;
  className?: string;
  tone?: 'default' | 'sand' | 'navy';
  id?: string;
}) {
  const tones = {
    default: 'bg-transparent',
    sand: 'bg-sand-100',
    navy: 'bg-navy-900 text-white',
  };
  return (
    <section id={id} className={cn('py-16 sm:py-24', tones[tone], className)}>
      {children}
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  inverted = false,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'center' | 'start';
  inverted?: boolean;
}) {
  return (
    <div
      className={cn(
        'max-w-2xl',
        align === 'center' ? 'mx-auto text-center' : 'text-start',
      )}
    >
      {eyebrow ? (
        <p
          className={cn(
            'mb-3 text-sm font-bold tracking-[0.18em]',
            inverted ? 'text-gold-400' : 'text-gold-600',
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={cn(
          'text-2xl sm:text-3xl lg:text-[2.1rem]',
          inverted ? 'text-white' : 'text-navy-900',
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            'mt-4 text-[1.02rem] leading-9',
            inverted ? 'text-navy-100/85' : 'text-slate-600',
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
