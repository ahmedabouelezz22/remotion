<?php
/* بطاقات آراء حقيقية منقولة حرفياً من خمسات، مع ذكر المصدر */
if (!defined('ABSPATH')) {
    exit;
}
$months = ['01' => 'يناير', '02' => 'فبراير', '03' => 'مارس', '04' => 'أبريل', '05' => 'مايو', '06' => 'يونيو', '07' => 'يوليو', '08' => 'أغسطس', '09' => 'سبتمبر', '10' => 'أكتوبر', '11' => 'نوفمبر', '12' => 'ديسمبر'];
foreach ($args['reviews'] ?? [] as $review) :
    [$year, $month] = explode('-', $review['month']); ?>
  <figure class="abz-reveal flex flex-col rounded-2xl border border-sand-200 bg-white p-6">
    <div class="flex items-center justify-between gap-3">
      <span class="flex gap-0.5 text-gold-500" aria-label="5 من 5"><?php for ($i = 0; $i < 5; $i++) { echo abz_icon('star', 'h-4 w-4 fill-gold-500'); } ?></span>
      <?php echo abz_icon('quote', 'h-6 w-6 text-sand-200'); ?>
    </div>
    <blockquote class="mt-4 flex-1 leading-8 text-navy-900">«<?php echo esc_html($review['text']); ?>»</blockquote>
    <figcaption class="mt-5 border-t border-sand-200 pt-4 text-sm">
      <span class="block font-extrabold text-navy-900"><?php echo esc_html($review['author']); ?></span>
      <span class="mt-0.5 block text-slate-600"><?php echo esc_html($review['service']); ?></span>
      <span class="mt-1 block text-xs text-slate-600">خمسات · <?php echo esc_html(($months[$month] ?? $month) . ' ' . $year); ?></span>
    </figcaption>
  </figure>
<?php endforeach;
