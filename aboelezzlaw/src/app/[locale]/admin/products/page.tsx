import { AdminAction } from '@/components/admin/admin-action';
import { ownerOrRedirect } from '@/components/admin/admin-gate';
import { AdminShell, AdminTable } from '@/components/admin/admin-shell';
import { Badge, Card } from '@/components/ui/card';
import { kindLabels, products } from '@/content/products';
import { listProductFlags } from '@/lib/repository';
import { formatPrice } from '@/lib/utils';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

export const dynamic = 'force-dynamic';

/**
 * حالة النشر النهائية لمنتج.
 *
 * الترتيب مقصود: علامة المالك في القاعدة تتفوّق على `comingSoon` في الملف،
 * فيستطيع المالك نشر منتج أو سحبه من اللوحة دون نشر جديد للموقع.
 */
function publishedState(slug: string, comingSoon: boolean | undefined, flags: Record<string, boolean>) {
  if (slug in flags) return flags[slug]!;
  return !comingSoon;
}

export default async function AdminProductsPage() {
  const owner = await ownerOrRedirect();
  const flags = await listProductFlags();

  return (
    <AdminShell
      owner={owner}
      title="المنتجات"
      description="الحالة هنا تُقرأ على الخادم في المتجر وفي السلّة وعند الدفع — فسحب منتج يمنع شراءه فعلاً ولا يكتفي بإخفاء زرّه. لا تنشر منتجاً قبل مراجعة محتواه."
    >
      <Card className="mb-6 border-amber-200 bg-amber-50">
        <p className="text-sm leading-8 text-amber-900">
          المنتجات الرقمية تلزمها ملفاتها داخل <code className="font-mono">private/downloads/</code>{' '}
          وإلا فُشل التحميل بعد الدفع. العمود «الملف» يبيّن ما هو موجود فعلاً على الخادم الآن.
        </p>
      </Card>

      <AdminTable head={['المنتج', 'النوع', 'السعر', 'الملف', 'الحالة', 'إجراءات']}>
        {products.map((product) => {
          const published = publishedState(product.slug, product.comingSoon, flags);
          const fileMissing =
            product.kind === 'digital' &&
            Boolean(product.file) &&
            !existsSync(join(process.cwd(), 'private', 'downloads', product.file!));

          return (
            <tr key={product.slug} className="border-b border-sand-100 align-top last:border-0">
              <td className="px-4 py-3">
                <p className="font-semibold text-navy-900">{product.name}</p>
                <p className="font-mono text-[0.65rem] text-slate-500">{product.slug}</p>
              </td>
              <td className="px-4 py-3 text-xs text-slate-600">{kindLabels[product.kind]}</td>
              <td className="numeric px-4 py-3 whitespace-nowrap text-sm text-navy-900">
                {formatPrice(product.price)}
              </td>
              <td className="px-4 py-3 text-xs">
                {product.kind !== 'digital' ? (
                  <span className="text-slate-500">—</span>
                ) : !product.file ? (
                  <span className="font-bold text-amber-700">لا ملف محدَّد</span>
                ) : fileMissing ? (
                  <span className="font-bold text-red-700">مفقود على الخادم</span>
                ) : (
                  <span className="font-bold text-emerald-700">موجود</span>
                )}
              </td>
              <td className="px-4 py-3">
                {published ? (
                  <Badge tone="green">معروض للبيع</Badge>
                ) : (
                  <Badge tone="muted">مسحوب</Badge>
                )}
                {product.slug in flags ? (
                  <span className="mt-1 block text-[0.65rem] text-slate-500">قرار المالك</span>
                ) : null}
              </td>
              <td className="px-4 py-3">
                {published ? (
                  <AdminAction
                    endpoint="/api/admin/products"
                    body={{ slug: product.slug, published: false }}
                    label="سحب من البيع"
                    tone="danger"
                    reasonLabel="سبب السحب (داخلي)"
                    confirm={`سيُخفى «${product.name}» من المتجر ويُرفض شراؤه على الخادم.`}
                  />
                ) : (
                  <AdminAction
                    endpoint="/api/admin/products"
                    body={{ slug: product.slug, published: true }}
                    label="نشر للبيع"
                    tone="positive"
                    reasonLabel="ملاحظة (داخلي)"
                    confirm={
                      product.kind === 'digital' && fileMissing
                        ? `تنبيه: ملف «${product.name}» غير موجود على الخادم. النشر الآن يعني بيع منتج لا يمكن تحميله.`
                        : `أكّد أنك راجعت محتوى «${product.name}» وأنه جاهز للبيع بهذا السعر.`
                    }
                  />
                )}
              </td>
            </tr>
          );
        })}
      </AdminTable>
    </AdminShell>
  );
}
