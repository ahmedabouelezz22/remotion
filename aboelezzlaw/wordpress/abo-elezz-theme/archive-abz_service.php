<?php
if (!defined('ABSPATH')) {
    exit;
}
get_header();
$services = get_posts(['post_type' => 'abz_service', 'numberposts' => 50, 'orderby' => 'menu_order', 'order' => 'ASC']);
abz_page_hero('الخدمات', 'خدماتنا الأساسية', 'كل خدمة لها نطاق محدّد ومخرجات معلومة مسبقاً، حتى تعرف ما ستتسلّمه قبل أن تبدأ.', [['الخدمات', '']], 'lawbooks');
$icons = ['building' => 'building', 'file-text' => 'file-text', 'calculator' => 'calculator', 'users' => 'users', 'scale' => 'scale', 'shield-check' => 'shield-check'];
?>
<section class="py-14 sm:py-20">
  <div class="mx-auto grid max-w-7xl gap-5 px-5 sm:px-8 md:grid-cols-2 lg:grid-cols-3">
    <?php foreach ($services as $service) : ?>
      <a href="<?php echo esc_url(get_permalink($service)); ?>" data-abz-tilt class="abz-reveal group flex flex-col overflow-hidden rounded-3xl border border-sand-200 bg-white hover:border-gold-500/60 hover:shadow-[0_16px_40px_rgba(11,31,58,0.14)]">
        <?php echo abz_cover(abz_service_photo($service->post_name), $icons[(string) get_post_meta($service->ID, 'abz_icon', true)] ?? 'scale'); ?>
        <span class="flex flex-1 flex-col p-6">
          <span class="block font-display text-xl font-extrabold text-navy-900"><?php echo esc_html($service->post_title); ?></span>
          <span class="mt-2 block flex-1 leading-8 text-slate-600"><?php echo esc_html($service->post_excerpt); ?></span>
          <span class="mt-5 flex items-center justify-between gap-3"><span class="inline-flex items-center gap-1.5 text-sm font-bold text-navy-900 group-hover:text-gold-600">تفاصيل الخدمة <?php echo abz_arrow('h-3.5 w-3.5'); ?></span><span class="rounded-full bg-gold-50 px-3 py-1 text-xs font-bold text-gold-600">اطلب عرض سعر</span></span>
        </span>
      </a>
    <?php endforeach; ?>
  </div>
  <div class="mt-10 text-center"><?php echo abz_button(abz_url('practice-areas'), 'فروع القانون التي نعمل فيها ' . abz_arrow(), 'outline'); ?></div>
</section>
<?php get_template_part('template-parts/cta-band'); ?>
<?php get_footer();
