<?php
if (!defined('ABSPATH')) {
    exit;
}
get_header();
the_post();
$slug = get_post_field('post_name', get_the_ID());
$services = abz_lines(get_the_ID(), 'abz_services');
$icon = (string) get_post_meta(get_the_ID(), 'abz_icon', true);
$others = get_posts(['post_type' => 'abz_sector', 'numberposts' => 4, 'post__not_in' => [get_the_ID()], 'orderby' => 'rand']);
$core = get_posts(['post_type' => 'abz_service', 'numberposts' => 3, 'orderby' => 'menu_order', 'order' => 'ASC']);
$topic = 'طلب خدمة — قطاع ' . get_the_title();
$wa = abz_wa_link('السلام عليكم، أحتاج خدمة قانونية في قطاع ' . get_the_title() . '.');
abz_page_hero('القطاعات', get_the_title(), get_the_excerpt(), [['القطاعات', get_post_type_archive_link('abz_sector')], [get_the_title(), '']], abz_sector_photo($slug));
?>
<section class="py-14 sm:py-20">
  <div class="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[1.3fr_0.7fr]">
    <div>
      <div class="abz-reveal mb-10 overflow-hidden rounded-[2rem]"><img src="<?php echo esc_url(abz_img(abz_sector_photo($slug))); ?>" alt="<?php echo esc_attr('قطاع ' . get_the_title()); ?>" width="1200" height="750" class="aspect-[16/8] w-full object-cover"></div>
      <h2 class="text-2xl text-navy-900">ما نعمل عليه في قطاع <?php the_title(); ?></h2>
      <p class="mt-3 leading-8 text-slate-600">لكل قطاع عقوده ومخاطره وجهاته التنظيمية. هذه أكثر الأعمال طلباً من عملائنا فيه، ويمكنك طلب أيٍّ منها مباشرة:</p>
      <ul class="mt-6 grid gap-3 sm:grid-cols-2">
        <?php foreach ($services as $line) : ?>
          <li class="abz-reveal"><a href="<?php echo esc_url(abz_url('contact') . '?topic=' . rawurlencode(get_the_title() . ' — ' . $line)); ?>" class="group flex h-full items-start gap-3 rounded-2xl border border-sand-200 bg-white p-4 leading-8 text-navy-900 hover:border-gold-500 hover:shadow-md"><span class="mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-forest-600 text-white"><?php echo abz_icon('check', 'h-3 w-3'); ?></span><span class="flex-1"><?php echo esc_html($line); ?></span><span class="mt-1 shrink-0 text-xs font-bold text-gold-600 opacity-0 transition-opacity group-hover:opacity-100">اطلبها</span></a></li>
        <?php endforeach; ?>
      </ul>
      <?php if (get_the_content()) : ?><div class="prose-page mt-8"><?php the_content(); ?></div><?php endif; ?>

      <?php if ($slug === 'hospitality') : ?>
        <div class="abz-reveal mt-10 overflow-hidden rounded-3xl border border-gold-500/50 bg-gold-50 md:grid md:grid-cols-[0.8fr_1.2fr]">
          <img src="<?php echo esc_url(abz_img('travel')); ?>" alt="جواز سفر وحقيبة" width="1200" height="750" loading="lazy" class="h-full min-h-[12rem] w-full object-cover">
          <div class="p-7">
            <p class="text-sm font-bold text-gold-600">جديد — للسياح والزائرين</p>
            <h2 class="mt-1 text-2xl text-navy-900">باقات الحماية القانونية للسائح</h2>
            <p class="mt-2 leading-8 text-slate-700">مساندة قانونية مدفوعة مسبقاً لمدة رحلتك في مصر: خط واتساب بأولوية، استشارات، ومراجعة عقود الإيجار والحجز قبل التوقيع. ثلاث باقات حتى 15 و30 و90 يوماً.</p>
            <div class="mt-4"><?php echo abz_button(abz_url('memberships') . '#tourists', 'اعرض باقات السياح ' . abz_arrow(), 'primary'); ?></div>
          </div>
        </div>
      <?php endif; ?>

      <h2 class="mt-12 text-2xl text-navy-900">كيف نخدم عملاء هذا القطاع</h2>
      <div class="mt-6 grid gap-4 sm:grid-cols-3">
        <?php foreach ([['search', 'نفهم النشاط أولاً', 'نبدأ بطبيعة عملك ومصطلحاته ومخاطره قبل قراءة الأوراق.'], ['file-text', 'عرض مكتوب', 'النطاق والسعر والمدة كتابةً قبل أي التزام.'], ['users', 'المختص المناسب', 'يُسنَد العمل للمختص بالنظام واجب التطبيق، وبمحامٍ مرخَّص محلياً حيث يلزم.']] as [$i, $t, $b]) : ?>
          <div class="abz-reveal rounded-2xl bg-sand-100 p-5"><?php echo abz_icon($i, 'h-6 w-6 text-forest-600'); ?><h3 class="mt-3 text-base text-navy-900"><?php echo esc_html($t); ?></h3><p class="mt-1 text-sm leading-7 text-slate-600"><?php echo esc_html($b); ?></p></div>
        <?php endforeach; ?>
      </div>

      <h2 class="mt-12 text-2xl text-navy-900">خدمات أساسية ترتبط بهذا القطاع</h2>
      <div class="mt-6 grid gap-4 sm:grid-cols-3">
        <?php foreach ($core as $service) : ?>
          <a href="<?php echo esc_url(get_permalink($service)); ?>" class="abz-reveal group overflow-hidden rounded-2xl border border-sand-200 bg-white hover:border-gold-500">
            <?php echo abz_cover(abz_service_photo($service->post_name), '', 'aspect-[16/9]'); ?>
            <span class="block p-4 font-display font-extrabold leading-7 text-navy-900 group-hover:text-gold-600"><?php echo esc_html($service->post_title); ?></span>
          </a>
        <?php endforeach; ?>
      </div>
    </div>
    <aside class="grid content-start gap-4">
      <div class="sticky top-24 grid gap-4">
        <div class="rounded-3xl bg-navy-900 p-6 text-white">
          <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-500 text-navy-950"><?php echo abz_icon($icon ?: 'briefcase', 'h-6 w-6'); ?></span>
          <h2 class="mt-4 text-xl text-white">تحتاج خدمة في هذا القطاع؟</h2>
          <p class="mt-2 leading-8 text-navy-100">صف لنا المسألة ويصلك تقدير للنطاق والسعر والمدة قبل أي التزام.</p>
          <div class="mt-5 grid gap-2">
            <?php echo abz_button(abz_url('contact') . '?topic=' . rawurlencode($topic), 'اطلب عرض سعر', 'gold', 'md', 'w-full'); ?>
            <?php echo abz_button(abz_url('booking') . '?topic=' . rawurlencode('استشارة — قطاع ' . get_the_title()), 'احجز استشارة', 'outline-light', 'md', 'w-full'); ?>
            <?php echo abz_button($wa, abz_icon('message-circle', 'h-4 w-4') . ' واتساب', 'whatsapp', 'md', 'w-full', true); ?>
          </div>
          <ul class="mt-5 grid gap-2 border-t border-white/15 pt-4 text-sm text-navy-100">
            <?php foreach (['ردّ خلال يوم عمل', 'عرض مكتوب قبل البدء', 'سرّية ملتزمة'] as $chip) : ?><li class="flex items-center gap-2"><?php echo abz_icon('check', 'h-4 w-4 text-gold-400'); ?><?php echo esc_html($chip); ?></li><?php endforeach; ?>
          </ul>
        </div>
        <a href="<?php echo esc_url(abz_shop_url('retainers')); ?>" class="rounded-3xl border border-sand-200 bg-white p-6 hover:border-gold-500">
          <p class="text-sm font-bold text-gold-600">لمنشآت هذا القطاع</p>
          <p class="mt-1 font-display text-lg font-extrabold text-navy-900">مستشار دائم بمقابل شهري معلوم</p>
          <p class="mt-1 text-sm leading-7 text-slate-600">باقات الشركات تبدأ برصيد شهري من الاستشارات ومراجعة العقود، وخصم على ما زاد.</p>
          <span class="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-navy-900">قارن الباقات <?php echo abz_arrow('h-3.5 w-3.5'); ?></span>
        </a>
      </div>
    </aside>
  </div>
</section>
<section class="bg-sand-100 py-14">
  <div class="mx-auto max-w-7xl px-5 sm:px-8">
    <div class="flex flex-wrap items-end justify-between gap-4"><h2 class="text-2xl text-navy-900">قطاعات أخرى</h2><?php echo abz_button(get_post_type_archive_link('abz_sector'), 'كل القطاعات ' . abz_arrow('h-3.5 w-3.5'), 'outline', 'sm'); ?></div>
    <div class="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <?php foreach ($others as $sector) : ?>
        <a class="group overflow-hidden rounded-2xl border border-sand-200 bg-white hover:border-gold-500" href="<?php echo esc_url(get_permalink($sector)); ?>"><?php echo abz_cover(abz_sector_photo($sector->post_name), (string) get_post_meta($sector->ID, 'abz_icon', true), 'aspect-[16/9]'); ?><span class="block p-4 font-display font-extrabold text-navy-900"><?php echo esc_html($sector->post_title); ?></span></a>
      <?php endforeach; ?>
    </div>
  </div>
</section>
<?php get_footer();
