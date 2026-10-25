/**
 * العنوان العام للموقع كما يراه المتصفّح.
 *
 * خلف وسيط يُنهي TLS (Vercel وغيره) يصل الطلب إلى الخادم داخلياً، فقد يحمل
 * `request.url` بروتوكول http ومنفذ الاستماع. أي رابط نبنيه على ذلك —
 * رابط دخول في بريد، أو رابط تحميل موقَّع، أو عنوان عودة من بوّابة دفع —
 * لا يعمل عند العميل. لذلك نقرأ الترويسات المُمرَّرة أولاً.
 *
 * الترويسات مُدخَل من الشبكة ولا يصحّ الوثوق بها لقرار أمني؛ تُستخدم هنا
 * لبناء روابط فقط. القرارات الأمنية (صلاحية الرموز والجلسات) تعتمد على
 * توقيع HMAC وسجلّ القاعدة، فلا يمنح تلاعبٌ بالمضيف وصولاً إلى شيء.
 */
export function requestOrigin(request: Request): string {
  const forwardedHost = request.headers.get('x-forwarded-host');
  const host = forwardedHost ?? request.headers.get('host');
  if (!host) return new URL(request.url).origin;

  const proto =
    request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim() ??
    new URL(request.url).protocol.replace(':', '');

  return `${proto}://${host}`;
}
