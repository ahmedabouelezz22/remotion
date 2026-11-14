<?php
if (!defined('ABSPATH')) {
    exit;
}
get_header();
the_post();
$careers = abz_data('firm.careers', []);
abz_page_hero('انضم إلينا', 'بوابة الانضمام إلى الفريق وشبكة المختصّين والموردين', $careers['lead'] ?? '', [['عن المؤسسة', abz_url('about')], ['الانضمام', '']], 'collab');
$email = (string) abz_setting('email', '');
?>
<section class="py-14 sm:py-20">
  <div class="mx-auto max-w-7xl px-5 sm:px-8">
    <div class="mb-14 grid gap-5 md:grid-cols-3">
      <?php foreach ([['scale', 'محامون ومستشارون', 'للعمل عن بُعد على تكليفات بحسب دولتك وتخصّصك ولغاتك.', abz_account_url('lawyer'), 'سجّل كمحامٍ', 'lawbooks'], ['landmark', 'مكاتب وشركات محاماة', 'شراكة وإحالات متبادلة وإسناد أعمال في الاتجاهين.', abz_url('law-firms'), 'تفاصيل التعاون', 'conference'], ['store', 'موردون ومقدّمو خدمات', 'اعرض منتجاتك للمحامين بأسعار خاصة في سوق المستلزمات.', abz_account_url('supplier'), 'سجّل كمورّد', 'stationery']] as [$icon, $title, $body, $href, $cta, $photo]) : ?>
        <a href="<?php echo esc_url($href); ?>" class="abz-reveal group flex flex-col overflow-hidden rounded-3xl border border-sand-200 bg-white hover:border-gold-500/60 hover:shadow-[0_12px_32px_rgba(11,31,58,0.12)]">
          <?php echo abz_cover($photo, $icon); ?>
          <span class="flex flex-1 flex-col p-6"><span class="block font-display text-lg font-extrabold text-navy-900"><?php echo esc_html($title); ?></span><span class="mt-2 block flex-1 text-sm leading-7 text-slate-600"><?php echo esc_html($body); ?></span><span class="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-navy-900 group-hover:text-gold-600"><?php echo esc_html($cta); ?> <?php echo abz_arrow('h-3.5 w-3.5'); ?></span></span>
        </a>
      <?php endforeach; ?>
    </div>
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
