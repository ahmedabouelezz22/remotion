import { products, type Product } from '@/content/products';
import { listProductFlags } from '@/lib/repository';

/**
 * الكتالوج الفعّال.
 *
 * `comingSoon` في ملف المحتوى هو الحالة الافتراضية، وقرار المالك في جدول
 * `product_flags` يتفوّق عليها. نُسقط القرار على نفس الحقل بدلاً من إضافة
 * حقل ثانٍ، فكل ما في الواجهة والـ API ممّا يفحص `comingSoon` يصير محكوماً
 * بقرار المالك تلقائياً — ولا يبقى مسار يفحص الملف وحده.
 *
 * تُنادى على الخادم فقط. إخفاء منتج في المتصفّح ليس منعاً للشراء؛ المنع في
 * `api/checkout` الذي يقرأ من هنا أيضاً.
 */
export async function catalogue(): Promise<Product[]> {
  const flags = await listProductFlags();
  if (Object.keys(flags).length === 0) return products;

  return products.map((product) =>
    product.slug in flags ? { ...product, comingSoon: !flags[product.slug] } : product,
  );
}

export async function catalogueProduct(slug: string): Promise<Product | undefined> {
  const product = products.find((item) => item.slug === slug);
  if (!product) return undefined;

  const flags = await listProductFlags();
  return slug in flags ? { ...product, comingSoon: !flags[slug] } : product;
}
