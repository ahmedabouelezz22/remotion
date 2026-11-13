<?php
if (!defined('ABSPATH')) {
    exit;
}
get_header();
abz_page_hero('البحث', 'نتائج البحث عن: ' . get_search_query(), '', [['البحث', '']]);
?>
<section class="py-14">
  <div class="mx-auto max-w-7xl px-5 sm:px-8">
    <?php if (have_posts()) : ?>
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3"><?php while (have_posts()) : the_post(); get_template_part('template-parts/article-card'); endwhile; ?></div>
    <?php else : ?><p class="text-center text-slate-600">لم نجد نتائج. جرّب كلمات أخرى أو تصفّح <a class="font-bold underline" href="<?php echo esc_url(abz_url('blog')); ?>">المدونة</a>.</p><?php endif; ?>
  </div>
</section>
<?php get_footer();
