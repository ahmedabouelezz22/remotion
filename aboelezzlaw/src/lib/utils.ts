import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currency = 'EGP'): string {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateAr(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function readingTime(text: string): number {
  // متوسط قراءة العربية ~180 كلمة/دقيقة
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 180));
}
