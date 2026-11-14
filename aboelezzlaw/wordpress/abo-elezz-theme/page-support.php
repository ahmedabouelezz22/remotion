<?php
/* دعم المنصّة: مساهمات اختيارية — وليست مقابل خدمة قانونية */
if (!defined('ABSPATH')) {
    exit;
}
get_header();
the_post();
$support = abz_data('platform.support', []);
$brand = ['instapay' => ['bg-[#4b1d7a] text-white', 'zap'], 'paypal' => ['bg-[#003087] text-white', 'credit-card'], 'patreon' => ['bg-navy-950 text-white', 'heart']];
abz_page_hero('ساهم معنا', (string) ($support['title'] ?? get_the_title()), (string) ($support['lead'] ?? ''), [['ادعم المنصّة', '']], 'books');
?>
<section class="py-14 sm:py-20">
  <div class="mx-auto max-w-7xl px-5 sm:px-8">
    <?php abz_section_heading('أين يذهب دعمك', 'كل مساهمة تتحوّل إلى معرفة وأدوات متاحة للجميع'); ?>
    <div class="mt-10 grid gap-5 md:grid-cols-3">
      <?php foreach ($support['uses'] ?? [] as $use) : ?>
        <div class="abz-reveal rounded-3xl border border-sand-200 bg-white p-7 text-center" data-abz-tilt>
          <span class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-50 text-gold-600"><?php echo abz_icon($use['icon'], 'h-7 w-7'); ?></span>
          <h3 class="mt-5 text-lg text-navy-900"><?php echo esc_html($use['title']); ?></h3>
          <p class="mt-2 leading-8 text-slate-600"><?php echo esc_html($use['body']); ?></p>
        </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<section class="relative isolate overflow-hidden bg-navy-950 py-14 text-white sm:py-20">
  <div aria-hidden="true" class="pointer-events-none absolute inset-0 -z-10"><div class="abz-drift absolute top-0 start-1/3 h-[28rem] w-[28rem] rounded-full bg-gold-500/15 blur-[120px]"></div><div class="abz-grid absolute inset-0"></div></div>
  <div class="mx-auto max-w-7xl px-5 sm:px-8">
    <?php abz_section_heading('طرق الدعم', 'اختر الطريقة الأنسب لك', 'من داخل مصر أو من أي دولة، مرة واحدة أو شهرياً.', 'center', true); ?>
    <div class="mt-12 grid gap-6 lg:grid-cols-3">
      <?php foreach ($support['methods'] ?? [] as $method) : [$tone, $icon] = $brand[$method['key']] ?? ['bg-navy-900 text-white', 'heart']; ?>
        <article class="abz-reveal flex flex-col overflow-hidden rounded-3xl border border-white/15 bg-white text-navy-900" data-abz-tilt>
          <div class="flex items-center justify-between px-6 py-4 <?php echo esc_attr($tone); ?>">
            <h3 class="font-display text-xl font-black text-white" dir="ltr"><?php echo esc_html($method['title']); ?></h3>
            <?php echo abz_icon($icon, 'h-6 w-6'); ?>
          </div>
          <div class="flex flex-1 flex-col p-6 text-center">
            <p class="font-bold text-slate-700"><?php echo esc_html($method['note']); ?></p>
            <?php if (!empty($method['qr'])) : ?>
              <img src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/instapay-qr.png'); ?>" alt="رمز QR للتحويل عبر InstaPay إلى <?php echo esc_attr($method['handle']); ?>" width="520" height="712" loading="lazy" class="mx-auto mt-4 w-52 rounded-xl border border-sand-200">
              <p class="mt-2 text-xs text-slate-600">امسح الرمز من تطبيق البنك أو InstaPay</p>
            <?php else : ?>
              <div class="mx-auto mt-6 flex h-28 w-28 items-center justify-center rounded-full bg-sand-100 text-gold-600"><?php echo abz_icon($icon, 'h-12 w-12'); ?></div>
            <?php endif; ?>
            <p class="numeric mt-4 break-all rounded-xl bg-sand-100 px-3 py-2 text-sm font-bold" dir="ltr"><?php echo esc_html($method['handle']); ?></p>
            <div class="mt-auto pt-5"><?php echo abz_button($method['url'], 'ادعم عبر ' . $method['title'] . ' ' . abz_icon('external-link', 'h-4 w-4'), 'gold', 'md', 'w-full', true); ?></div>
          </div>
        </article>
      <?php endforeach; ?>
    </div>
    <p class="mx-auto mt-10 max-w-3xl rounded-2xl border border-white/15 bg-navy-900 p-5 text-center text-sm leading-8 text-navy-100"><?php echo esc_html($support['note'] ?? ''); ?></p>
  </div>
</section>

<section class="py-14">
  <div class="mx-auto max-w-3xl px-5 text-center sm:px-8">
    <h2 class="text-2xl text-navy-900">طرق أخرى للمساهمة</h2>
    <p class="mt-3 leading-9 text-slate-600">شارك مقالاتنا، تابع حساباتنا، أو اقترح موضوعاً نكتب عنه. وإن كنت محامياً أو باحثاً وتودّ الكتابة معنا فراسلنا.</p>
    <div class="mt-6 flex justify-center"><?php abz_social_icons('light', 'h-11 w-11'); ?></div>
    <div class="mt-6 flex flex-wrap justify-center gap-3">
      <?php echo abz_button(abz_url('contact') . '?topic=' . rawurlencode('اقتراح موضوع أو مساهمة في المحتوى'), 'اقترح أو ساهم في المحتوى', 'primary'); ?>
      <?php echo abz_button(abz_url('blog'), 'اقرأ المدونة', 'outline'); ?>
    </div>
  </div>
</section>
<?php get_footer();
