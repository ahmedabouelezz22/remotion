import { site } from '@/content/site';
import { sendEmail } from './email';
import { sendTelegram } from './telegram';
import { sendWhatsApp } from './whatsapp';
import {
  buildClientConfirmation,
  buildEmailHtml,
  buildPlainText,
  buildTelegramText,
  buildWhatsAppText,
  clientWaLink,
  type Field,
} from './templates';

export interface NotifyInput {
  /** عنوان الحدث، مثل: "رسالة جديدة من نموذج اتصل بنا" */
  title: string;
  intro: string;
  fields: Field[];
  /** بيانات العميل — تُستخدم لإرسال تأكيد له ولرابط الرد السريع */
  client?: {
    name: string;
    email?: string;
    phone?: string;
    confirmationHeading: string;
    confirmationBody: string;
  };
}

export interface NotifyOutcome {
  /** نجح إشعار واحد على الأقل من قنوات المكتب */
  delivered: boolean;
  channels: Record<string, { ok: boolean; error?: string }>;
}

/**
 * ينشر الإشعار على كل القنوات المضبوطة بالتوازي.
 * لا يرمي استثناءً أبداً: فشل قناة لا يجوز أن يُظهر خطأً للزائر
 * ما دامت قناة أخرى قد نجحت.
 */
export async function notifyOffice(input: NotifyInput): Promise<NotifyOutcome> {
  const replyLink = input.client?.phone
    ? clientWaLink(input.client.phone, input.client.name)
    : null;

  const html = buildEmailHtml({
    title: input.title,
    intro: input.intro,
    fields: input.fields,
    actionUrl: replyLink,
    actionLabel: replyLink ? 'الرد على العميل عبر واتساب' : undefined,
  });

  const [officeEmail, whatsapp, telegram] = await Promise.all([
    sendEmail({
      to: site.contact.email,
      subject: `[${site.shortName}] ${input.title}`,
      html,
      text: buildPlainText(input.title, input.fields),
      replyTo: input.client?.email,
    }),
    sendWhatsApp(buildWhatsAppText(input.title, input.fields)),
    sendTelegram(buildTelegramText(input.title, input.fields)),
  ]);

  const channels: NotifyOutcome['channels'] = {
    email: { ok: officeEmail.ok, error: officeEmail.ok ? undefined : officeEmail.error },
    whatsapp: { ok: whatsapp.ok, error: whatsapp.ok ? undefined : whatsapp.error },
    telegram: { ok: telegram.ok, error: telegram.ok ? undefined : telegram.error },
  };

  // رسالة تأكيد للعميل — اختيارية تماماً، فشلها لا يؤثر على النتيجة
  if (input.client?.email) {
    const confirmation = buildClientConfirmation({
      name: input.client.name,
      heading: input.client.confirmationHeading,
      body: input.client.confirmationBody,
    });
    const clientEmail = await sendEmail({
      to: input.client.email,
      subject: `${site.shortName} — ${input.client.confirmationHeading}`,
      html: confirmation.html,
      text: confirmation.text,
      replyTo: site.contact.email,
    });
    channels.clientConfirmation = {
      ok: clientEmail.ok,
      error: clientEmail.ok ? undefined : clientEmail.error,
    };
  }

  const delivered = officeEmail.ok || whatsapp.ok || telegram.ok;

  if (!delivered) {
    // يُسجَّل في لوحة Vercel > Logs حتى تُشخَّص المشكلة دون إزعاج الزائر
    console.error('[notify] فشل إيصال الإشعار على كل القنوات', channels);
  }

  return { delivered, channels };
}
