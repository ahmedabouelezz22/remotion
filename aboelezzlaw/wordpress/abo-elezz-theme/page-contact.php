<?php
if (!defined('ABSPATH')) {
    exit;
}
get_header();
the_post();
abz_page_hero('تواصل معنا', 'اتصل بنا', 'أرسل تفاصيل طلبك لدراسة نطاق الخدمة وتحديد الأتعاب، أو تواصل معنا مباشرة. نردّ خلال يوم عمل.', [['اتصل بنا', '']]);
$phone = (string) abz_setting('phone', '');
$phone2 = (string) abz_setting('phone2', '');
$landline = (string) abz_setting('landline', '');
$emails = array_filter([(string) abz_setting('email', ''), (string) abz_setting('alt_email', '')]);
$address = (string) abz_setting('address', '');
$map = (string) abz_setting('map_url', '');
$hours = (string) abz_setting('hours', '');
?>
<section class="py-14 sm:py-20">
  <div class="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[1.25fr_0.75fr]">
    <div class="rounded-3xl border border-sand-200 bg-white p-6 sm:p-8">
      <h2 class="mb-6 text-2xl text-navy-900">أرسل رسالتك</h2>
      <?php echo do_shortcode('[abz_form type="contact"]'); ?>
    </div>
    <aside class="grid content-start gap-4">
      <div class="rounded-3xl bg-navy-900 p-6 text-white">
        <h2 class="text-lg text-white">بيانات التواصل</h2>
        <ul class="mt-4 grid gap-4 text-sm">
          <li class="flex gap-3"><?php echo abz_icon('message-circle', 'mt-0.5 h-5 w-5 shrink-0 text-gold-400'); ?><span><span class="block font-bold">واتساب وهاتف</span><span class="grid gap-1"><?php echo abz_phone_link($phone, 'hover:text-gold-300'); ?><?php if ($phone2) { echo abz_phone_link($phone2, 'hover:text-gold-300'); } ?></span></span></li>
          <?php if ($landline) : ?><li class="flex gap-3"><?php echo abz_icon('phone', 'mt-0.5 h-5 w-5 shrink-0 text-gold-400'); ?><span><span class="block font-bold">الهاتف الأرضي</span><?php echo abz_phone_link($landline, 'hover:text-gold-300'); ?></span></li><?php endif; ?>
          <?php if ($emails) : ?><li class="flex gap-3"><?php echo abz_icon('mail', 'mt-0.5 h-5 w-5 shrink-0 text-gold-400'); ?><span><span class="block font-bold">البريد الإلكتروني</span><?php foreach ($emails as $email) : ?><a dir="ltr" class="block hover:text-gold-300" href="mailto:<?php echo esc_attr($email); ?>"><?php echo esc_html($email); ?></a><?php endforeach; ?></span></li><?php endif; ?>
          <?php if ($address) : ?><li class="flex gap-3"><?php echo abz_icon('map-pin', 'mt-0.5 h-5 w-5 shrink-0 text-gold-400'); ?><span><span class="block font-bold">مقرّ الإدارة</span><?php echo esc_html($address); ?><?php if ($map) : ?><a class="mt-1 block font-bold text-gold-300 underline underline-offset-4" href="<?php echo esc_url($map); ?>" target="_blank" rel="noopener">عرض على الخريطة</a><?php endif; ?></span></li><?php endif; ?>
          <?php if ($hours) : ?><li class="flex gap-3"><?php echo abz_icon('clock', 'mt-0.5 h-5 w-5 shrink-0 text-gold-400'); ?><span><span class="block font-bold">الاستجابة</span><?php echo esc_html($hours); ?></span></li><?php endif; ?>
          <li class="flex gap-3"><?php echo abz_icon('globe', 'mt-0.5 h-5 w-5 shrink-0 text-gold-400'); ?><span>خدماتنا متاحة عن بُعد في جميع أنحاء العالم.</span></li>
        </ul>
        <div class="mt-6"><?php echo abz_button(abz_wa_link('السلام عليكم، أودّ الاستفسار عن خدماتكم القانونية.'), abz_icon('message-circle', 'h-4 w-4') . ' راسلنا على واتساب', 'whatsapp', 'md', 'w-full', true); ?></div>
      </div>
      <div class="rounded-3xl border border-sand-200 bg-white p-6">
        <h2 class="mb-3 text-lg text-navy-900">تابعنا على وسائل التواصل</h2>
        <?php abz_social_icons('light', 'h-11 w-11'); ?>
        <?php $groups = array_filter(array_map('trim', explode("\n", (string) abz_setting('whatsapp_groups', '')))); if ($groups) : ?>
          <p class="mt-4 text-sm font-bold text-navy-900">مجتمعات واتساب</p>
          <ul class="mt-2 grid gap-1"><?php foreach ($groups as $i => $group) : ?><li><a class="inline-flex min-h-[40px] items-center gap-2 text-sm font-semibold text-whatsapp-700 underline underline-offset-4" href="<?php echo esc_url($group); ?>" target="_blank" rel="noopener"><?php echo abz_icon('users', 'h-4 w-4'); ?>مجموعة واتساب <?php echo esc_html((string) ($i + 1)); ?></a></li><?php endforeach; ?></ul>
        <?php endif; ?>
      </div>
    </aside>
  </div>
</section>
<?php get_footer();
