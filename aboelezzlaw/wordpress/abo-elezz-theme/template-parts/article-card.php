<?php
if (!defined('ABSPATH')) {
    exit;
}
$category = get_the_category()[0] ?? null;
?>
<a href="<?php the_permalink(); ?>" class="abz-reveal group flex h-full flex-col overflow-hidden rounded-3xl border border-sand-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-gold-400/60 hover:shadow-[0_12px_32px_rgba(11,31,58,0.12)]">
  <?php get_template_part('template-parts/article-cover', null, ['size' => 'card']); ?>
  <div class="flex flex-1 flex-col p-6">
    <?php if ($category) : ?><span class="w-fit rounded-full border border-navy-200 bg-navy-50 px-3 py-1 text-xs font-bold text-navy-800"><?php echo esc_html($category->name); ?></span><?php endif; ?>
    <h3 class="mb-2.5 mt-4 text-lg leading-8 text-navy-900 transition-colors group-hover:text-gold-600"><?php the_title(); ?></h3>
    <p class="mb-5 flex-1 text-sm leading-8 text-slate-600"><?php echo esc_html(get_the_excerpt()); ?></p>
    <span class="flex items-center justify-between text-xs font-semibold text-slate-600">
      <time class="numeric" datetime="<?php echo esc_attr(get_the_date('c')); ?>"><?php echo esc_html(get_the_date()); ?></time>
      <span><?php echo esc_html((string) abz_reading_minutes(get_post_field('post_content'))); ?> دقائق قراءة</span>
    </span>
  </div>
</a>
