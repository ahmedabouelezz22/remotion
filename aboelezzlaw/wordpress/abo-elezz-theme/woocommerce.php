<?php
/* غلاف صفحات المتجر */
if (!defined('ABSPATH')) {
    exit;
}
get_header();
if (is_shop() || is_product_category()) {
    $term = is_product_category() ? get_queried_object() : null;
    abz_page_hero('المتجر', $term ? $term->name : 'خدمات ومنتجات قانونية بأسعار معلومة', $term ? wp_strip_all_tags((string) $term->description) : 'اطّلع على نطاق كل خدمة وسعرها قبل الطلب، ونماذج يصلك رابط تحميلها فور الدفع.', [['المتجر', $term ? abz_shop_url() : ''], ...($term ? [[$term->name, '']] : [])]);
}
?>
<section class="py-12 sm:py-16">
  <div class="mx-auto max-w-7xl px-5 sm:px-8">
    <?php if (is_shop() || is_product_category()) : ?>
      <nav aria-label="فئات المتجر" class="mb-8 flex flex-wrap gap-2">
        <?php foreach (get_terms(['taxonomy' => 'product_cat', 'hide_empty' => true, 'parent' => 0]) as $cat) : if ($cat->slug === 'uncategorized') { continue; } ?>
          <a class="inline-flex min-h-[44px] items-center rounded-full border border-sand-200 bg-white px-4 font-bold text-navy-900 hover:border-gold-500" href="<?php echo esc_url(get_term_link($cat)); ?>"><?php echo esc_html($cat->name); ?></a>
        <?php endforeach; ?>
        <a class="inline-flex min-h-[44px] items-center rounded-full border border-gold-500/40 bg-gold-50 px-4 font-bold text-gold-600" href="<?php echo esc_url(abz_url('marketplace')); ?>">سوق مستلزمات المحامين</a>
      </nav>
    <?php endif; ?>
    <div class="woocommerce-content"><?php woocommerce_content(); ?></div>
  </div>
</section>
<?php get_footer();
