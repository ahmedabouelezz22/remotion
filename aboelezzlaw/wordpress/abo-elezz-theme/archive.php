<?php
/* صفحة المدونة */
if (!defined('ABSPATH')) {
    exit;
}
get_header();
$current = is_category() ? get_queried_object() : null;
abz_page_hero('المدونة', $current ? $current->name : 'تحليلات قانونية موثّقة بمصادرها', $current ? (string) $current->description : 'مقالات أصلية في القانون المصري والأنظمة السعودية والقانون الدولي، تحيل إلى نصوصها ومصادرها الرسمية بروابط مباشرة.', [['المدونة', $current ? abz_url('blog') : ''], ...($current ? [[$current->name, '']] : [])]);
?>
<section class="py-14 sm:py-20">
  <div class="mx-auto max-w-7xl px-5 sm:px-8">
    <nav aria-label="تصنيفات المدونة" class="mb-10 flex flex-wrap gap-2">
      <a class="inline-flex min-h-[44px] items-center rounded-full px-4 font-bold <?php echo $current ? 'border border-sand-200 bg-white text-navy-900' : 'bg-navy-900 text-white'; ?>" href="<?php echo esc_url(abz_url('blog')); ?>">الكل</a>
      <?php foreach (get_categories(['hide_empty' => true, 'exclude' => [(int) get_option('default_category')]]) as $term) : $active = $current && $current->term_id === $term->term_id; ?>
        <a class="inline-flex min-h-[44px] items-center rounded-full px-4 font-bold <?php echo $active ? 'bg-navy-900 text-white' : 'border border-sand-200 bg-white text-navy-900 hover:border-gold-500'; ?>" href="<?php echo esc_url(get_category_link($term)); ?>"><?php echo esc_html($term->name); ?> <span class="numeric ms-1 text-xs opacity-70">(<?php echo esc_html((string) $term->count); ?>)</span></a>
      <?php endforeach; ?>
    </nav>
    <?php if (have_posts()) : ?>
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <?php while (have_posts()) : the_post(); get_template_part('template-parts/article-card'); endwhile; ?>
      </div>
      <div class="mt-10 flex justify-center gap-3 font-bold"><?php the_posts_pagination(['prev_text' => 'السابق', 'next_text' => 'التالي']); ?></div>
    <?php else : ?>
      <p class="text-center text-slate-600">لا مقالات في هذا القسم بعد.</p>
    <?php endif; ?>
  </div>
</section>
<section class="bg-sand-100 py-14">
  <div class="mx-auto max-w-3xl px-5 text-center sm:px-8">
    <h2 class="text-2xl text-navy-900">لا تفوّتك المقالات الجديدة</h2>
    <p class="mt-2 leading-8 text-slate-600">اشترك في النشرة البريدية أو تابعنا على وسائل التواصل.</p>
    <div class="mx-auto mt-6 max-w-xl text-start"><?php echo do_shortcode('[abz_newsletter]'); ?></div>
    <div class="mt-6 flex justify-center"><?php abz_social_icons('light', 'h-11 w-11'); ?></div>
  </div>
</section>
<?php get_footer();
