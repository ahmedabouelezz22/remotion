<?php
if (!defined('ABSPATH')) {
    exit;
}
get_header();
$services = get_posts(['post_type' => 'abz_service', 'numberposts' => 50, 'orderby' => 'menu_order', 'order' => 'ASC']);
abz_page_hero('الخدمات', 'خدماتنا الأساسية', 'كل خدمة لها نطاق محدّد ومخرجات معلومة مسبقاً، حتى تعرف ما ستتسلّمه قبل أن تبدأ.', [['الخدمات', '']]);
$icons = ['building' => 'building', 'file-text' => 'file-text', 'calculator' => 'calculator', 'users' => 'users', 'scale' => 'scale', 'shield-check' => 'shield-check'];
?>
<section class="py-14 sm:py-20">
  <div class="mx-auto grid max-w-7xl gap-5 px-5 sm:px-8 md:grid-cols-2 lg:grid-cols-3">
    <?php foreach ($services as $service) : ?>
      <a href="<?php echo esc_url(get_permalink($service)); ?>" data-abz-tilt class="abz-reveal flex flex-col rounded-3xl border border-sand-200 bg-white p-7 hover:border-gold-500/60">
        <span class="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-50 text-navy-900"><?php echo abz_icon($icons[(string) get_post_meta($service->ID, 'abz_icon', true)] ?? 'scale', 'h-6 w-6'); ?></span>
        <h2 class="mt-5 text-lg text-navy-900"><?php echo esc_html($service->post_title); ?></h2>
        <p class="mt-2 flex-1 leading-8 text-slate-600"><?php echo esc_html($service->post_excerpt); ?></p>
        <span class="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-navy-900">تفاصيل الخدمة <?php echo abz_arrow('h-3.5 w-3.5'); ?></span>
      </a>
    <?php endforeach; ?>
  </div>
  <div class="mt-10 text-center"><?php echo abz_button(abz_url('practice-areas'), 'كل مجالات الممارسة ' . abz_arrow(), 'outline'); ?></div>
</section>
<?php get_template_part('template-parts/cta-band'); ?>
<?php get_footer();
