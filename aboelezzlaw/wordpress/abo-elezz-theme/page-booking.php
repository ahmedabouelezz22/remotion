<?php
if (!defined('ABSPATH')) {
    exit;
}
get_header();
the_post();
abz_page_hero('حجز استشارة', 'احجز موعداً مع مستشار قانوني', 'اختر نوع الاستشارة والموعد المناسب ووسيلة التواصل. نؤكّد الموعد ونرسل الأتعاب كتابةً خلال يوم عمل.', [['حجز استشارة', '']]);
$consultations = function_exists('wc_get_products') ? wc_get_products(['category' => ['consultations'], 'limit' => 6, 'status' => 'publish', 'orderby' => 'menu_order', 'order' => 'ASC']) : [];
?>
<section class="py-14 sm:py-20">
  <div class="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[1.25fr_0.75fr]">
    <div class="rounded-3xl border border-sand-200 bg-white p-6 sm:p-8">
      <h2 class="mb-2 text-2xl text-navy-900">طلب موعد</h2>
      <p class="mb-6 leading-8 text-slate-600">أرسل الطلب، ونردّ عليك بتأكيد الموعد والأتعاب ورابط الدفع. أو ادفع مسبقاً من الباقات المقابلة وتختار موعدك بعد الدفع.</p>
      <?php echo do_shortcode('[abz_form type="booking"]'); ?>
    </div>
    <aside class="grid content-start gap-4">
      <?php if ($consultations) : ?>
        <div class="rounded-3xl bg-navy-900 p-6 text-white">
          <h2 class="text-lg text-white">الاستشارات المدفوعة مسبقاً</h2>
          <ul class="mt-4 grid gap-2">
            <?php foreach ($consultations as $product) : ?>
              <li><a href="<?php echo esc_url($product->get_permalink()); ?>" class="flex min-h-[52px] items-center justify-between gap-3 rounded-xl border border-white/15 px-4 hover:border-gold-400"><span class="font-bold"><?php echo esc_html($product->get_name()); ?></span><span class="numeric shrink-0 font-display font-black text-gold-300"><?php echo wp_kses_post($product->get_price_html()); ?></span></a></li>
            <?php endforeach; ?>
          </ul>
        </div>
      <?php endif; ?>
      <div class="rounded-3xl border border-sand-200 bg-white p-6">
        <h2 class="text-lg text-navy-900">كيف يتم الحجز</h2>
        <ol class="mt-4 grid gap-3 text-sm leading-7 text-slate-700">
          <?php foreach (['ترسل الطلب ومعه ملخّص المسألة.', 'نؤكّد الموعد والأتعاب ووسيلة الجلسة كتابةً.', 'تدفع عبر الرابط الآمن وترسل مستنداتك قبل الموعد.', 'تنتهي الجلسة بملخّص مكتوب للرأي والخطوات التالية.'] as $i => $step) : ?>
            <li class="flex gap-3"><span class="numeric flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold-500 text-xs font-black text-navy-950"><?php echo esc_html((string) ($i + 1)); ?></span><?php echo esc_html($step); ?></li>
          <?php endforeach; ?>
        </ol>
      </div>
    </aside>
  </div>
</section>
<?php get_footer();
