<?php
if (!defined('ABSPATH')) {
    exit;
}
get_header();
abz_page_hero('', 'الصفحة غير موجودة', 'الرابط الذي فتحته غير صحيح أو أن الصفحة نُقلت. جرّب أحد الأقسام التالية.');
?>
<section class="py-14">
  <div class="mx-auto flex max-w-3xl flex-wrap justify-center gap-3 px-5">
    <?php echo abz_button(home_url('/'), 'العودة إلى الرئيسية', 'primary'); ?>
    <?php echo abz_button(abz_url('blog'), 'المدونة', 'outline'); ?>
    <?php echo abz_button(abz_shop_url(), 'المتجر', 'outline'); ?>
    <?php echo abz_button(abz_url('contact'), 'اتصل بنا', 'outline'); ?>
  </div>
</section>
<?php get_footer();
