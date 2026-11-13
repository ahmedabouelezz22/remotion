<?php
if (!defined('ABSPATH')) {
    exit;
}
get_header();
the_post();
$services = abz_lines(get_the_ID(), 'abz_services');
$others = get_posts(['post_type' => 'abz_sector', 'numberposts' => 6, 'post__not_in' => [get_the_ID()], 'orderby' => 'rand']);
abz_page_hero('القطاعات', get_the_title(), get_the_excerpt(), [['القطاعات', get_post_type_archive_link('abz_sector')], [get_the_title(), '']]);
?>
<section class="py-14 sm:py-20">
  <div class="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[1.3fr_0.7fr]">
    <div>
      <h2 class="text-2xl text-navy-900">ما نعمل عليه في هذا القطاع</h2>
      <ul class="mt-6 grid gap-3 sm:grid-cols-2">
        <?php foreach ($services as $line) : ?><li class="abz-reveal flex gap-3 rounded-2xl border border-sand-200 bg-white p-4 leading-8 text-navy-900"><?php echo abz_icon('check', 'mt-1.5 h-4 w-4 shrink-0 text-forest-600'); ?><?php echo esc_html($line); ?></li><?php endforeach; ?>
      </ul>
      <?php if (get_the_content()) : ?><div class="prose-page mt-8"><?php the_content(); ?></div><?php endif; ?>
      <p class="mt-8 rounded-2xl bg-sand-100 p-5 leading-8 text-slate-700">تُنفَّذ الأعمال بفريق المؤسسة وبالتعاون مع مختصّين مرخَّصين في كل ولاية قضائية حيث يلزم، ويُحدَّد نطاق العمل والأتعاب كتابةً قبل البدء.</p>
    </div>
    <aside class="grid content-start gap-4">
      <div class="sticky top-24 rounded-3xl bg-navy-900 p-6 text-white">
        <h2 class="text-lg text-white">تحتاج خدمة في هذا القطاع؟</h2>
        <p class="mt-2 leading-8 text-navy-100">صف لنا المسألة ويصلك تقدير للنطاق والسعر والمدة قبل أي التزام.</p>
        <div class="mt-5 grid gap-2">
          <?php echo abz_button(abz_url('contact') . '?topic=' . rawurlencode('طلب خدمة — قطاع ' . get_the_title()), 'اطلب عرض سعر', 'gold', 'md', 'w-full'); ?>
          <?php echo abz_button(abz_wa_link('السلام عليكم، أحتاج خدمة قانونية في قطاع ' . get_the_title() . '.'), 'واتساب', 'whatsapp', 'md', 'w-full', true); ?>
        </div>
      </div>
    </aside>
  </div>
</section>
<section class="bg-sand-100 py-14">
  <div class="mx-auto max-w-7xl px-5 sm:px-8">
    <h2 class="text-xl text-navy-900">قطاعات أخرى</h2>
    <div class="mt-6 flex flex-wrap gap-2">
      <?php foreach ($others as $sector) : ?><a class="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-sand-200 bg-white px-4 font-bold text-navy-900 hover:border-gold-500" href="<?php echo esc_url(get_permalink($sector)); ?>"><?php echo abz_icon((string) get_post_meta($sector->ID, 'abz_icon', true), 'h-4 w-4 text-gold-600'); ?><?php echo esc_html($sector->post_title); ?></a><?php endforeach; ?>
      <a class="inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-navy-900 px-4 font-bold text-white" href="<?php echo esc_url(get_post_type_archive_link('abz_sector')); ?>">كل القطاعات <?php echo abz_arrow('h-3.5 w-3.5'); ?></a>
    </div>
  </div>
</section>
<?php get_footer();
