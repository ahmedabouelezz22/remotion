<?php
if (!defined('ABSPATH')) {
    exit;
}
get_header();
the_post();
$audiences = abz_data('memberships.audiences', []);
$annual = (int) abz_data('memberships.annualMonthsCharged', 10);
$icons = ['user' => 'user', 'building' => 'building', 'scale' => 'scale', 'landmark' => 'landmark', 'badge-check' => 'badge-check'];
abz_page_hero('العضويات', 'عضويات للأفراد والشركات والمحامين', 'خمس فئات، لكل منها باقاتها. تبدأ بعضوية أساسية بالتسجيل، ثم تتدرّج في الخصومات والأرصدة والأولوية. والاشتراك السنوي يُحتسب بـ' . $annual . ' أشهر بدل 12.', [['العضويات', '']]);
?>
<div class="sticky top-[72px] z-30 border-b border-sand-200 bg-sand-50/95 backdrop-blur">
  <nav aria-label="فئات العضوية" class="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-5 py-3 sm:px-8">
    <?php foreach ($audiences as $audience) : ?><a class="inline-flex min-h-[44px] shrink-0 items-center rounded-full border border-sand-200 bg-white px-4 text-sm font-bold text-navy-900 hover:border-gold-500" href="#<?php echo esc_attr($audience['key']); ?>"><?php echo esc_html($audience['name']['ar']); ?></a><?php endforeach; ?>
  </nav>
</div>
<?php foreach ($audiences as $n => $audience) : ?>
<section id="<?php echo esc_attr($audience['key']); ?>" class="scroll-mt-36 py-14 <?php echo $n % 2 ? 'bg-sand-100' : ''; ?>">
  <div class="mx-auto max-w-7xl px-5 sm:px-8">
    <div class="flex items-start gap-4">
      <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-navy-900 text-gold-300"><?php echo abz_icon($icons[$audience['icon']] ?? 'user', 'h-6 w-6'); ?></span>
      <div><h2 class="text-2xl text-navy-900"><?php echo esc_html($audience['name']['ar']); ?></h2><p class="mt-1 leading-8 text-slate-600"><?php echo esc_html($audience['tagline']['ar']); ?></p></div>
    </div>
    <div class="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-<?php echo esc_attr((string) min(4, max(1, count($audience['tiers'])))); ?>">
      <?php foreach ($audience['tiers'] as $tier) :
          $product = !empty($tier['productSlug']) && function_exists('wc_get_product_id_by_sku') ? get_page_by_path($tier['productSlug'], OBJECT, 'product') : null;
          $wc = $product && function_exists('wc_get_product') ? wc_get_product($product->ID) : null;
          $features = $tier['features'];
          if ($wc && !$features) {
              $features = array_map(fn($line) => ['ar' => $line], array_values(array_filter(array_map('trim', explode("\n", wp_strip_all_tags(str_replace(['</li>', '</p>'], "\n", $wc->get_description())))))));
              $features = array_slice($features, 1);
          }
          $monthly = $wc ? (float) ($wc->get_type() === 'variable' ? $wc->get_variation_price('min') : $wc->get_price()) : ($tier['price'] ?? null);
          $highlight = !empty($tier['highlight']); ?>
        <div class="abz-reveal relative flex flex-col rounded-3xl border p-6 <?php echo $highlight ? 'border-gold-500 bg-white shadow-[0_18px_44px_rgba(11,31,58,0.12)]' : 'border-sand-200 bg-white'; ?>" data-abz-tilt>
          <?php if ($highlight) : ?><span class="absolute -top-3 start-6 rounded-full bg-gold-500 px-3 py-0.5 text-xs font-black text-navy-950">الأنسب لأغلب العملاء</span><?php endif; ?>
          <h3 class="text-lg text-navy-900"><?php echo esc_html($tier['name']['ar']); ?></h3>
          <div class="mt-3 min-h-[4.5rem]">
            <?php if ($monthly === 0.0 || $tier['price'] === 0) : ?>
              <p class="font-display text-2xl font-black text-navy-900"><?php echo $audience['key'] === 'team' ? 'بدعوة من المؤسسة' : 'بالتسجيل'; ?></p>
            <?php elseif ($monthly) : ?>
              <p class="numeric font-display text-2xl font-black text-navy-900"><?php echo esc_html(number_format_i18n($monthly)); ?> <span class="text-base">ج.م / شهرياً</span></p>
              <p class="numeric mt-1 text-sm font-bold text-forest-600">أو <?php echo esc_html(number_format_i18n($monthly * $annual)); ?> ج.م سنوياً — وفّر <?php echo esc_html((string) (12 - $annual)); ?> أشهر</p>
            <?php else : ?>
              <p class="font-display text-xl font-black text-slate-600">يُعلن السعر قريباً</p>
            <?php endif; ?>
          </div>
          <ul class="mt-4 grid flex-1 content-start gap-2.5 text-sm leading-7 text-slate-700">
            <?php foreach ($features as $feature) : ?><li class="flex gap-2.5"><?php echo abz_icon('check', 'mt-1 h-4 w-4 shrink-0 text-forest-600'); ?><?php echo esc_html($feature['ar']); ?></li><?php endforeach; ?>
          </ul>
          <div class="mt-6">
            <?php
            if ($audience['key'] === 'team') {
                echo '<p class="text-sm font-bold text-slate-600">تُفعَّل من المؤسسة لأعضاء الفريق.</p>';
            } elseif ($tier['price'] === 0) {
                echo abz_button(function_exists('wc_get_page_permalink') ? wc_get_page_permalink('myaccount') : abz_url('contact'), 'أنشئ حسابك', 'outline', 'md', 'w-full');
            } elseif ($wc) {
                echo abz_button($wc->get_permalink(), 'اشترك شهرياً أو سنوياً', 'gold', 'md', 'w-full');
            } else {
                echo abz_button(abz_url('contact') . '?topic=' . rawurlencode('اهتمام بعضوية ' . $audience['name']['ar'] . ' — باقة ' . $tier['name']['ar']), 'سجّل اهتمامك', 'primary', 'md', 'w-full');
            }
            ?>
          </div>
        </div>
      <?php endforeach; ?>
    </div>
    <?php if (!empty($audience['note']['ar'])) : ?><p class="mt-5 text-sm leading-7 text-slate-600"><?php echo esc_html($audience['note']['ar']); ?></p><?php endif; ?>
  </div>
</section>
<?php endforeach; ?>
<section class="py-14">
  <div class="mx-auto max-w-4xl px-5 sm:px-8">
    <h2 class="text-xl text-navy-900">ما يجب أن تعرفه</h2>
    <ul class="mt-4 grid gap-3 leading-8 text-slate-700">
      <li class="flex gap-3"><?php echo abz_icon('info', 'mt-1.5 h-4 w-4 shrink-0 text-gold-600'); ?>كل باقة تمنح ما هو مذكور فيها من أرصدة وخصومات، وما زاد على رصيد الباقة يُسعَّر منفرداً بعرض مكتوب قبل البدء.</li>
      <li class="flex gap-3"><?php echo abz_icon('info', 'mt-1.5 h-4 w-4 shrink-0 text-gold-600'); ?>الاشتراك يُدفع مقدَّماً عن المدة المختارة (شهر أو سنة)، ولا يُخصم من بطاقتك تلقائياً؛ نذكّرك قبل انتهاء المدة لتجدّد إن أردت.</li>
      <li class="flex gap-3"><?php echo abz_icon('info', 'mt-1.5 h-4 w-4 shrink-0 text-gold-600'); ?>المزايا الموسومة «عند إطلاقها» أدوات قيد التطوير، تُضاف إلى عضويتك حين تُطلق دون زيادة في سعر مدّتك الجارية.</li>
      <li class="flex gap-3"><?php echo abz_icon('info', 'mt-1.5 h-4 w-4 shrink-0 text-gold-600'); ?>العضوية لا تُنشئ بذاتها علاقة توكيل في قضية بعينها؛ التمثيل يُتَّفق عليه كتابةً لكل مسألة.</li>
    </ul>
  </div>
</section>
<?php get_footer();
