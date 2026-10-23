import { NextResponse } from 'next/server';
import { z } from 'zod';
import { products } from '@/content/products';
import { withOwner } from '@/lib/admin';
import { setProductPublished } from '@/lib/repository';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * نشر منتج أو إخفاؤه.
 *
 * هذا هو ما ينفّذ قاعدة «لا يُعرض للبيع ما ليس جاهزاً»: الحالة تُقرأ على
 * الخادم في المتجر وفي السلة وعند الـ checkout، فإخفاء منتج يمنع شراءه
 * فعلياً ولا يكتفي بإخفاء زرّه.
 */
const schema = z.object({
  slug: z.string().trim().min(2),
  published: z.boolean(),
  note: z.string().trim().max(500).optional(),
});

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'صيغة الطلب غير صحيحة.' }, { status: 400 });
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: 'بيانات الإجراء غير صحيحة.' }, { status: 400 });
  }

  const { slug, published, note } = parsed.data;

  if (!products.some((product) => product.slug === slug)) {
    return NextResponse.json({ ok: false, message: 'لا يوجد منتج بهذا المعرّف.' }, { status: 404 });
  }

  return withOwner(request, async (owner) => {
    await setProductPublished(slug, published, owner.email, note);
    return {
      response: NextResponse.json({ ok: true, slug, published }),
      audit: {
        action: published ? 'product.publish' : 'product.unpublish',
        targetType: 'product',
        targetId: slug,
        detail: { note: note ?? null },
      },
    };
  });
}
