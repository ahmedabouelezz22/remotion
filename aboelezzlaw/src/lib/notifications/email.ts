import nodemailer from 'nodemailer';

/**
 * إرسال البريد عبر أحد مزوّدين:
 *  1) Resend  — إن وُجد RESEND_API_KEY  (الأسهل، لا يحتاج سيرفر بريد)
 *  2) SMTP    — إن وُجد SMTP_HOST       (Gmail App Password أو بريد Hostinger)
 * إن لم يُضبط أي منهما تُرجَع نتيجة "معطّل" دون رمي خطأ، حتى لا يفشل النموذج على الزائر.
 */

export type EmailResult =
  | { ok: true; provider: 'resend' | 'smtp'; id?: string }
  | { ok: false; provider: 'resend' | 'smtp' | 'none'; error: string };

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

function fromAddress(): string {
  return process.env.MAIL_FROM || 'Aboelezz Law <onboarding@resend.dev>';
}

async function sendViaResend(msg: EmailMessage): Promise<EmailResult> {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress(),
        to: [msg.to],
        subject: msg.subject,
        html: msg.html,
        text: msg.text,
        ...(msg.replyTo ? { reply_to: msg.replyTo } : {}),
      }),
    });

    if (!res.ok) {
      return { ok: false, provider: 'resend', error: `HTTP ${res.status}: ${await res.text()}` };
    }
    const data = (await res.json()) as { id?: string };
    return { ok: true, provider: 'resend', id: data.id };
  } catch (error) {
    return { ok: false, provider: 'resend', error: (error as Error).message };
  }
}

async function sendViaSmtp(msg: EmailMessage): Promise<EmailResult> {
  try {
    const port = Number(process.env.SMTP_PORT || 587);
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      // 465 = SMTPS ضمني، أي منفذ آخر يبدأ عادياً ثم يرقّي عبر STARTTLS
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const info = await transporter.sendMail({
      from: fromAddress(),
      to: msg.to,
      subject: msg.subject,
      html: msg.html,
      text: msg.text,
      replyTo: msg.replyTo,
    });
    return { ok: true, provider: 'smtp', id: info.messageId };
  } catch (error) {
    return { ok: false, provider: 'smtp', error: (error as Error).message };
  }
}

export async function sendEmail(msg: EmailMessage): Promise<EmailResult> {
  if (process.env.RESEND_API_KEY) return sendViaResend(msg);
  if (process.env.SMTP_HOST) return sendViaSmtp(msg);
  return {
    ok: false,
    provider: 'none',
    error: 'لم يُضبط أي مزوّد بريد (RESEND_API_KEY أو SMTP_HOST).',
  };
}
