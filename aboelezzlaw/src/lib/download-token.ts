import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * روابط تحميل مؤقّتة للمنتجات الرقمية — بلا قاعدة بيانات.
 *
 * الرمز يحمل بنفسه: معرّف المنتج + مرجع الطلب + وقت الانتهاء،
 * وموقّع بـ HMAC بمفتاح سرّي، فلا يمكن تزويره ولا تمديد صلاحيته.
 */

function secret(): string {
  const value = process.env.DOWNLOAD_SECRET;
  if (!value) {
    throw new Error('DOWNLOAD_SECRET غير مضبوط — لا يمكن إصدار روابط تحميل آمنة.');
  }
  return value;
}

const base64url = (input: string) =>
  Buffer.from(input, 'utf8').toString('base64url');

const fromBase64url = (input: string) =>
  Buffer.from(input, 'base64url').toString('utf8');

export interface DownloadClaim {
  slug: string;
  reference: string;
  /** وقت الانتهاء بالثواني منذ epoch */
  exp: number;
}

export function createDownloadToken(
  slug: string,
  reference: string,
  ttlHours = 72,
): string {
  const claim: DownloadClaim = {
    slug,
    reference,
    exp: Math.floor(Date.now() / 1000) + ttlHours * 3600,
  };
  const payload = base64url(JSON.stringify(claim));
  const signature = createHmac('sha256', secret()).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export function verifyDownloadToken(
  token: string,
): { ok: true; claim: DownloadClaim } | { ok: false; error: string } {
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return { ok: false, error: 'رابط التحميل غير صالح.' };

  const expected = createHmac('sha256', secret()).update(payload).digest('base64url');
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(signature);
  if (
    expectedBuffer.length !== receivedBuffer.length ||
    !timingSafeEqual(expectedBuffer, receivedBuffer)
  ) {
    return { ok: false, error: 'رابط التحميل غير صالح.' };
  }

  let claim: DownloadClaim;
  try {
    claim = JSON.parse(fromBase64url(payload)) as DownloadClaim;
  } catch {
    return { ok: false, error: 'رابط التحميل تالف.' };
  }

  if (claim.exp < Math.floor(Date.now() / 1000)) {
    return { ok: false, error: 'انتهت صلاحية رابط التحميل. تواصل معنا لإصدار رابط جديد.' };
  }

  return { ok: true, claim };
}
