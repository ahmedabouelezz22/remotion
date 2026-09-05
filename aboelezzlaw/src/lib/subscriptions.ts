import type { SubscriptionRow, SubscriptionStatus } from '@/lib/repository';

/**
 * عتبات التذكير قبل انتهاء الدورة، **مرتّبة تصاعدياً**.
 * الترتيب مقصود: نبحث عن أضيق عتبة تشمل المدة المتبقية، فمن بقي له يومان
 * يقع في عتبة الثلاثة أيام لا السبعة.
 */
export const REMINDER_DAYS = [1, 3, 7] as const;

/** أوسع عتبة — تحدّد المدى الذي نفحصه يومياً */
export const MAX_REMINDER_DAYS = Math.max(...REMINDER_DAYS);

/** يحسب نهاية الدورة التالية. الشهري يضيف شهراً تقويمياً لا 30 يوماً. */
export function nextPeriodEnd(period: string, from: Date = new Date()): Date {
  const end = new Date(from);
  if (period === 'سنوي') {
    end.setFullYear(end.getFullYear() + 1);
  } else {
    const day = end.getDate();
    end.setMonth(end.getMonth() + 1);
    // 31 يناير + شهر = 3 مارس في JS؛ نُرجعها إلى آخر يوم في فبراير
    if (end.getDate() !== day) end.setDate(0);
  }
  return end;
}

export function daysUntil(date: Date | null): number | null {
  if (!date) return null;
  const ms = new Date(date).getTime() - Date.now();
  return Math.ceil(ms / 86_400_000);
}

export const statusLabels: Record<SubscriptionStatus, string> = {
  pending: 'بانتظار الدفع',
  active: 'نشط',
  past_due: 'متأخّر السداد',
  cancelled: 'ملغى',
  expired: 'منتهٍ',
};

export const statusTones: Record<SubscriptionStatus, 'green' | 'gold' | 'muted' | 'navy'> = {
  pending: 'gold',
  active: 'green',
  past_due: 'gold',
  cancelled: 'muted',
  expired: 'muted',
};

/**
 * التذكير المستحقّ الآن، أو null إن لم يحن أي تذكير.
 *
 * `tier` هو عتبة التذكير (تُخزَّن لمنع التكرار)، و`remaining` هو عدد الأيام
 * الفعلي المتبقي (يُذكر للعميل). الخلط بينهما يجعل رسالة «ينتهي خلال 7 أيام»
 * تصل لمن بقي له يومان.
 */
export function dueReminder(
  subscription: SubscriptionRow,
): { tier: number; remaining: number } | null {
  const remaining = daysUntil(subscription.current_period_end);
  if (remaining === null || remaining < 0) return null;

  const tier = REMINDER_DAYS.find((threshold) => remaining <= threshold);
  if (tier === undefined) return null;

  // أُرسل هذا التذكير أو تذكير أضيق منه سلفاً
  if (subscription.last_reminder_days !== null && subscription.last_reminder_days <= tier) {
    return null;
  }

  return { tier, remaining };
}
