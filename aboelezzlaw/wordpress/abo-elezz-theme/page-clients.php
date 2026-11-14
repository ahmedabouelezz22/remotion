<?php
/* عملاؤنا: من أذنوا بذكر أسمائهم، فئات من نخدم، وآراء العملاء كما كتبوها */
if (!defined('ABSPATH')) {
    exit;
}
get_header();
the_post();
$clients = abz_data('firm.clients', []);
$reviews = (array) abz_data('firm.reviews', []);
$icons = ['user', 'rocket', 'building', 'heart-handshake', 'scale', 'graduation-cap'];
abz_page_hero('من نحن', 'عملاؤنا', (string) ($clients['lead'] ?? ''), [['عن المؤسسة', abz_url('about')], ['عملاؤنا', '']], 'contract');
?>
<?php if (!empty($clients['named'])) : ?>
<section class="py-14 sm:py-20">
  <div class="mx-auto max-w-7xl px-5 sm:px-8">
    <?php abz_section_heading('من عملائنا', 'شركات وثقت بنا', 'نذكر هنا من أذنوا بذكر أسمائهم فقط، ونحفظ سرّية الباقين.'); ?>
    <div class="mt-10 grid gap-5 md:grid-cols-3">
      <?php foreach ($clients['named'] as $client) : ?>
        <div class="abz-reveal flex items-center gap-4 rounded-3xl border border-sand-200 bg-white p-6" data-abz-tilt>
          <span class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-navy-900 font-display text-xl font-black text-gold-300" aria-hidden="true"><?php echo esc_html(mb_substr(preg_replace('/^شركة\s+/u', '', $client['name']), 0, 1)); ?></span>
          <span><span class="block font-display text-lg font-extrabold leading-8 text-navy-900"><?php echo esc_html($client['name']); ?></span><span class="mt-0.5 block text-sm text-slate-600"><?php echo esc_html($client['sector']); ?></span></span>
        </div>
      <?php endforeach; ?>
    </div>
    <p class="mt-6 text-center text-sm text-slate-600"><?php echo esc_html($clients['logosNote'] ?? ''); ?></p>
  </div>
</section>
<?php endif; ?>

<section class="bg-sand-100 py-14 sm:py-20">
  <div class="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
    <div>
      <?php abz_section_heading('من نخدم', 'ستّ فئات من العملاء', 'في 27 قطاعاً، ومن دول متعدّدة، بالطريقة نفسها: نطاق مكتوب وسعر معلوم ومخرج يمكن البناء عليه.', 'start'); ?>
      <div class="abz-reveal mt-8 overflow-hidden rounded-[2rem]"><img src="<?php echo esc_url(abz_img('meeting2')); ?>" alt="اجتماع مع عميل" width="1200" height="750" loading="lazy" class="aspect-[4/3] w-full object-cover"></div>
    </div>
    <div class="grid gap-4 sm:grid-cols-2">
      <?php foreach ($clients['segments'] ?? [] as $i => $segment) : ?>
        <div class="abz-reveal rounded-3xl border border-sand-200 bg-white p-6">
          <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-50 text-gold-600"><?php echo abz_icon($icons[$i] ?? 'user'); ?></span>
          <h3 class="mt-4 text-lg text-navy-900"><?php echo esc_html($segment['title']); ?></h3>
          <p class="mt-1.5 text-sm leading-7 text-slate-600"><?php echo esc_html($segment['body']); ?></p>
        </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<?php if ($reviews) : ?>
<section class="py-14 sm:py-20">
  <div class="mx-auto max-w-7xl px-5 sm:px-8">
    <?php abz_section_heading('آراء العملاء', 'ما كتبه العملاء عن تجربتهم', 'آراء حقيقية منقولة كما كتبها أصحابها، بأسمائهم المختصرة حفاظاً على خصوصيتهم.'); ?>
    <div class="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      <?php get_template_part('template-parts/reviews', null, ['reviews' => $reviews]); ?>
    </div>
  </div>
</section>
<?php endif; ?>

<section class="bg-forest-900 py-14 text-white">
  <div class="mx-auto grid max-w-5xl items-center gap-6 px-5 sm:px-8 md:grid-cols-[auto_1fr]">
    <span class="flex h-16 w-16 items-center justify-center rounded-2xl bg-gold-500 text-navy-950"><?php echo abz_icon('lock', 'h-8 w-8'); ?></span>
    <div><h2 class="text-2xl text-white">ميثاق السرّية</h2><p class="mt-2 leading-9 text-forest-100">ما يشاركه العميل معنا لا يطّلع عليه إلا من يعمل على ملفه، ولا يُستخدم لغير مسألته، ولا يُذكر اسمه أو تفاصيل ملفه إلا بإذنه. ونوقّع اتفاقية عدم إفصاح مع من يطلبها قبل استلام مستنداته.</p></div>
  </div>
</section>
<?php get_template_part('template-parts/cta-band'); ?>
<?php get_footer();
