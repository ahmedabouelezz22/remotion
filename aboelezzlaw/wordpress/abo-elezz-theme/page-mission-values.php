<?php
/* الرسالة والرؤية والقيم والأهداف — مفصّلة، ومنفصلة عن صفحة «عن المؤسسة» */
if (!defined('ABSPATH')) {
    exit;
}
get_header();
the_post();
$mv = abz_data('firm.missionValues', []);
abz_page_hero('من نحن', 'رسالتنا وقيمنا وأهدافنا', (string) ($mv['lead'] ?? ''), [['عن المؤسسة', abz_url('about')], ['رسالتنا وقيمنا وأهدافنا', '']], 'lawbooks');
?>
<section class="py-14 sm:py-20">
  <div class="mx-auto grid max-w-7xl gap-6 px-5 sm:px-8 lg:grid-cols-2">
    <?php foreach ([['target', 'mission', 'bg-navy-900'], ['eye', 'vision', 'bg-forest-900']] as [$icon, $key, $tone]) : $block = $mv[$key] ?? []; ?>
      <article class="abz-reveal relative isolate overflow-hidden rounded-[2rem] p-8 text-white sm:p-10 <?php echo esc_attr($tone); ?>" data-abz-tilt>
        <div aria-hidden="true" class="absolute -end-10 -top-10 -z-10 text-white/5"><?php echo abz_icon($icon, 'h-56 w-56'); ?></div>
        <span class="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-500 text-navy-950"><?php echo abz_icon($icon, 'h-7 w-7'); ?></span>
        <h2 class="mt-6 text-3xl text-white"><?php echo esc_html($block['title'] ?? ''); ?></h2>
        <p class="mt-4 text-lg leading-9 text-white/90"><?php echo esc_html($block['body'] ?? ''); ?></p>
        <ul class="mt-6 grid gap-3">
          <?php foreach ($block['points'] ?? [] as $point) : ?><li class="flex gap-3 leading-8 text-white/85"><span class="mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold-500 text-navy-950"><?php echo abz_icon('check', 'h-3 w-3'); ?></span><?php echo esc_html($point); ?></li><?php endforeach; ?>
        </ul>
      </article>
    <?php endforeach; ?>
  </div>
</section>

<section class="bg-sand-100 py-14 sm:py-20">
  <div class="mx-auto max-w-7xl px-5 sm:px-8">
    <?php abz_section_heading('قيمنا', 'ستّ قيم… ولكل قيمة أثر عملي', 'القيمة التي لا تظهر في طريقة العمل شعار. لذلك نذكر مع كل قيمة كيف تراها في تعاملك معنا.'); ?>
    <div class="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      <?php foreach ($mv['values'] ?? [] as $i => $value) : ?>
        <article class="abz-reveal flex flex-col rounded-3xl border border-sand-200 bg-white p-7" data-abz-tilt>
          <div class="flex items-center justify-between">
            <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-50 text-gold-600"><?php echo abz_icon($value['icon'] ?? 'check', 'h-6 w-6'); ?></span>
            <span class="numeric font-display text-3xl font-black text-sand-200" dir="ltr" aria-hidden="true"><?php echo esc_html(str_pad((string) ($i + 1), 2, '0', STR_PAD_LEFT)); ?></span>
          </div>
          <h3 class="mt-5 text-xl text-navy-900"><?php echo esc_html($value['title']); ?></h3>
          <p class="mt-2 flex-1 leading-8 text-slate-700"><?php echo esc_html($value['body']); ?></p>
          <p class="mt-4 rounded-xl bg-forest-50 p-3.5 text-sm leading-7 text-forest-900"><?php echo esc_html($value['practice'] ?? ''); ?></p>
        </article>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<section class="py-14 sm:py-20">
  <div class="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr]">
    <div class="lg:sticky lg:top-28 lg:self-start">
      <?php abz_section_heading('أهدافنا', 'ما نسعى إليه', 'أهداف نعمل عليها الآن، ونقيس بها تقدّمنا.', 'start'); ?>
      <div class="abz-reveal mt-8 overflow-hidden rounded-[2rem]"><img src="<?php echo esc_url(abz_img('conference')); ?>" alt="قاعة اجتماعات" width="1200" height="750" loading="lazy" class="aspect-[4/3] w-full object-cover"></div>
    </div>
    <ol class="grid gap-4">
      <?php foreach ($mv['goals'] ?? [] as $i => $goal) : ?>
        <li class="abz-reveal flex gap-5 rounded-3xl border border-sand-200 bg-white p-6">
          <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy-900 font-display font-black text-gold-300" aria-hidden="true"><?php echo esc_html((string) ($i + 1)); ?></span>
          <div><h3 class="text-lg text-navy-900"><?php echo esc_html($goal['title']); ?></h3><p class="mt-1.5 leading-8 text-slate-600"><?php echo esc_html($goal['body']); ?></p></div>
        </li>
      <?php endforeach; ?>
    </ol>
  </div>
</section>
<?php get_template_part('template-parts/cta-band'); ?>
<?php get_footer();
