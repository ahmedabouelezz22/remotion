<?php
if (!defined('ABSPATH')) {
    exit;
}
get_header();
the_post();
$careers = abz_data('firm.careers', []);
abz_page_hero('من نحن', $careers['title'] ?? get_the_title(), $careers['lead'] ?? '', [['عن المؤسسة', abz_url('about')], ['الوظائف', '']]);
$email = (string) abz_setting('email', '');
?>
<section class="py-14 sm:py-20">
  <div class="mx-auto max-w-7xl px-5 sm:px-8">
    <?php abz_section_heading('المجالات', 'من نرحّب بانضمامهم'); ?>
    <div class="mt-10 grid gap-5 sm:grid-cols-2">
      <?php foreach ($careers['areas'] ?? [] as $area) : ?>
        <div class="abz-reveal rounded-2xl border border-sand-200 bg-white p-6"><h3 class="text-lg text-navy-900"><?php echo esc_html($area['title']); ?></h3><p class="mt-2 leading-8 text-slate-700"><?php echo esc_html($area['body']); ?></p></div>
      <?php endforeach; ?>
    </div>
    <div class="mt-10 rounded-3xl bg-navy-900 p-8 text-white">
      <h2 class="text-2xl text-white">كيف تتقدّم</h2>
      <p class="mt-3 leading-8 text-navy-100"><?php echo esc_html($careers['howToApply'] ?? ''); ?></p>
      <p class="mt-2 text-sm text-navy-100"><?php echo esc_html($careers['note'] ?? ''); ?></p>
      <div class="mt-6 flex flex-wrap gap-3">
        <?php if ($email) { echo abz_button('mailto:' . $email . '?subject=' . rawurlencode('طلب انضمام — '), 'أرسل سيرتك الذاتية', 'gold'); } ?>
        <?php echo abz_button(abz_url('contact') . '?topic=' . rawurlencode('طلب انضمام إلى الفريق'), 'أو راسلنا من الموقع', 'outline-light'); ?>
      </div>
    </div>
  </div>
</section>
<?php get_footer();
