<?php
if (!defined('ABSPATH')) {
    exit;
}
get_header();
the_post();
$clients = abz_data('firm.clients', []);
$khamsat = abz_data('firm.khamsat', []);
$segment_icons = ['user', 'rocket', 'building', 'hand-heart', 'scale', 'graduation-cap'];
abz_page_hero('من نحن', 'عملاؤنا', $clients['lead'] ?? '', [['عن المؤسسة', abz_url('about')], ['عملاؤنا', '']]);
?>
<section class="py-14 sm:py-20">
  <div class="mx-auto max-w-7xl px-5 sm:px-8">
    <?php abz_section_heading('من نخدم', 'عملاء من كل نوع، في 27 قطاعاً'); ?>
    <div class="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <?php foreach ($clients['segments'] ?? [] as $i => $segment) : ?>
        <div class="abz-reveal rounded-2xl border border-sand-200 bg-white p-6" data-abz-tilt>
          <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-50 text-gold-600"><?php echo abz_icon($segment_icons[$i] ?? 'user'); ?></span>
          <h3 class="mt-4 text-lg text-navy-900"><?php echo esc_html($segment['title']); ?></h3>
          <p class="mt-2 leading-8 text-slate-700"><?php echo esc_html($segment['body']); ?></p>
        </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<?php if ($khamsat) : ?>
<section class="bg-sand-100 py-14 sm:py-20">
  <div class="mx-auto max-w-7xl px-5 sm:px-8">
    <div class="mx-auto max-w-2xl text-center">
      <p class="mb-3 text-sm font-bold tracking-[0.18em] text-gold-600">آراء العملاء</p>
      <h2 class="text-2xl text-navy-900 sm:text-3xl">ما كتبه العملاء عن تجربتهم</h2>
      <div class="mt-6 inline-flex items-center gap-4 rounded-2xl border border-sand-200 bg-white px-6 py-4">
        <span class="numeric font-display text-4xl font-black text-navy-900" dir="ltr" data-count="<?php echo esc_attr($khamsat['average']); ?>"><?php echo esc_html($khamsat['average']); ?></span>
        <span class="text-start"><span class="flex gap-0.5 text-gold-500"><?php for ($i = 0; $i < 5; $i++) { echo abz_icon('star', 'h-4 w-4 fill-gold-500'); } ?></span><span class="mt-1 block text-sm text-slate-600"><span class="numeric"><?php echo esc_html((string) $khamsat['total']); ?></span> تقييماً على منصّة خمسات</span></span>
      </div>
      <p class="mt-4 text-sm leading-7 text-slate-600">التقييمات منقولة حرفياً من الصفحة العامة على خمسات، والأسماء كما تعرضها المنصّة. يمكنك مطابقتها بنفسك من الرابط أدناه.</p>
    </div>
    <div class="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      <?php get_template_part('template-parts/reviews', null, ['reviews' => $khamsat['reviews']]); ?>
    </div>
    <div class="mt-10 text-center"><?php echo abz_button($khamsat['profileUrl'], 'كل التقييمات على خمسات ' . abz_icon('external-link', 'h-4 w-4'), 'primary', 'md', '', true); ?></div>
  </div>
</section>
<?php endif; ?>

<section class="py-14 sm:py-20">
  <div class="mx-auto max-w-4xl px-5 text-center sm:px-8">
    <span class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-50 text-forest-600"><?php echo abz_icon('lock', 'h-6 w-6'); ?></span>
    <h2 class="mt-4 text-2xl text-navy-900">سرّية العملاء أولاً</h2>
    <p class="mx-auto mt-3 max-w-2xl leading-8 text-slate-700"><?php echo esc_html($clients['logosNote'] ?? ''); ?></p>
    <div class="mt-6"><?php echo abz_button(abz_url('contact') . '?topic=' . rawurlencode('إضافة شعار منشأتنا إلى صفحة العملاء'), 'راسلنا', 'outline'); ?></div>
  </div>
</section>
<?php get_template_part('template-parts/cta-band'); ?>
<?php get_footer();
