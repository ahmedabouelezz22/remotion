import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'gold' | 'outline' | 'ghost' | 'whatsapp';
type Size = 'sm' | 'md' | 'lg';

const variants: Record<Variant, string> = {
  primary:
    'bg-navy-900 text-white hover:bg-navy-800 shadow-sm hover:shadow-md focus-visible:outline-navy-900',
  gold: 'bg-gold-500 text-navy-950 hover:bg-gold-400 font-bold shadow-sm hover:shadow-md',
  outline:
    'border-2 border-navy-900 text-navy-900 hover:bg-navy-900 hover:text-white bg-transparent',
  ghost: 'text-navy-900 hover:bg-navy-50',
  whatsapp: 'bg-[#128C7E] text-white hover:bg-[#0f7a6d] shadow-sm',
};

const sizes: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-[0.95rem]',
  lg: 'px-8 py-4 text-base',
};

const base =
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 disabled:opacity-55 disabled:cursor-not-allowed disabled:shadow-none';

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ComponentProps<'button'> & { variant?: Variant; size?: Size }) {
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  className,
  href,
  external,
  children,
  ...props
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
  href: string;
  external?: boolean;
  children: ReactNode;
} & Omit<ComponentProps<'a'>, 'href'>) {
  const classes = cn(base, variants[variant], sizes[size], className);

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes} {...props}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...props}>
      {children}
    </Link>
  );
}
