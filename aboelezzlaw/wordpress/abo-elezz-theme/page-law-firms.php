<?php
/* خدمات لمكاتب وشركات المحاماة: إسناد الأعمال */
if (!defined('ABSPATH')) {
    exit;
}
get_header();
the_post();
$lf = abz_data('platform.lawFirms', []);
$topic = 'إسناد عمل — مكتب محاماة';
abz_page_hero((string) ($lf['eyebrow'] ?? ''), (string) ($lf['title'] ?? get_the_title()), (string) ($lf['lead'] ?? ''), [['الخدمات', get_post_type_archive_link('abz_service')], ['لمكاتب وشركات المحاماة', '']], 'conference');
?>
<section class="py-14 sm:py-20">
  <div class="mx-auto max-w-7xl px-5 sm:px-8">
    <?php abz_section_heading('ما نقبله من أعمال', 'امتداد لفريق مكتبك حين تحتاجه', 'نقبل الأعمال من مكاتب وشركات المحاماة والمحامين المستقلين، ونسلّمها بسرّية كاملة وباسم مكتبك.'); ?>
    <div class="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      <?php foreach ($lf['services'] ?? [] as $service) : ?>
        <div class="abz-reveal rounded-3xl border border-sand-200 bg-white p-7" data-abz-tilt>
          <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-900 text-gold-300"><?php echo abz_icon($service['icon'], 'h-6 w-6'); ?></span>
          <h3 class="mt-5 text-lg text-navy-900"><?php echo esc_html($service['title']); ?></h3>
          <p class="mt-2 leading-8 text-slate-600"><?php echo esc_html($service['body']); ?></p>
        </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<section class="bg-forest-900 py-14 text-white sm:py-20">
  <div class="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:items-center">
    <div>
      <p class="mb-3 text-sm font-bold tracking-[0.18em] text-gold-300">كيف يتم الإسناد</p>
      <h2 class="text-2xl text-white sm:text-3xl">أربع خطوات من التكليف إلى التسليم</h2>
      <ol class="relative mt-10 space-y-7 border-s border-white/20 ps-8">
        <?php foreach ($lf['how'] ?? [] as $i => [$title, $body]) : ?>
          <li class="abz-reveal relative"><span class="absolute -start-[3.1rem] top-0 flex h-9 w-9 items-center justify-center rounded-full bg-gold-500 font-display text-sm font-black text-navy-950 ring-4 ring-forest-900" aria-hidden="true"><?php echo esc_html((string) ($i + 1)); ?></span><h3 class="text-lg text-white"><?php echo esc_html($title); ?></h3><p class="mt-1.5 leading-8 text-forest-100"><?php echo esc_html($body); ?></p></li>
        <?php endforeach; ?>
      </ol>
    </div>
    <div class="abz-reveal overflow-hidden rounded-[2rem]"><img src="<?php echo esc_url(abz_img('contract')); ?>" alt="مراجعة وتوقيع مستندات" width="1200" height="750" loading="lazy" class="aspect-[4/3] w-full object-cover"></div>
  </div>
</section>

<section class="py-14 sm:py-20">
  <div class="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[1.15fr_0.85fr]">
    <div class="rounded-3xl border border-sand-200 bg-white p-6 sm:p-8">
      <h2 class="text-2xl text-navy-900">أرسل تكليفك</h2>
      <p class="mb-6 mt-2 leading-8 text-slate-600">صف العمل والنظام واجب التطبيق والموعد المطلوب، ويصلك عرض مكتوب خلال يوم عمل. إرسال الطلب لا يعني قبول التكليف قبل تأكيدنا الكتابي.</p>
      <?php echo do_shortcode('[abz_form type="quote" topic="' . esc_attr($topic) . '"]'); ?>
    </div>
    <aside class="grid content-start gap-5">
      <div class="rounded-3xl bg-navy-900 p-7 text-white">
        <h2 class="text-lg text-white">ما نلتزم به وما يبقى لمكتبكم</h2>
        <ul class="mt-4 grid gap-3">
          <?php foreach ($lf['terms'] ?? [] as $term) : ?><li class="flex gap-3 leading-8 text-navy-100"><?php echo abz_icon('shield-check', 'mt-1.5 h-4 w-4 shrink-0 text-gold-400'); ?><?php echo esc_html($term); ?></li><?php endforeach; ?>
        </ul>
      </div>
      <div class="rounded-3xl border border-gold-500/40 bg-gold-50 p-7">
        <h2 class="text-lg text-navy-900">تتعاملون معنا باستمرار؟</h2>
        <p class="mt-2 leading-8 text-slate-700">عضوية مكاتب المحاماة تمنح خصماً ثابتاً يصل إلى 25% على أعمال الإسناد، ومقاعد لفريق المكتب، وأولوية في مواعيد التسليم.</p>
        <div class="mt-4 flex flex-wrap gap-2">
          <?php echo abz_button(abz_url('memberships') . '#law-firms', 'عضويات المكاتب', 'primary', 'sm'); ?>
          <?php echo abz_button(abz_account_url('law-firm'), 'أنشئ حساب مكتب', 'outline', 'sm'); ?>
        </div>
      </div>
    </aside>
  </div>
</section>
<?php get_footer();
