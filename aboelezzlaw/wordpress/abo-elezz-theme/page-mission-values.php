<?php
if (!defined('ABSPATH')) {
    exit;
}
get_header();
the_post();
$mv = abz_data('firm.missionValues', []);
$value_icons = ['shield-check', 'lock', 'clipboard-check', 'award', 'lightbulb', 'scale'];
abz_page_hero('من نحن', 'رسالتنا وقيمنا وأهدافنا', 'ما نلتزم به في كل تكليف، وما نعمل لأجله.', [['عن المؤسسة', abz_url('about')], ['رسالتنا وقيمنا', '']]);
?>
<section class="py-14 sm:py-20">
  <div class="mx-auto grid max-w-7xl gap-6 px-5 sm:px-8 md:grid-cols-2">
    <?php foreach ([['target', $mv['mission'] ?? []], ['eye', $mv['vision'] ?? []]] as [$icon, $block]) : ?>
      <div class="abz-reveal rounded-3xl bg-navy-900 p-8 text-white" data-abz-tilt>
        <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-500 text-navy-950"><?php echo abz_icon($icon, 'h-6 w-6'); ?></span>
        <h2 class="mt-5 text-2xl text-white"><?php echo esc_html($block['title'] ?? ''); ?></h2>
        <p class="mt-3 text-lg leading-9 text-navy-100"><?php echo esc_html($block['body'] ?? ''); ?></p>
      </div>
    <?php endforeach; ?>
  </div>
</section>
<section class="bg-sand-100 py-14 sm:py-20">
  <div class="mx-auto max-w-7xl px-5 sm:px-8">
    <?php abz_section_heading('قيمنا', 'ستّ قيم نعمل بها'); ?>
    <div class="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <?php foreach ($mv['values'] ?? [] as $i => $value) : ?>
        <div class="abz-reveal rounded-2xl border border-sand-200 bg-white p-6" data-abz-tilt>
          <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-50 text-forest-600"><?php echo abz_icon($value_icons[$i] ?? 'check'); ?></span>
          <h3 class="mt-4 text-lg text-navy-900"><?php echo esc_html($value['title']); ?></h3>
          <p class="mt-2 leading-8 text-slate-700"><?php echo esc_html($value['body']); ?></p>
        </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>
<section class="py-14 sm:py-20">
  <div class="mx-auto max-w-4xl px-5 sm:px-8">
    <?php abz_section_heading('أهدافنا', 'إلى أين نمضي'); ?>
    <ol class="mt-10 grid gap-4">
      <?php foreach ($mv['goals'] ?? [] as $i => $goal) : ?>
        <li class="abz-reveal flex gap-4 rounded-2xl border border-sand-200 bg-white p-5"><span class="numeric flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-500 font-display font-black text-navy-950"><?php echo esc_html((string) ($i + 1)); ?></span><p class="leading-8 text-navy-900"><?php echo esc_html($goal); ?></p></li>
      <?php endforeach; ?>
    </ol>
  </div>
</section>
<?php get_template_part('template-parts/cta-band'); ?>
<?php get_footer();
