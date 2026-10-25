import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { getProduct } from '@/content/products';
import { isDbConfigured } from '@/lib/db';
import { verifyDownloadToken } from '@/lib/download-token';
import { getOrder } from '@/lib/repository';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MIME_TYPES: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.zip': 'application/zip',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.epub': 'application/epub+zip',
};

/**
 * تسليم المنتجات الرقمية عبر رابط موقّع محدود المدة.
 * الملفات تُحفظ خارج مجلد public حتى لا تكون قابلة للتنزيل المباشر بلا دفع.
 */
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token');
  if (!token) {
    return NextResponse.json({ ok: false, message: 'رابط التحميل ناقص.' }, { status: 400 });
  }

  let verified: ReturnType<typeof verifyDownloadToken>;
  try {
    verified = verifyDownloadToken(token);
  } catch (error) {
    // DOWNLOAD_SECRET غير مضبوط
    console.error('[download]', error);
    return NextResponse.json(
      { ok: false, message: 'خدمة التحميل غير مهيّأة. تواصل معنا وسنرسل الملف مباشرة.' },
      { status: 503 },
    );
  }

  if (!verified.ok) {
    return NextResponse.json({ ok: false, message: verified.error }, { status: 403 });
  }

  const product = getProduct(verified.claim.slug);
  if (!product || product.kind !== 'digital' || !product.file) {
    return NextResponse.json({ ok: false, message: 'المنتج غير متاح للتحميل.' }, { status: 404 });
  }

  // حالة الطلب تُفحص وقت التسليم لا وقت إصدار الرمز فقط. الرمز لا يُصدر إلا
  // بعد الدفع، لكن مدّته 72 ساعة: فلو استُرد الطلب أو أُلغي خلالها ظلّ الرمز
  // صالحاً. الفحص هنا يُغلق تلك النافذة ويجعل الشرط قائماً عند نقطة التسليم
  // نفسها بدلاً من الاعتماد على انتباه كل موضع يُصدر رمزاً.
  if (isDbConfigured()) {
    const order = await getOrder(verified.claim.reference);
    // `null` يعني تعذّر الوصول إلى القاعدة أيضاً، فلا نحجب عميلاً دفع فعلاً
    // بسبب عطل في القاعدة؛ نحجب فقط إذا عرفنا أن الطلب ليس مدفوعاً.
    if (order && order.status !== 'paid') {
      return NextResponse.json(
        {
          ok: false,
          message: 'هذا الرابط لم يعد صالحاً لأن حالة الطلب تغيّرت. تواصل معنا برقم طلبك.',
        },
        { status: 403 },
      );
    }
  }

  // منع الخروج من مجلد الملفات عبر أسماء ملفات ملتوية
  const safeName = path.basename(product.file);
  const filePath = path.join(process.cwd(), 'private', 'downloads', safeName);

  try {
    const file = await readFile(filePath);
    const extension = path.extname(safeName).toLowerCase();
    return new NextResponse(new Uint8Array(file), {
      headers: {
        'Content-Type': MIME_TYPES[extension] ?? 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(safeName)}"`,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch {
    console.error('[download] الملف غير موجود:', filePath);
    return NextResponse.json(
      {
        ok: false,
        message: 'الملف غير متاح حالياً. تواصل معنا برقم طلبك وسنرسله إليك مباشرة.',
      },
      { status: 404 },
    );
  }
}
