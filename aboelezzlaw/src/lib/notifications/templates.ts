import { site, waLink } from '@/content/site';

export interface Field {
  label: string;
  value: string;
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** رابط "رد عبر واتساب" يوضع داخل البريد ليردّ المكتب على العميل بنقرة واحدة */
export function clientWaLink(clientPhone: string, clientName: string): string | null {
  const digits = clientPhone.replace(/\D/g, '');
  if (digits.length < 10) return null;
  // 01xxxxxxxxx المصري يُحوَّل إلى 201xxxxxxxxx
  const international = digits.startsWith('0') ? `20${digits.slice(1)}` : digits;
  return `https://wa.me/${international}?text=${encodeURIComponent(
    `السلام عليكم ${clientName}، معك ${site.shortName}. وصلنا طلبك عبر الموقع.`,
  )}`;
}

export function buildEmailHtml(opts: {
  title: string;
  intro: string;
  fields: Field[];
  actionUrl?: string | null;
  actionLabel?: string;
}): string {
  const rows = opts.fields
    .filter((f) => f.value && f.value.trim() !== '')
    .map(
      (f) => `
        <tr>
          <td style="padding:10px 14px;background:#f6f7f9;border-bottom:1px solid #e6e8ec;font-weight:700;color:#0f172a;white-space:nowrap;vertical-align:top">${escapeHtml(
            f.label,
          )}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #e6e8ec;color:#1f2937;white-space:pre-wrap">${escapeHtml(
            f.value,
          )}</td>
        </tr>`,
    )
    .join('');

  const action =
    opts.actionUrl && opts.actionLabel
      ? `<p style="margin:22px 0 0"><a href="${opts.actionUrl}" style="display:inline-block;background:#128C7E;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:700">${escapeHtml(
          opts.actionLabel,
        )}</a></p>`
      : '';

  return `<!doctype html>
<html dir="rtl" lang="ar"><head><meta charset="utf-8"></head>
<body style="margin:0;padding:24px;background:#eef1f5;font-family:'Segoe UI',Tahoma,Arial,sans-serif;direction:rtl">
  <table role="presentation" style="max-width:640px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;border:1px solid #dfe3e8" width="100%">
    <tr><td style="background:#1a3a52;padding:22px 24px">
      <div style="color:#d4af37;font-size:13px;letter-spacing:1px">${escapeHtml(site.shortName)}</div>
      <div style="color:#fff;font-size:20px;font-weight:800;margin-top:4px">${escapeHtml(opts.title)}</div>
    </td></tr>
    <tr><td style="padding:24px">
      <p style="margin:0 0 18px;color:#334155;font-size:15px;line-height:1.7">${escapeHtml(opts.intro)}</p>
      <table role="presentation" width="100%" style="border-collapse:collapse;border:1px solid #e6e8ec;border-radius:8px;overflow:hidden;font-size:14px">${rows}</table>
      ${action}
    </td></tr>
    <tr><td style="padding:16px 24px;background:#f8fafc;color:#64748b;font-size:12px;border-top:1px solid #e6e8ec">
      أُرسلت هذه الرسالة تلقائياً من ${escapeHtml(site.url)} — لا تردّ عليها مباشرة إلا لمراسلة العميل.
    </td></tr>
  </table>
</body></html>`;
}

export function buildPlainText(title: string, fields: Field[]): string {
  const lines = fields
    .filter((f) => f.value && f.value.trim() !== '')
    .map((f) => `${f.label}: ${f.value}`);
  return [`— ${title} —`, '', ...lines, '', site.url].join('\n');
}

/** نص واتساب — مُختصر ومقروء على الهاتف */
export function buildWhatsAppText(title: string, fields: Field[]): string {
  const lines = fields
    .filter((f) => f.value && f.value.trim() !== '')
    .map((f) => `*${f.label}:* ${f.value}`);
  return [`🔔 *${title}*`, '', ...lines].join('\n');
}

export function buildTelegramText(title: string, fields: Field[]): string {
  const lines = fields
    .filter((f) => f.value && f.value.trim() !== '')
    .map((f) => `<b>${escapeHtml(f.label)}:</b> ${escapeHtml(f.value)}`);
  return [`🔔 <b>${escapeHtml(title)}</b>`, '', ...lines].join('\n');
}

/** رسالة تأكيد تُرسل للعميل نفسه */
export function buildClientConfirmation(opts: {
  name: string;
  heading: string;
  body: string;
}): { html: string; text: string } {
  const html = `<!doctype html>
<html dir="rtl" lang="ar"><head><meta charset="utf-8"></head>
<body style="margin:0;padding:24px;background:#eef1f5;font-family:'Segoe UI',Tahoma,Arial,sans-serif;direction:rtl">
  <table role="presentation" style="max-width:600px;margin:0 auto;background:#fff;border-radius:14px;border:1px solid #dfe3e8" width="100%">
    <tr><td style="background:#1a3a52;padding:22px 24px;border-radius:14px 14px 0 0">
      <div style="color:#fff;font-size:19px;font-weight:800">${escapeHtml(site.name)}</div>
    </td></tr>
    <tr><td style="padding:26px 24px;color:#1f2937;font-size:15px;line-height:1.9">
      <p style="margin:0 0 12px">الأستاذ/ة ${escapeHtml(opts.name)}، تحية طيبة،</p>
      <p style="margin:0 0 12px;font-weight:700;color:#1a3a52">${escapeHtml(opts.heading)}</p>
      <p style="margin:0 0 18px;white-space:pre-wrap">${escapeHtml(opts.body)}</p>
      <p style="margin:0">للتواصل العاجل: <a href="${waLink()}" style="color:#128C7E;font-weight:700">واتساب ${escapeHtml(
        site.contact.phoneLocal,
      )}</a></p>
    </td></tr>
    <tr><td style="padding:16px 24px;background:#f8fafc;color:#64748b;font-size:12px;border-radius:0 0 14px 14px">
      ${escapeHtml(site.name)} — ${escapeHtml(site.url)}
    </td></tr>
  </table>
</body></html>`;

  const text = `الأستاذ/ة ${opts.name}، تحية طيبة،\n\n${opts.heading}\n\n${opts.body}\n\nللتواصل العاجل واتساب: ${site.contact.phoneLocal}\n${site.url}`;
  return { html, text };
}
