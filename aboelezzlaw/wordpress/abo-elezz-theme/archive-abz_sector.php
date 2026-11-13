<?php
if (!defined('ABSPATH')) {
    exit;
}
get_header();
$sectors = get_posts(['post_type' => 'abz_sector', 'numberposts' => 60, 'orderby' => 'menu_order', 'order' => 'ASC']);
abz_page_hero('القطاعات', 'حلول قانونية ومهنية لكل قطاع', count($sectors) . ' قطاعاً نخدمها بخدمات مصمَّمة على طبيعة كل نشاط. اختر قطاعك لترى ما نعمل عليه فيه.', [['القطاعات', '']]);
?>
<section class="py-14 sm:py-20">
  <div class="mx-auto grid max-w-7xl gap-4 px-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-3">
    <?php foreach ($sectors as $sector) : ?>
      <a href="<?php echo esc_url(get_permalink($sector)); ?>" data-abz-tilt class="abz-reveal group flex gap-4 rounded-2xl border border-sand-200 bg-white p-5 hover:border-forest-600/50 hover:shadow-[0_10px_28px_rgba(13,59,48,0.1)]">
        <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-forest-50 text-forest-600 transition-colors group-hover:bg-forest-600 group-hover:text-white"><?php echo abz_icon((string) get_post_meta($sector->ID, 'abz_icon', true), 'h-6 w-6'); ?></span>
        <span class="min-w-0"><span class="block font-display text-base font-extrabold text-navy-900"><?php echo esc_html($sector->post_title); ?></span><span class="mt-1.5 line-clamp-3 block text-sm leading-7 text-slate-600"><?php echo esc_html($sector->post_excerpt); ?></span></span>
      </a>
    <?php endforeach; ?>
  </div>
</section>
<?php get_template_part('template-parts/cta-band'); ?>
<?php get_footer();
