/**
 * حدّ معدّل بسيط داخل الذاكرة لصدّ الإرسال المتكرر من نفس العنوان.
 *
 * ملاحظة تشغيلية: على Vercel تعمل الدوال بلا حالة مشتركة بين النسخ،
 * فهذا الحدّ يوقف الإساءة العابرة لا الهجوم الموزّع. الحماية الأساسية
 * هي حقل الفخّ (honeypot) + التحقق من البيانات + حدّ Vercel نفسه.
 * لحماية أقوى اربط Upstash Redis لاحقاً.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export function rateLimit(
  key: string,
  { limit = 5, windowMs = 10 * 60 * 1000 } = {},
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }
  return { allowed: true, retryAfterSeconds: 0 };
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]!.trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}
