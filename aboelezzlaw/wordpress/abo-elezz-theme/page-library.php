<?php
if (!defined('ABSPATH')) {
    exit;
}
get_header();
the_post();
$items = abz_data('library', []);
abz_page_hero('المعرفة', 'المكتبة القانونية', 'مصادر رسمية ومؤسسية متاحة للعموم وبصفة مشروعة. نحيل إلى المصدر الأصلي مباشرةً ولا نعيد نشر مؤلفات محمية.', [['المكتبة القانونية', '']]);
?>
<section class="py-14 sm:py-20">
  <div class="mx-auto grid max-w-7xl gap-5 px-5 sm:px-8 md:grid-cols-2 lg:grid-cols-3">
    <?php foreach ($items as $item) : ?>
      <a href="<?php echo esc_url($item['url']); ?>" target="_blank" rel="noopener" class="abz-reveal flex flex-col rounded-2xl border border-sand-200 bg-white p-6 hover:border-gold-500/60 hover:shadow-[0_12px_32px_rgba(11,31,58,0.1)]">
        <span class="flex flex-wrap gap-2 text-xs font-bold"><span class="rounded-full bg-navy-50 px-3 py-1 text-navy-800"><?php echo esc_html($item['jurisdiction'] ?? ''); ?></span><span class="rounded-full bg-sand-100 px-3 py-1 text-slate-600"><?php echo esc_html($item['type'] ?? ''); ?></span></span>
        <h2 class="mt-4 text-lg leading-8 text-navy-900"><?php echo esc_html($item['title'] ?? ''); ?></h2>
        <p class="mt-2 flex-1 text-sm leading-7 text-slate-600"><?php echo esc_html($item['description'] ?? ''); ?></p>
        <span class="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-navy-900"><?php echo esc_html($item['publisher'] ?? 'المصدر'); ?> <?php echo abz_icon('external-link', 'h-3.5 w-3.5'); ?></span>
      </a>
    <?php endforeach; ?>
  </div>
</section>
<?php get_footer();
