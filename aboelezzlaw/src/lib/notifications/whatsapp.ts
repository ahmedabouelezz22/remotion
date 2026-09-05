import { site } from '@/content/site';

/**
 * إشعارات واتساب إلى رقم المكتب.
 *
 * يدعم ثلاثة مزوّدين، ويُختار أوّل واحد مضبوط:
 *  1) UltraMsg   — الأنسب عملياً في مصر: يرسل رسائل نصية حرّة بلا قوالب معتمدة.
 *  2) Meta Cloud API — رسمي ومجاني للرسائل الخدمية، لكنه يشترط قالباً معتمداً
 *     للرسائل التي تبدأ من الشركة خارج نافذة الـ 24 ساعة.
 *  3) Twilio     — بديل عالمي.
 *
 * إن لم يُضبط أي مزوّد لا يفشل النموذج؛ يظل البريد هو قناة الإشعار،
 * ويحتوي البريد على رابط wa.me جاهز للرد بنقرة واحدة.
 */

export type WhatsAppResult =
  | { ok: true; provider: string }
  | { ok: false; provider: string; error: string };

async function sendViaUltraMsg(body: string): Promise<WhatsAppResult> {
  const instance = process.env.ULTRAMSG_INSTANCE_ID!;
  const token = process.env.ULTRAMSG_TOKEN!;
  try {
    const res = await fetch(`https://api.ultramsg.com/${instance}/messages/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        token,
        to: site.contact.phoneE164,
        body,
        priority: '1',
      }),
    });
    const text = await res.text();
    if (!res.ok) return { ok: false, provider: 'ultramsg', error: `HTTP ${res.status}: ${text}` };
    // UltraMsg يعيد 200 مع حقل error في بعض حالات الفشل المنطقي
    if (text.includes('"error"')) return { ok: false, provider: 'ultramsg', error: text };
    return { ok: true, provider: 'ultramsg' };
  } catch (error) {
    return { ok: false, provider: 'ultramsg', error: (error as Error).message };
  }
}

async function sendViaMetaCloud(body: string): Promise<WhatsAppResult> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID!;
  const token = process.env.WHATSAPP_TOKEN!;
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME;
  const templateLang = process.env.WHATSAPP_TEMPLATE_LANG || 'ar';

  // قالب معتمد بمتغيّر نصّي واحد يحمل ملخّص الرسالة.
  // بدون اسم قالب نحاول الإرسال النصي الحر (ينجح فقط داخل نافذة 24 ساعة).
  const payload = templateName
    ? {
        messaging_product: 'whatsapp',
        to: site.contact.whatsapp,
        type: 'template',
        template: {
          name: templateName,
          language: { code: templateLang },
          components: [
            {
              type: 'body',
              // واتساب يرفض الأسطر الجديدة داخل متغيّرات القوالب
              parameters: [{ type: 'text', text: body.replace(/\n+/g, ' — ').slice(0, 1000) }],
            },
          ],
        },
      }
    : {
        messaging_product: 'whatsapp',
        to: site.contact.whatsapp,
        type: 'text',
        text: { body },
      };

  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      return { ok: false, provider: 'meta', error: `HTTP ${res.status}: ${await res.text()}` };
    }
    return { ok: true, provider: 'meta' };
  } catch (error) {
    return { ok: false, provider: 'meta', error: (error as Error).message };
  }
}

async function sendViaTwilio(body: string): Promise<WhatsAppResult> {
  const sid = process.env.TWILIO_ACCOUNT_SID!;
  const authToken = process.env.TWILIO_AUTH_TOKEN!;
  const from = process.env.TWILIO_WHATSAPP_FROM!;
  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${sid}:${authToken}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: from.startsWith('whatsapp:') ? from : `whatsapp:${from}`,
          To: `whatsapp:${site.contact.phoneE164}`,
          Body: body,
        }),
      },
    );
    if (!res.ok) {
      return { ok: false, provider: 'twilio', error: `HTTP ${res.status}: ${await res.text()}` };
    }
    return { ok: true, provider: 'twilio' };
  } catch (error) {
    return { ok: false, provider: 'twilio', error: (error as Error).message };
  }
}

export async function sendWhatsApp(body: string): Promise<WhatsAppResult> {
  if (process.env.ULTRAMSG_INSTANCE_ID && process.env.ULTRAMSG_TOKEN) {
    return sendViaUltraMsg(body);
  }
  if (process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) {
    return sendViaMetaCloud(body);
  }
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WHATSAPP_FROM) {
    return sendViaTwilio(body);
  }
  return { ok: false, provider: 'none', error: 'لم يُضبط أي مزوّد واتساب.' };
}
