<?php
if (!defined('ABSPATH')) {
    exit;
}
get_header();
$groups = abz_sector_groups();
$total = array_sum(array_map(fn($g) => count($g['items']), $groups));
abz_page_hero('القطاعات', 'حلول قانونية مصمَّمة على طبيعة قطاعك', 'نخدم ' . $total . ' قطاعاً في أربع مجموعات. اختر قطاعك لترى ما نعمل عليه فيه وتطلب الخدمة مباشرة.', [['القطاعات', '']], 'forum');
?>
<div class="sticky top-[72px] z-30 border-b border-sand-200 bg-sand-50/95 backdrop-blur">
  <nav aria-label="مجموعات القطاعات" class="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-5 py-3 sm:px-8">
    <?php foreach ($groups as $group) : ?><a class="inline-flex min-h-[44px] shrink-0 items-center rounded-full border border-sand-200 bg-white px-4 text-sm font-bold text-navy-900 hover:border-gold-500" href="#<?php echo esc_attr($group['key']); ?>"><?php echo esc_html($group['title']); ?> <span class="numeric ms-2 rounded-full bg-sand-100 px-2 text-xs"><?php echo esc_html((string) count($group['items'])); ?></span></a><?php endforeach; ?>
  </nav>
</div>
<?php foreach ($groups as $n => $group) : ?>
<section id="<?php echo esc_attr($group['key']); ?>" class="scroll-mt-36 py-14 <?php echo $n % 2 ? 'bg-sand-100' : ''; ?>">
  <div class="mx-auto max-w-7xl px-5 sm:px-8">
    <?php abz_section_heading('مجموعة ' . ($n + 1), $group['title'], '', 'start'); ?>
    <div class="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <?php foreach ($group['items'] as $sector) : $count = count(abz_lines($sector->ID, 'abz_services')); ?>
        <a href="<?php echo esc_url(get_permalink($sector)); ?>" class="abz-reveal group flex flex-col overflow-hidden rounded-3xl border border-sand-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-gold-500/60 hover:shadow-[0_16px_40px_rgba(13,59,48,0.14)]">
          <?php echo abz_cover(abz_sector_photo($sector->post_name), (string) get_post_meta($sector->ID, 'abz_icon', true), 'aspect-[16/9]'); ?>
          <span class="flex flex-1 flex-col p-5">
            <span class="flex items-baseline justify-between gap-3"><span class="block font-display text-lg font-extrabold text-navy-900"><?php echo esc_html($sector->post_title); ?></span><span class="numeric shrink-0 rounded-full bg-forest-50 px-2.5 py-0.5 text-xs font-bold text-forest-600"><?php echo esc_html((string) $count); ?> خدمة</span></span>
            <span class="mt-2 block flex-1 text-sm leading-7 text-slate-600"><?php echo esc_html($sector->post_excerpt); ?></span>
            <span class="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-navy-900 group-hover:text-gold-600">حلول هذا القطاع <?php echo abz_arrow('h-3.5 w-3.5'); ?></span>
          </span>
        </a>
      <?php endforeach; ?>
    </div>
  </div>
</section>
<?php endforeach; ?>
<?php get_template_part('template-parts/cta-band'); ?>
<?php get_footer();
