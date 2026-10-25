import { site } from '@/content/site';

/**
 * المرجع الوحيد لمواعيد العمل — يُستخدم في المتصفّح وعلى الخادم معاً.
 *
 * الفصل بينهما كان ثغرة: المُنتقي في الصفحة يعرض أيام العمل فقط، لكن المسار
 * كان يقبل أي تاريخ وأي ساعة. فطلب مباشر (أو صفحة قديمة في تبويب منسيّ)
 * يحجز الجمعة الثالثة فجراً، فيُحجز وقت لا يعمل فيه المكتب، ويصل العميل
 * تأكيد بموعد لن يُحضَر، ويُحجب الوقت عن غيره.
 *
 * التاريخ يُفسَّر دائماً في منطقة المكتب (القاهرة) لا في منطقة الخادم:
 * الخادم على Vercel يعمل بـ UTC، و«اليوم» عند زائر في القاهرة قد يكون غيره.
 */

/** تاريخ اليوم بتوقيت المكتب، بصيغة YYYY-MM-DD */
export function todayInOfficeTimezone(): string {
  // en-CA تُخرج التاريخ بصيغة YYYY-MM-DD، وهي أبسط من تركيب الأجزاء يداً
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: site.workingHours.timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

/** أقصى مدى للحجز المسبق — يمنع حجز سنة 2099 وإشغال الجدول بلا معنى */
export const MAX_BOOKING_DAYS_AHEAD = 120;

export function isWorkingDay(date: string): boolean {
  // التفسير بـ UTC مقصود: القيمة تاريخ بلا وقت، فيوم الأسبوع فيها لا يتغيّر
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return false;
  return site.workingHours.days.includes(parsed.getUTCDay());
}

/** مواعيد يوم عمل واحد وفق ساعات العمل المعلنة */
export function slotsForDate(date: string): string[] {
  if (!date || !isWorkingDay(date)) return [];

  const { startHour, endHour, slotMinutes } = site.workingHours;
  const slots: string[] = [];
  for (let minutes = startHour * 60; minutes + slotMinutes <= endHour * 60; minutes += slotMinutes) {
    const hour = String(Math.floor(minutes / 60)).padStart(2, '0');
    const minute = String(minutes % 60).padStart(2, '0');
    slots.push(`${hour}:${minute}`);
  }
  return slots;
}

export type SlotCheck =
  | { ok: true }
  | { ok: false; field: 'date' | 'time'; message: string };

/** الفحص المعتمد لأي حجز. يُنادى على الخادم قبل الحفظ. */
export function checkSlot(date: string, time: string): SlotCheck {
  const today = todayInOfficeTimezone();

  if (date < today) {
    return { ok: false, field: 'date', message: 'لا يمكن اختيار تاريخ في الماضي' };
  }

  const horizon = new Date(`${today}T00:00:00Z`);
  horizon.setUTCDate(horizon.getUTCDate() + MAX_BOOKING_DAYS_AHEAD);
  if (date > horizon.toISOString().slice(0, 10)) {
    return {
      ok: false,
      field: 'date',
      message: `الحجز متاح حتى ${MAX_BOOKING_DAYS_AHEAD} يوماً مقدّماً. للمواعيد الأبعد راسلنا.`,
    };
  }

  if (!isWorkingDay(date)) {
    return {
      ok: false,
      field: 'date',
      message: `هذا اليوم خارج أيام العمل: ${site.workingHours.label}`,
    };
  }

  if (!slotsForDate(date).includes(time)) {
    return {
      ok: false,
      field: 'time',
      message: `اختر موعداً من المواعيد المعروضة: ${site.workingHours.label}`,
    };
  }

  return { ok: true };
}
