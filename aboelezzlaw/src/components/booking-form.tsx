'use client';

import { useMemo, useState } from 'react';
import { CalendarCheck, CheckCircle2, Loader2, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field, Honeypot, controlClass } from '@/components/ui/field';
import { site, waLink } from '@/content/site';
import { consultationChannels, consultationTypes } from '@/lib/validation';
import { cn } from '@/lib/utils';

type Status = 'idle' | 'sending' | 'success' | 'error';

const initialValues = {
  name: '',
  email: '',
  phone: '',
  type: consultationTypes[0] as string,
  channel: consultationChannels[0] as string,
  date: '',
  time: '',
  details: '',
  company: '',
};

/** المواعيد المتاحة داخل يوم عمل واحد وفق ساعات العمل المعلنة */
function slotsForDate(dateValue: string): string[] {
  if (!dateValue) return [];
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return [];
  if (!site.workingHours.days.includes(date.getDay())) return [];

  const slots: string[] = [];
  const { startHour, endHour, slotMinutes } = site.workingHours;
  for (let minutes = startHour * 60; minutes + slotMinutes <= endHour * 60; minutes += slotMinutes) {
    const hour = String(Math.floor(minutes / 60)).padStart(2, '0');
    const minute = String(minutes % 60).padStart(2, '0');
    slots.push(`${hour}:${minute}`);
  }
  return slots;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function maxDateIso(): string {
  const date = new Date();
  date.setMonth(date.getMonth() + 3);
  return date.toISOString().slice(0, 10);
}

export function BookingForm() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [feedback, setFeedback] = useState('');

  const slots = useMemo(() => slotsForDate(values.date), [values.date]);
  const dayIsClosed = Boolean(values.date) && slots.length === 0;

  const update = (key: keyof typeof initialValues) => (value: string) => {
    setValues((current) => {
      // تغيير التاريخ يُبطل الموعد المختار لأن المواعيد تختلف بين الأيام
      if (key === 'date') return { ...current, date: value, time: '' };
      return { ...current, [key]: value };
    });
    setErrors((current) => (current[key] ? { ...current, [key]: '' } : current));
  };

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus('sending');
    setErrors({});
    setFeedback('');

    try {
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = (await response.json()) as {
        ok: boolean;
        message: string;
        errors?: Record<string, string>;
      };

      if (!data.ok) {
        setErrors(data.errors ?? {});
        setStatus('error');
        setFeedback(data.message);
        return;
      }

      setStatus('success');
      setFeedback(data.message);
      setValues(initialValues);
    } catch {
      setStatus('error');
      setFeedback('تعذّر الاتصال بالخادم. راسلنا على واتساب لتثبيت الموعد.');
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-emerald-600" />
        <h3 className="mb-2 text-xl font-extrabold text-emerald-900">استلمنا طلب الحجز</h3>
        <p className="mb-2 leading-8 text-emerald-800">{feedback}</p>
        <p className="mb-6 text-sm text-emerald-700">
          وصلتك رسالة تأكيد على بريدك. الموعد يصبح نهائياً بعد تأكيده من المكتب.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setStatus('idle')}>
            حجز موعد آخر
          </Button>
          <a
            href={waLink('السلام عليكم، حجزت موعد استشارة عبر الموقع وأود تأكيده.')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-xl bg-[#128C7E] px-4 py-2 text-sm font-bold text-white"
          >
            تأكيد سريع على واتساب
          </a>
        </div>
      </div>
    );
  }

  const busy = status === 'sending';

  return (
    <form onSubmit={handleSubmit} noValidate className="relative space-y-5">
      <Honeypot value={values.company} onChange={update('company')} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="الاسم" htmlFor="b-name" required error={errors.name}>
          <input
            id="b-name"
            autoComplete="name"
            className={controlClass(errors.name)}
            placeholder="الاسم الكامل"
            value={values.name}
            onChange={(event) => update('name')(event.target.value)}
            disabled={busy}
          />
        </Field>

        <Field label="رقم الهاتف" htmlFor="b-phone" required error={errors.phone}>
          <input
            id="b-phone"
            type="tel"
            dir="ltr"
            autoComplete="tel"
            className={`${controlClass(errors.phone)} numeric text-right`}
            placeholder="01xxxxxxxxx"
            value={values.phone}
            onChange={(event) => update('phone')(event.target.value)}
            disabled={busy}
          />
        </Field>
      </div>

      <Field label="البريد الإلكتروني" htmlFor="b-email" required error={errors.email}>
        <input
          id="b-email"
          type="email"
          dir="ltr"
          autoComplete="email"
          className={`${controlClass(errors.email)} text-right`}
          placeholder="name@example.com"
          value={values.email}
          onChange={(event) => update('email')(event.target.value)}
          disabled={busy}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="نوع الاستشارة" htmlFor="b-type" required error={errors.type}>
          <select
            id="b-type"
            className={controlClass(errors.type)}
            value={values.type}
            onChange={(event) => update('type')(event.target.value)}
            disabled={busy}
          >
            {consultationTypes.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </Field>

        <Field label="وسيلة التواصل المفضّلة" htmlFor="b-channel" required error={errors.channel}>
          <select
            id="b-channel"
            className={controlClass(errors.channel)}
            value={values.channel}
            onChange={(event) => update('channel')(event.target.value)}
            disabled={busy}
          >
            {consultationChannels.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field
        label="التاريخ المطلوب"
        htmlFor="b-date"
        required
        error={errors.date}
        hint={site.workingHours.label}
      >
        <input
          id="b-date"
          type="date"
          dir="ltr"
          min={todayIso()}
          max={maxDateIso()}
          className={`${controlClass(errors.date)} numeric text-right`}
          value={values.date}
          onChange={(event) => update('date')(event.target.value)}
          disabled={busy}
        />
      </Field>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-bold text-navy-900">
          الموعد <span className="text-red-600">*</span>
        </span>

        {!values.date ? (
          <p className="rounded-xl border border-dashed border-sand-200 bg-sand-100 p-4 text-sm text-slate-500">
            اختر التاريخ أولاً لعرض المواعيد المتاحة.
          </p>
        ) : dayIsClosed ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
            هذا اليوم خارج أيام العمل. {site.workingHours.label}
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {slots.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => update('time')(slot)}
                disabled={busy}
                aria-pressed={values.time === slot}
                className={cn(
                  'numeric rounded-xl border px-3 py-2.5 text-sm font-bold transition-all',
                  values.time === slot
                    ? 'border-navy-900 bg-navy-900 text-white shadow-sm'
                    : 'border-sand-200 bg-white text-navy-900 hover:border-gold-500 hover:bg-gold-500/8',
                )}
              >
                {slot}
              </button>
            ))}
          </div>
        )}

        {errors.time ? (
          <p role="alert" className="text-xs font-semibold text-red-600">
            {errors.time}
          </p>
        ) : null}
        <p className="text-xs text-slate-500">
          المواعيد بتوقيت القاهرة. الحجز طلب مبدئي يُثبَّت بعد تأكيد المكتب.
        </p>
      </div>

      <Field
        label="ملخّص الموضوع"
        htmlFor="b-details"
        required
        error={errors.details}
        hint="اذكر جوهر المسألة والمستندات المتاحة لديك — هذا يوفّر وقت الجلسة."
      >
        <textarea
          id="b-details"
          rows={5}
          className={`${controlClass(errors.details)} resize-y`}
          placeholder="مثال: لديّ عقد توريد سنوي مع مورّد أجنبي وأرغب في مراجعة بنود الإنهاء والمسؤولية قبل التوقيع."
          value={values.details}
          onChange={(event) => update('details')(event.target.value)}
          disabled={busy}
        />
      </Field>

      {status === 'error' && feedback ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold leading-7">{feedback}</p>
            <a
              href={waLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block font-bold underline"
            >
              الحجز مباشرة عبر واتساب {site.contact.phoneLocal}
            </a>
          </div>
        </div>
      ) : null}

      <Button type="submit" size="lg" disabled={busy} className="w-full sm:w-auto">
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            جارٍ إرسال الطلب...
          </>
        ) : (
          <>
            <CalendarCheck className="h-4 w-4" />
            تأكيد طلب الحجز
          </>
        )}
      </Button>
    </form>
  );
}
