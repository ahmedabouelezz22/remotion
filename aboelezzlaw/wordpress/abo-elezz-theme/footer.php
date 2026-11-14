<?php
if (!defined('ABSPATH')) {
    exit;
}
$phone = (string) abz_setting('phone', '01157844664');
$phone2 = (string) abz_setting('phone2', '');
$landline = (string) abz_setting('landline', '');
$email = (string) abz_setting('email', '');
$alt_email = (string) abz_setting('alt_email', '');
$address = (string) abz_setting('address', '');
$map = (string) abz_setting('map_url', '');
$hours = (string) abz_setting('hours', '');
$services = get_posts(['post_type' => 'abz_service', 'numberposts' => 6, 'orderby' => 'menu_order', 'order' => 'ASC']);
$heading = 'mb-4 font-display text-base font-extrabold text-white';
$item = 'inline-flex min-h-[36px] items-center text-sm text-navy-100 transition-colors hover:text-gold-300';
?>
</main>

<!-- النشرة البريدية -->
<section class="border-t border-white/10 bg-navy-900 text-white">
  <div class="mx-auto grid max-w-7xl items-center gap-6 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_1.1fr]">
    <div>
      <p class="text-sm font-bold tracking-[0.18em] text-gold-300">النشرة البريدية</p>
      <h2 class="mt-2 text-xl text-white sm:text-2xl">تحديثات تشريعية وتحليلات مختارة في بريدك</h2>
    </div>
    <div><?php echo do_shortcode('[abz_newsletter variant="dark"]'); ?></div>
  </div>
</section>

<footer class="bg-navy-950 text-navy-100">
  <div class="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-2 lg:grid-cols-[1.3fr_0.8fr_0.9fr_1.2fr]">
    <div>
      <a href="<?php echo esc_url(home_url('/')); ?>" class="flex items-center gap-3">
        <img src="<?php echo esc_url(get_template_directory_uri() . '/assets/logo-256.png'); ?>" alt="شعار مؤسسة أبو العز للمحاماة والاستشارات القانونية" width="56" height="50" loading="lazy" class="h-14 w-14 object-contain">
        <span class="leading-tight">
          <span class="block font-display text-lg font-black text-white">مؤسسة أبو العز</span>
          <span class="block text-xs font-semibold text-navy-100">للمحاماة والاستشارات القانونية</span>
        </span>
      </a>
      <p class="mt-5 max-w-sm text-sm leading-8">منصّة قانونية ومهنية تعمل عن بُعد: إدارة من الجيزة، وفريق وشبكة مختصّين وخدمات في جميع أنحاء العالم. نطاق العمل والأتعاب يُحدَّدان كتابةً قبل البدء.</p>
      <p class="mb-3 mt-6 text-sm font-bold text-white">تابعنا</p>
      <?php abz_social_icons('dark'); ?>
    </div>

    <div>
      <h2 class="<?php echo $heading; ?>">المؤسسة</h2>
      <ul class="grid">
        <?php foreach ([['عن المؤسسة', 'about'], ['رسالتنا وقيمنا', 'mission-values'], ['فريقنا', 'team'], ['عملاؤنا', 'clients'], ['الانضمام إلى الشبكة', 'careers'], ['لمكاتب المحاماة', 'law-firms'], ['العضويات', 'memberships'], ['أنشئ حسابك', 'register'], ['ادعم المنصّة', 'support'], ['ألعاب وألغاز', 'games'], ['المدونة', 'blog'], ['المكتبة القانونية', 'library'], ['حجز استشارة', 'booking'], ['اتصل بنا', 'contact']] as [$label, $slug]) : ?>
          <li><a class="<?php echo $item; ?>" href="<?php echo esc_url(abz_url($slug)); ?>"><?php echo esc_html($label); ?></a></li>
        <?php endforeach; ?>
      </ul>
    </div>

    <div>
      <h2 class="<?php echo $heading; ?>">الخدمات</h2>
      <ul class="grid">
        <?php foreach ($services as $service) : ?>
          <li><a class="<?php echo $item; ?>" href="<?php echo esc_url(get_permalink($service)); ?>"><?php echo esc_html($service->post_title); ?></a></li>
        <?php endforeach; ?>
        <li><a class="<?php echo $item; ?>" href="<?php echo esc_url(get_post_type_archive_link('abz_sector') ?: abz_url('sectors')); ?>">القطاعات</a></li>
        <li><a class="<?php echo $item; ?>" href="<?php echo esc_url(abz_url('practice-areas')); ?>">مجالات الممارسة</a></li>
        <li><a class="<?php echo $item; ?>" href="<?php echo esc_url(abz_shop_url()); ?>">المتجر</a></li>
        <li><a class="<?php echo $item; ?>" href="<?php echo esc_url(abz_url('marketplace')); ?>">سوق مستلزمات المحامين</a></li>
      </ul>
    </div>

    <div>
      <h2 class="<?php echo $heading; ?>">للتواصل</h2>
      <ul class="grid gap-3 text-sm">
        <?php if ($address) : ?>
          <li class="flex gap-2.5"><?php echo abz_icon('map-pin', 'mt-1 h-4 w-4 shrink-0 text-gold-400'); ?><span><span class="block text-xs font-bold text-gold-300">مقرّ الإدارة</span><?php echo esc_html($address); ?><?php if ($map) : ?><br><a class="font-bold text-gold-300 underline underline-offset-4" href="<?php echo esc_url($map); ?>" target="_blank" rel="noopener">عرض على الخريطة</a><?php endif; ?><br><span class="text-navy-100/80">وخدماتنا متاحة عن بُعد في جميع أنحاء العالم</span></span></li>
        <?php endif; ?>
        <li class="flex items-center gap-2.5"><?php echo abz_icon('message-circle', 'h-4 w-4 shrink-0 text-gold-400'); ?><span class="grid gap-1"><?php echo abz_phone_link($phone, 'block hover:text-gold-300'); ?><?php if ($phone2) : ?><?php echo abz_phone_link($phone2, 'block hover:text-gold-300'); ?><?php endif; ?></span></li>
        <?php if ($landline) : ?><li class="flex items-center gap-2.5"><?php echo abz_icon('phone', 'h-4 w-4 shrink-0 text-gold-400'); ?><?php echo abz_phone_link($landline, 'hover:text-gold-300'); ?></li><?php endif; ?>
        <?php foreach (array_filter([$email, $alt_email]) as $address_email) : ?>
          <li class="flex items-center gap-2.5"><?php echo abz_icon('mail', 'h-4 w-4 shrink-0 text-gold-400'); ?><a dir="ltr" class="hover:text-gold-300" href="mailto:<?php echo esc_attr($address_email); ?>"><?php echo esc_html($address_email); ?></a></li>
        <?php endforeach; ?>
        <?php if ($hours) : ?><li class="flex gap-2.5"><?php echo abz_icon('clock', 'mt-1 h-4 w-4 shrink-0 text-gold-400'); ?><span><?php echo esc_html($hours); ?></span></li><?php endif; ?>
      </ul>
      <div class="mt-5"><?php echo abz_button(abz_wa_link('السلام عليكم، أودّ الاستفسار عن خدماتكم القانونية.'), abz_icon('message-circle', 'h-4 w-4') . ' راسلنا على واتساب', 'whatsapp', 'sm', '', true); ?></div>
    </div>
  </div>

  <div class="border-t border-white/10">
    <div class="mx-auto max-w-7xl px-5 py-6 text-xs leading-7 sm:px-8">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <p>© <span class="numeric"><?php echo esc_html(wp_date('Y')); ?></span> <?php echo esc_html(abz_data('site.copyright', 'جميع الحقوق محفوظة لمؤسسة أبو العز للمحاماة والاستشارات القانونية')); ?></p>
        <ul class="flex flex-wrap gap-4">
          <li><a class="hover:text-gold-300" href="<?php echo esc_url(abz_url('privacy')); ?>">سياسة الخصوصية</a></li>
          <li><a class="hover:text-gold-300" href="<?php echo esc_url(abz_url('terms')); ?>">الشروط والأحكام</a></li>
        </ul>
      </div>
      <p class="mt-3 text-navy-100/80">إخلاء مسؤولية: المحتوى المنشور على هذا الموقع، بما فيه المقالات والمكتبة القانونية، ذو طبيعة تعريفية عامة، ولا يُعدّ استشارة قانونية في واقعة بعينها، ولا تنشأ به علاقة مهنية بين الزائر والمؤسسة.</p>
    </div>
  </div>
</footer>

<a href="<?php echo esc_url(abz_wa_link('السلام عليكم، أودّ الاستفسار عن خدماتكم القانونية.')); ?>" target="_blank" rel="noopener" class="fixed bottom-5 end-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp-600 text-white shadow-[0_10px_30px_rgba(16,127,114,0.45)] transition-transform hover:scale-105" aria-label="تواصل عبر واتساب"><?php echo abz_icon('message-circle', 'h-7 w-7'); ?></a>
<a href="#main" data-abz-top class="fixed bottom-5 start-5 z-40 hidden h-11 w-11 items-center justify-center rounded-full border border-sand-200 bg-white text-navy-900 shadow-lg hover:border-gold-500" aria-label="العودة إلى الأعلى"><?php echo abz_icon('chevron-up'); ?></a>
<?php wp_footer(); ?>
</body>
</html>
