<?php
/**
 * الصفحة الرئيسية — واجهة تتفاعل مع حركة المؤشّر واللمس (app.js)، وتبقى
 * ساكنة كاملة لمن فعّل «تقليل الحركة». الأرقام المعروضة حقيقية فقط.
 */
if (!defined('ABSPATH')) {
    exit;
}
get_header();

$sectors = get_posts(['post_type' => 'abz_sector', 'numberposts' => 40, 'orderby' => 'menu_order', 'order' => 'ASC']);
$featured_sectors = array_values(array_filter($sectors, fn($s) => get_post_meta($s->ID, 'abz_featured', true)));
$services = get_posts(['post_type' => 'abz_service', 'numberposts' => 6, 'orderby' => 'menu_order', 'order' => 'ASC']);
$posts = get_posts(['post_type' => 'post', 'numberposts' => 3]);
$khamsat = abz_data('firm.khamsat', []);
$reviews = array_slice($khamsat['reviews'] ?? [], 0, 6);
$audiences = abz_data('memberships.audiences', []);
$faqs = abz_data('faqs', []);
$wa = abz_wa_link('السلام عليكم، أودّ الاستفسار عن خدماتكم القانونية.');
$service_icons = ['building' => 'building', 'file-text' => 'file-text', 'calculator' => 'calculator', 'users' => 'users', 'scale' => 'scale', 'shield-check' => 'shield-check'];
?>

<!-- ── الواجهة التفاعلية ── -->
<section class="abz-interactive relative isolate overflow-hidden bg-navy-950 text-white" data-abz-interactive>
  <div aria-hidden="true" class="pointer-events-none absolute inset-0 -z-10">
    <div class="abz-layer abz-layer-2 absolute -top-24 start-[-12%] h-[34rem] w-[34rem] rounded-full bg-forest-600/45 blur-[110px]"></div>
    <div class="abz-layer abz-layer-1 absolute -bottom-40 end-[-10%] h-[30rem] w-[30rem] rounded-full bg-gold-500/25 blur-[120px]"></div>
    <div class="abz-grid absolute inset-0"></div>
    <div class="abz-spotlight absolute inset-0"></div>
  </div>

  <div class="mx-auto w-full max-w-7xl px-5 pb-20 pt-14 sm:px-8 sm:pb-28 sm:pt-20">
    <div class="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
      <div>
        <span class="abz-rise mb-6 inline-flex items-center gap-2 rounded-full border border-gold-500/35 bg-navy-900 px-4 py-1.5 text-xs font-bold tracking-wide text-gold-300">
          <span class="abz-pulse h-1.5 w-1.5 rounded-full bg-gold-400" aria-hidden="true"></span>
          من الجيزة إلى العالم — خدمات قانونية حضورياً وعن بُعد
        </span>
        <h1 class="abz-rise abz-rise-1 text-[2.1rem] leading-[1.3] sm:text-5xl sm:leading-[1.25] lg:text-[3.4rem]">
          حلول قانونية متكاملة <span class="block text-gold-400">بدقّة المستشار وسرعة المنصّة</span>
        </h1>
        <p class="abz-rise abz-rise-2 mt-6 max-w-xl text-[1.05rem] leading-9 text-navy-100">صياغة ومراجعة العقود، والتقاضي والتحكيم، وخدمات الشركات والشركات الناشئة، وقانون العمل، والامتثال، في 27 قطاعاً. نطاق العمل والأتعاب يُحدَّدان كتابةً قبل البدء، والتسليم مستند مكتوب يمكنك البناء عليه.</p>
        <div class="abz-rise abz-rise-3 mt-9 flex flex-wrap gap-3">
          <?php echo abz_button(abz_url('booking'), 'احجز موعداً مع مستشار ' . abz_arrow(), 'gold', 'lg'); ?>
          <?php echo abz_button($wa, abz_icon('message-circle', 'h-4 w-4') . ' تواصل فوري عبر واتساب', 'whatsapp', 'lg', '', true); ?>
        </div>
        <ul class="abz-rise abz-rise-3 mt-8 flex flex-wrap gap-x-6 gap-y-2.5">
          <?php foreach (['عرض مكتوب قبل البدء', 'ردّ خلال يوم عمل', 'سرّية ملتزمة'] as $chip) : ?>
            <li class="flex items-center gap-2 text-sm text-navy-100"><span class="flex h-5 w-5 items-center justify-center rounded-full bg-forest-600 text-white"><?php echo abz_icon('check', 'h-3 w-3'); ?></span><?php echo esc_html($chip); ?></li>
          <?php endforeach; ?>
        </ul>
      </div>

      <div class="relative mx-auto w-full max-w-[30rem]">
        <div class="abz-layer abz-layer-1 aspect-square"><?php get_template_part('template-parts/globe'); ?></div>
        <div class="abz-layer abz-layer-3 abz-float absolute start-0 top-[8%] rounded-2xl border border-white/15 bg-navy-900 px-5 py-3.5 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <p class="numeric font-display text-2xl font-black text-gold-400" dir="ltr"><span data-count="1000" data-prefix="+">+1000</span></p>
          <p class="mt-0.5 text-xs leading-6 text-navy-100">خدمة قانونية منجزة</p>
        </div>
        <?php if ($khamsat) : ?>
          <a href="<?php echo esc_url($khamsat['profileUrl']); ?>" target="_blank" rel="noopener" class="abz-layer abz-layer-2 abz-float-slow absolute end-0 top-[40%] rounded-2xl border border-white/15 bg-navy-900 px-5 py-3.5 shadow-[0_18px_40px_rgba(0,0,0,0.35)] hover:border-gold-400">
            <p class="flex items-center gap-1.5 font-display text-2xl font-black text-gold-400"><span class="numeric" dir="ltr" data-count="<?php echo esc_attr($khamsat['average']); ?>"><?php echo esc_html($khamsat['average']); ?></span><?php echo abz_icon('star', 'h-5 w-5 fill-gold-400'); ?></p>
            <p class="mt-0.5 text-xs leading-6 text-navy-100"><span class="numeric"><?php echo esc_html((string) $khamsat['total']); ?></span> تقييماً حقيقياً على خمسات</p>
          </a>
        <?php endif; ?>
        <div class="abz-layer abz-layer-3 abz-float absolute bottom-[4%] start-[8%] rounded-2xl border border-white/15 bg-navy-900 px-5 py-3.5 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <p class="numeric font-display text-2xl font-black text-gold-400" dir="ltr"><span data-count="<?php echo esc_attr((string) count($sectors)); ?>"><?php echo esc_html((string) count($sectors)); ?></span></p>
          <p class="mt-0.5 text-xs leading-6 text-navy-100">قطاعاً نخدمه</p>
        </div>
      </div>
    </div>
  </div>

  <!-- شريط القطاعات -->
  <div class="border-t border-white/10 bg-navy-950">
    <p class="sr-only">القطاعات التي نخدمها</p>
    <div class="abz-marquee-wrap overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div class="abz-marquee flex w-max">
        <?php foreach ([false, true] as $duplicate) : ?>
          <ul class="flex shrink-0 items-center gap-2 py-3 pe-2"<?php echo $duplicate ? ' aria-hidden="true"' : ''; ?>>
            <?php foreach ($sectors as $sector) : ?>
              <li><a href="<?php echo esc_url(get_permalink($sector)); ?>"<?php echo $duplicate ? ' tabindex="-1"' : ''; ?> class="inline-flex min-h-[40px] items-center gap-2 whitespace-nowrap rounded-full border border-white/12 px-4 text-sm font-semibold text-navy-100 transition-colors hover:border-gold-400 hover:text-gold-300"><?php echo abz_icon((string) get_post_meta($sector->ID, 'abz_icon', true), 'h-4 w-4 text-gold-400'); ?><?php echo esc_html($sector->post_title); ?></a></li>
            <?php endforeach; ?>
          </ul>
        <?php endforeach; ?>
      </div>
    </div>
  </div>
</section>

<!-- ── من أين تبدأ ── -->
<section class="py-16 sm:py-24">
  <div class="mx-auto w-full max-w-7xl px-5 sm:px-8">
    <?php abz_section_heading('من أين تبدأ', 'اختر ما يناسب حاجتك', 'خمسة مداخل إلى المؤسسة، كلٌّ منها يقودك مباشرةً إلى ما تبحث عنه.'); ?>
    <div class="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      <a href="<?php echo esc_url(get_post_type_archive_link('abz_sector') ?: abz_url('sectors')); ?>" data-abz-tilt class="abz-reveal group relative isolate flex min-h-[20rem] flex-col overflow-hidden rounded-3xl bg-forest-900 p-8 text-white md:col-span-2">
        <div aria-hidden="true" class="absolute -bottom-16 -end-16 -z-10 grid grid-cols-4 gap-3 opacity-25 transition-opacity duration-300 group-hover:opacity-40">
          <?php foreach (array_slice($sectors, 0, 16) as $sector) : ?>
            <span class="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/25"><?php echo abz_icon((string) get_post_meta($sector->ID, 'abz_icon', true), 'h-7 w-7'); ?></span>
          <?php endforeach; ?>
        </div>
        <span class="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-500 text-navy-950"><?php echo abz_icon('layout-grid', 'h-6 w-6'); ?></span>
        <h3 class="text-2xl text-white sm:text-[1.75rem]">حلول لقطاعك</h3>
        <p class="mt-3 max-w-md leading-8 text-forest-100">خدمات مصمَّمة على طبيعة نشاطك في <?php echo esc_html((string) count($sectors)); ?> قطاعاً — من السيارات والإنشاءات إلى الطاقة والتسويق.</p>
        <span class="mt-auto inline-flex items-center gap-2 pt-8 font-bold text-gold-300">تصفّح القطاعات <?php echo abz_arrow(); ?></span>
      </a>
      <a href="<?php echo esc_url(abz_url('booking')); ?>" data-abz-tilt class="abz-reveal flex flex-col rounded-3xl bg-navy-900 p-7 text-white">
        <span class="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-gold-300"><?php echo abz_icon('calendar-check'); ?></span>
        <h3 class="mt-5 text-xl text-white">استشارة بموعد</h3>
        <p class="mt-2 leading-8 text-navy-100">اختر الموعد ووسيلة التواصل، وتنتهي الجلسة برأي مكتوب.</p>
        <span class="mt-auto inline-flex items-center gap-2 pt-4 text-sm font-bold text-gold-300">احجز الآن <?php echo abz_arrow(); ?></span>
      </a>
      <?php foreach ([
          [abz_shop_url('templates'), 'file-down', 'نماذج عقود فورية', 'اثنا عشر نموذجاً بصيغة Word، يصلك رابط التحميل فور الدفع.', 'عرض النماذج', 'bg-gold-50 border-gold-500/30'],
          [abz_url('memberships'), 'badge-check', 'عضويات شهرية وسنوية', 'للأفراد والشركات والمحامين ومكاتب المحاماة، والاشتراك السنوي أوفر.', 'قارن الباقات', 'bg-white border-sand-200'],
          [abz_url('blog'), 'book-open', 'مقالات ومكتبة', 'تحليلات موثّقة بمصادرها ومراجع رسمية مفتوحة.', 'اقرأ', 'bg-forest-50 border-forest-100'],
      ] as [$href, $icon, $title, $body, $cta, $tone]) : ?>
        <a href="<?php echo esc_url($href); ?>" data-abz-tilt class="abz-reveal group flex flex-col rounded-3xl border p-6 hover:shadow-[0_12px_32px_rgba(11,31,58,0.1)] <?php echo esc_attr($tone); ?>">
          <?php echo abz_icon($icon, 'h-6 w-6 text-forest-600'); ?>
          <h3 class="mt-4 text-lg text-navy-900"><?php echo esc_html($title); ?></h3>
          <p class="mt-2 flex-1 text-sm leading-7 text-slate-600"><?php echo esc_html($body); ?></p>
          <span class="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-navy-900 group-hover:text-forest-600"><?php echo esc_html($cta); ?> <?php echo abz_arrow(); ?></span>
        </a>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- ── القطاعات البارزة ── -->
<section class="bg-sand-100 py-16 sm:py-24">
  <div class="mx-auto w-full max-w-7xl px-5 sm:px-8">
    <div class="flex flex-wrap items-end justify-between gap-6">
      <?php abz_section_heading('القطاعات', 'نفهم نشاطك قبل أن نقرأ عقدك', 'العقد في قطاع السيارات غير العقد في الإنشاءات. لذلك ننظّم خدماتنا على القطاع أولاً، ثم على مجال الممارسة.', 'start'); ?>
      <?php echo abz_button(get_post_type_archive_link('abz_sector') ?: abz_url('sectors'), 'كل القطاعات ' . abz_arrow(), 'outline', 'sm'); ?>
    </div>
    <div class="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <?php foreach ($featured_sectors as $sector) : $count = count(abz_lines($sector->ID, 'abz_services')); ?>
        <a href="<?php echo esc_url(get_permalink($sector)); ?>" class="abz-reveal group flex gap-4 rounded-2xl border border-sand-200 bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-forest-600/50 hover:shadow-[0_10px_28px_rgba(13,59,48,0.1)]">
          <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-forest-50 text-forest-600 transition-colors duration-300 group-hover:bg-forest-600 group-hover:text-white"><?php echo abz_icon((string) get_post_meta($sector->ID, 'abz_icon', true), 'h-6 w-6'); ?></span>
          <span class="min-w-0">
            <span class="flex items-baseline justify-between gap-3"><span class="block font-display text-base font-extrabold text-navy-900"><?php echo esc_html($sector->post_title); ?></span><span class="numeric shrink-0 text-xs font-semibold text-slate-600"><?php echo esc_html((string) $count); ?> خدمة</span></span>
            <span class="mt-1.5 line-clamp-2 block text-sm leading-7 text-slate-600"><?php echo esc_html($sector->post_excerpt); ?></span>
          </span>
        </a>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- ── الخدمات الأساسية ── -->
<section class="py-16 sm:py-24">
  <div class="mx-auto w-full max-w-7xl px-5 sm:px-8">
    <?php abz_section_heading('مجالات العمل', 'خدمات مبنيّة على تخصّص لا على تعميم', 'كل خدمة لها نطاق محدّد ومخرجات معلومة مسبقاً، حتى تعرف ما ستتسلّمه قبل أن تبدأ.'); ?>
    <div class="mt-14 grid gap-px overflow-hidden rounded-3xl border border-sand-200 bg-sand-200 md:grid-cols-2 lg:grid-cols-3">
      <?php foreach ($services as $i => $service) : $icon = (string) get_post_meta($service->ID, 'abz_icon', true); ?>
        <a href="<?php echo esc_url(get_permalink($service)); ?>" class="group flex flex-col bg-white p-7 transition-colors duration-300 hover:bg-navy-900">
          <span class="flex items-center justify-between">
            <span class="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-50 text-navy-900 transition-colors duration-300 group-hover:bg-gold-500 group-hover:text-navy-950"><?php echo abz_icon($service_icons[$icon] ?? 'scale', 'h-6 w-6'); ?></span>
            <span class="numeric font-display text-sm font-black text-slate-500 group-hover:text-gold-300" dir="ltr" aria-hidden="true"><?php echo esc_html(str_pad((string) ($i + 1), 2, '0', STR_PAD_LEFT)); ?></span>
          </span>
          <span class="mt-5 block font-display text-lg font-extrabold text-navy-900 group-hover:text-white"><?php echo esc_html($service->post_title); ?></span>
          <span class="mt-2.5 block flex-1 text-sm leading-8 text-slate-600 group-hover:text-navy-100"><?php echo esc_html($service->post_excerpt); ?></span>
          <span class="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-navy-900 group-hover:text-gold-300">تفاصيل الخدمة <?php echo abz_arrow('h-3.5 w-3.5'); ?></span>
        </a>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- ── كيف نعمل والمنهج ── -->
<section class="relative isolate overflow-hidden bg-forest-900 py-16 text-white sm:py-24">
  <div aria-hidden="true" class="abz-drift pointer-events-none absolute top-0 end-[-6%] -z-10 h-[26rem] w-[26rem] rounded-full bg-forest-600/60 blur-[110px]"></div>
  <div class="mx-auto grid w-full max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-2">
    <div>
      <p class="mb-3 text-sm font-bold tracking-[0.18em] text-gold-300">كيف نعمل</p>
      <h2 class="text-2xl text-white sm:text-3xl lg:text-[2.1rem]">أربع خطوات واضحة من أول تواصل</h2>
      <ol class="relative mt-10 space-y-8 border-s border-white/20 ps-8">
        <?php foreach ([['تواصل وتحديد النطاق', 'تشرح المسألة، ونحدّد ما نحتاجه من مستندات.'], ['عرض مكتوب', 'نطاق العمل والأتعاب والمدة — كتابةً قبل البدء.'], ['الدراسة والتنفيذ', 'تحليل المستندات وإعداد الرأي أو المستند المطلوب.'], ['التسليم والمتابعة', 'مستند مكتوب وجلسة مناقشة للخطوات التالية.']] as $i => [$title, $body]) : ?>
          <li class="abz-reveal relative">
            <span class="absolute -start-[3.1rem] top-0 flex h-9 w-9 items-center justify-center rounded-full bg-gold-500 font-display text-sm font-black text-navy-950 ring-4 ring-forest-900" aria-hidden="true"><?php echo esc_html((string) ($i + 1)); ?></span>
            <h3 class="text-lg text-white"><?php echo esc_html($title); ?></h3>
            <p class="mt-1.5 leading-8 text-forest-100"><?php echo esc_html($body); ?></p>
          </li>
        <?php endforeach; ?>
      </ol>
    </div>
    <div>
      <p class="mb-3 text-sm font-bold tracking-[0.18em] text-gold-300">المنهج</p>
      <h2 class="text-2xl text-white sm:text-3xl lg:text-[2.1rem]">ما الذي يميّز العمل هنا</h2>
      <p class="mt-4 leading-9 text-forest-100">الفارق ليس في معرفة النصوص — النصوص متاحة للجميع. الفارق في ترتيب الأولويات وتقدير الكلفة.</p>
      <div class="mt-8 grid gap-4 sm:grid-cols-2">
        <?php foreach ([['رأي مكتوب ومُسبَّب', 'كل استشارة تنتهي بمستند مكتوب يبيّن الرأي وسنده وبدائله، لا بإجابة شفهية تُنسى.'], ['تقدير للكلفة قبل البدء', 'يُحدَّد نطاق العمل والأتعاب ومدة التنفيذ كتابةً قبل الشروع، فلا مفاجآت في الفاتورة.'], ['قراءة اقتصادية للمسألة', 'الحل القانوني الصحيح ليس دائماً الأجدى مالياً. نضع الكلفة والزمن في ميزان القرار.'], ['سرّية ملتزمة', 'المستندات لا تُتداول خارج المؤسسة، ويمكن توقيع اتفاقية عدم إفصاح قبل إرسال أي ورقة.']] as [$title, $body]) : ?>
          <div class="abz-reveal rounded-2xl border border-white/15 bg-forest-800 p-5" data-abz-tilt>
            <h3 class="text-base text-white"><?php echo esc_html($title); ?></h3>
            <p class="mt-2 text-sm leading-7 text-forest-100"><?php echo esc_html($body); ?></p>
          </div>
        <?php endforeach; ?>
      </div>
    </div>
  </div>
</section>

<?php if (function_exists('wc_get_products')) : $products = wc_get_products(['featured' => true, 'limit' => 3, 'status' => 'publish']); ?>
<!-- ── المتجر ── -->
<section class="py-16 sm:py-24">
  <div class="mx-auto w-full max-w-7xl px-5 sm:px-8">
    <?php abz_section_heading('المتجر', 'خدمات ومنتجات بأسعار معلومة', 'اطّلع على النطاق والسعر قبل التواصل، واطلب الخدمة أو احجز موعدك مباشرة.'); ?>
    <div class="mt-14 grid gap-6 md:grid-cols-3">
      <?php foreach ($products as $product) : ?>
        <a href="<?php echo esc_url($product->get_permalink()); ?>" data-abz-tilt class="abz-reveal flex flex-col rounded-3xl border border-sand-200 bg-white p-6 hover:border-gold-400/60 hover:shadow-[0_12px_32px_rgba(11,31,58,0.12)]">
          <?php $badge = (string) get_post_meta($product->get_id(), '_abz_badge', true); if ($badge) : ?><span class="mb-4 inline-flex w-fit rounded-full border border-gold-500/40 bg-gold-50 px-3 py-1 text-xs font-bold text-gold-600"><?php echo esc_html($badge); ?></span><?php endif; ?>
          <h3 class="mb-2.5 text-lg text-navy-900"><?php echo esc_html($product->get_name()); ?></h3>
          <div class="mb-6 flex-1 text-sm leading-8 text-slate-600"><?php echo wp_kses_post($product->get_short_description()); ?></div>
          <span class="numeric mb-5 font-display text-2xl font-black text-navy-900"><?php echo wp_kses_post($product->get_price_html()); ?></span>
          <span class="inline-flex min-h-[44px] items-center justify-center rounded-xl border-2 border-navy-900 font-bold text-navy-900">اطلب الخدمة</span>
        </a>
      <?php endforeach; ?>
    </div>
    <div class="mt-10 text-center"><?php echo abz_button(abz_shop_url(), 'تصفّح المتجر بالكامل ' . abz_arrow(), 'primary'); ?></div>
  </div>
</section>
<?php endif; ?>

<?php if ($reviews) : ?>
<!-- ── آراء العملاء (حقيقية، من خمسات) ── -->
<section class="bg-sand-100 py-16 sm:py-24">
  <div class="mx-auto w-full max-w-7xl px-5 sm:px-8">
    <?php abz_section_heading('آراء العملاء', 'ما كتبه العملاء عن تجربتهم', sprintf('%s تقييماً بمتوسط %s من 5 على منصّة خمسات — منقولة كما كتبها أصحابها.', $khamsat['total'], $khamsat['average'])); ?>
    <div class="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      <?php get_template_part('template-parts/reviews', null, ['reviews' => $reviews]); ?>
    </div>
    <div class="mt-10 flex flex-wrap justify-center gap-3">
      <?php echo abz_button(abz_url('clients'), 'المزيد من آراء العملاء', 'primary'); ?>
      <?php echo abz_button($khamsat['profileUrl'], 'التقييمات على خمسات ' . abz_icon('external-link', 'h-4 w-4'), 'outline', 'md', '', true); ?>
    </div>
  </div>
</section>
<?php endif; ?>

<!-- ── العضويات ── -->
<section class="py-16 sm:py-24">
  <div class="mx-auto w-full max-w-7xl px-5 sm:px-8">
    <?php abz_section_heading('العضويات', 'عضوية لكل نوع من العملاء', 'كل فئة لها باقاتها ومزاياها، والاشتراك السنوي أوفر من الشهري.'); ?>
    <div class="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <?php $audience_icons = ['user' => 'user', 'building' => 'building', 'scale' => 'scale', 'landmark' => 'landmark', 'badge-check' => 'badge-check'];
      foreach ($audiences as $audience) : $team = $audience['key'] === 'team'; ?>
        <a href="<?php echo esc_url(abz_url('memberships') . '#' . $audience['key']); ?>" data-abz-tilt class="abz-reveal group flex flex-col rounded-2xl border p-5 hover:shadow-[0_12px_32px_rgba(11,31,58,0.1)] <?php echo $team ? 'border-navy-900 bg-navy-900 text-white' : 'border-sand-200 bg-white hover:border-gold-500/60'; ?>">
          <span class="flex h-11 w-11 items-center justify-center rounded-xl <?php echo $team ? 'bg-gold-500 text-navy-950' : 'bg-gold-50 text-gold-600'; ?>"><?php echo abz_icon($audience_icons[$audience['icon']] ?? 'user'); ?></span>
          <span class="mt-4 block font-display text-base font-extrabold <?php echo $team ? 'text-white' : 'text-navy-900'; ?>"><?php echo esc_html($audience['name']['ar']); ?></span>
          <span class="mt-2 block flex-1 text-sm leading-7 <?php echo $team ? 'text-navy-100' : 'text-slate-600'; ?>"><?php echo esc_html($audience['tagline']['ar']); ?></span>
          <span class="mt-4 text-xs font-bold <?php echo $team ? 'text-gold-300' : 'text-forest-600'; ?>"><?php echo $team ? 'بدعوة من المؤسسة' : esc_html(count($audience['tiers']) . ' باقات'); ?></span>
        </a>
      <?php endforeach; ?>
    </div>
    <div class="mt-10 text-center"><?php echo abz_button(abz_url('memberships'), 'كل العضويات والمزايا ' . abz_arrow(), 'primary'); ?></div>
  </div>
</section>

<?php if ($posts) : ?>
<!-- ── المدونة ── -->
<section class="bg-sand-100 py-16 sm:py-24">
  <div class="mx-auto w-full max-w-7xl px-5 sm:px-8">
    <?php abz_section_heading('المدونة', 'تحليلات قانونية موثّقة بمصادرها', 'مقالات أصلية تُحيل إلى نصوصها ومصادرها الرسمية بروابط مباشرة.'); ?>
    <div class="mt-14 grid gap-6 md:grid-cols-3">
      <?php global $post; foreach ($posts as $post) : setup_postdata($post); get_template_part('template-parts/article-card'); endforeach; wp_reset_postdata(); ?>
    </div>
    <div class="mt-10 text-center"><?php echo abz_button(abz_url('blog'), 'كل المقالات', 'outline'); ?></div>
  </div>
</section>
<?php endif; ?>

<?php if ($faqs) : ?>
<!-- ── الأسئلة الشائعة ── -->
<section class="py-16 sm:py-24">
  <div class="mx-auto w-full max-w-3xl px-5 sm:px-8">
    <?php abz_section_heading('أسئلة شائعة', 'ما يسأل عنه معظم العملاء'); ?>
    <div class="mt-12 space-y-3">
      <?php foreach ($faqs as $faq) : ?>
        <details class="group rounded-2xl border border-sand-200 bg-white px-6 py-5 transition-colors open:border-gold-400/60">
          <summary class="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-navy-900 [&::-webkit-details-marker]:hidden"><?php echo esc_html($faq['question']); ?><span class="shrink-0 text-xl text-gold-600 transition-transform group-open:rotate-45" aria-hidden="true">+</span></summary>
          <p class="mt-4 text-[0.95rem] leading-8 text-slate-600"><?php echo esc_html($faq['answer']); ?></p>
        </details>
      <?php endforeach; ?>
    </div>
  </div>
</section>
<?php endif; ?>

<?php get_template_part('template-parts/cta-band'); ?>
<?php get_footer(); ?>
