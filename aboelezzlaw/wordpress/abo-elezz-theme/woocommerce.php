<?php
/* غلاف صفحات المتجر */
if (!defined('ABSPATH')) {
    exit;
}
get_header();
if (is_shop() || is_product_category()) {
    $term = is_product_category() ? get_queried_object() : null;
    $abz_hero_photo = $term ? abz_category_photo($term->slug) : 'contract';
    abz_page_hero('المتجر', $term ? $term->name : 'خدمات ومنتجات قانونية بأسعار معلومة', $term ? wp_strip_all_tags((string) $term->description) : 'اطّلع على نطاق كل خدمة وسعرها قبل الطلب، ونماذج يصلك رابط تحميلها فور الدفع.', [['المتجر', $term ? abz_shop_url() : ''], ...($term ? [[$term->name, '']] : [])], $abz_hero_photo);
}
?>
<section class="py-12 sm:py-16">
  <div class="mx-auto max-w-7xl px-5 sm:px-8">
    <?php if (is_shop() || is_product_category()) : ?>
      <?php $abz_cats = array_filter((array) get_terms(['taxonomy' => 'product_cat', 'hide_empty' => true, 'parent' => 0]), fn($c) => $c instanceof WP_Term && $c->slug !== 'uncategorized' && $c->slug !== 'lawyers-marketplace'); ?>
      <?php if (is_shop() && !is_search()) : ?>
        <h2 class="text-2xl text-navy-900">تسوّق حسب القسم</h2>
        <div class="mb-12 mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <?php foreach ($abz_cats as $cat) : ?>
            <a href="<?php echo esc_url(get_term_link($cat)); ?>" class="abz-reveal group relative isolate flex min-h-[11rem] flex-col justify-end overflow-hidden rounded-3xl p-5 text-white">
              <img src="<?php echo esc_url(abz_img(abz_category_photo($cat->slug))); ?>" alt="" loading="lazy" width="1200" height="750" class="absolute inset-0 -z-20 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105">
              <span class="absolute inset-0 -z-10 bg-gradient-to-t from-navy-950 via-navy-950/55 to-navy-950/10"></span>
              <span class="font-display text-xl font-black text-white"><?php echo esc_html($cat->name); ?></span>
              <span class="numeric mt-1 flex items-center gap-1.5 text-sm font-bold text-gold-300"><?php echo esc_html((string) $cat->count); ?> منتجاً <?php echo abz_arrow('h-3.5 w-3.5'); ?></span>
            </a>
          <?php endforeach; ?>
          <a href="<?php echo esc_url(abz_url('marketplace')); ?>" class="abz-reveal group relative isolate flex min-h-[11rem] flex-col justify-end overflow-hidden rounded-3xl p-5 text-white">
            <img src="<?php echo esc_url(abz_img('office')); ?>" alt="" loading="lazy" width="1200" height="750" class="absolute inset-0 -z-20 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105">
            <span class="absolute inset-0 -z-10 bg-gradient-to-t from-forest-900 via-forest-900/60 to-forest-900/10"></span>
            <span class="font-display text-xl font-black text-white">سوق مستلزمات المحامين</span>
            <span class="mt-1 flex items-center gap-1.5 text-sm font-bold text-gold-300">أرواب، ملابس، أجهزة، أثاث، سيارات <?php echo abz_arrow('h-3.5 w-3.5'); ?></span>
          </a>
        </div>
        <div class="mb-10 grid gap-4 rounded-3xl bg-navy-900 p-6 text-white sm:grid-cols-2 lg:grid-cols-4">
          <?php foreach ([['file-text', 'نطاق وسعر معلومان', 'تعرف ما ستتسلّمه قبل الدفع.'], ['file-down', 'تحميل فوري للنماذج', 'رابط التحميل يصلك فور تأكيد الدفع.'], ['badge-check', 'خصم للأعضاء حتى 30%', 'يُطبَّق تلقائياً في السلة.'], ['message-circle', 'دعم عبر واتساب', 'نجيب عن أسئلتك قبل الشراء وبعده.']] as [$i, $t, $b]) : ?>
            <div class="flex gap-3"><span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-500 text-navy-950"><?php echo abz_icon($i); ?></span><span><span class="block font-bold text-white"><?php echo esc_html($t); ?></span><span class="block text-sm leading-6 text-navy-100"><?php echo esc_html($b); ?></span></span></div>
          <?php endforeach; ?>
        </div>
        <h2 class="mb-6 text-2xl text-navy-900">كل المنتجات والخدمات</h2>
      <?php else : ?>
        <nav aria-label="فئات المتجر" class="mb-8 flex flex-wrap gap-2">
          <a class="inline-flex min-h-[44px] items-center rounded-full bg-navy-900 px-4 font-bold text-white" href="<?php echo esc_url(abz_shop_url()); ?>">المتجر كله</a>
          <?php foreach ($abz_cats as $cat) : ?>
            <a class="inline-flex min-h-[44px] items-center rounded-full border border-sand-200 bg-white px-4 font-bold text-navy-900 hover:border-gold-500" href="<?php echo esc_url(get_term_link($cat)); ?>"><?php echo esc_html($cat->name); ?></a>
          <?php endforeach; ?>
        </nav>
      <?php endif; ?>
    <?php endif; ?>
    <div class="woocommerce-content"><?php woocommerce_content(); ?></div>
  </div>
</section>
<?php get_footer();
