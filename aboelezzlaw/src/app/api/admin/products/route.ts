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
  return withOwner(request, schema, async ({ slug, published, note }, owner) => {
    if (!products.some((product) => product.slug === slug)) {
      return {
        response: NextResponse.json(
          { ok: false, message: 'لا يوجد منتج بهذا المعرّف.' },
          { status: 404 },
        ),
      };
    }

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
