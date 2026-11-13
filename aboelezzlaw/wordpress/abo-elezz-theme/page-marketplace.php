<?php
if (!defined('ABSPATH')) {
    exit;
}
get_header();
the_post();
$market = abz_data('firm.marketplace', []);
$icons = ['robes' => 'scale', 'mens-wear' => 'shirt', 'womens-wear' => 'shirt', 'electronics' => 'laptop', 'office-supplies' => 'book-open', 'printing-stamps' => 'printer', 'furniture' => 'armchair'];
abz_page_hero('المتجر', $market['title'] ?? get_the_title(), 'مستلزمات المحاماة والمكاتب بأسعار مخفّضة للسادة المحامين، عبر موردين متعاقدين.', [['المتجر', abz_shop_url()], [$market['title'] ?? '', '']]);
?>
<section class="py-14 sm:py-20">
  <div class="mx-auto max-w-7xl px-5 sm:px-8">
    <div class="rounded-2xl border border-gold-500 bg-gold-50 p-5 leading-8 text-navy-900" role="note">
      <p class="flex gap-3 font-semibold"><?php echo abz_icon('info', 'mt-1.5 h-5 w-5 shrink-0 text-gold-600'); ?><span><?php echo esc_html($market['disclaimer'] ?? ''); ?></span></p>
    </div>
    <p class="mt-6 rounded-2xl border border-forest-100 bg-forest-50 p-5 font-semibold text-forest-900"><?php echo esc_html($market['status'] ?? ''); ?></p>
    <div class="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <?php foreach ($market['categories'] ?? [] as $category) : ?>
        <div class="abz-reveal flex flex-col rounded-3xl border border-sand-200 bg-white p-6" data-abz-tilt>
          <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-900 text-gold-300"><?php echo abz_icon($icons[$category['slug']] ?? 'store', 'h-6 w-6'); ?></span>
          <h2 class="mt-4 text-lg text-navy-900"><?php echo esc_html($category['title']); ?></h2>
          <p class="mt-2 flex-1 leading-8 text-slate-600"><?php echo esc_html($category['body']); ?></p>
          <span class="mt-3 w-fit rounded-full bg-sand-100 px-3 py-1 text-xs font-bold text-slate-600">قريباً</span>
          <div class="mt-4"><?php echo abz_button(abz_url('contact') . '?topic=' . rawurlencode('اهتمام بسوق المستلزمات — ' . $category['title']), 'سجّل اهتمامك', 'outline', 'sm', 'w-full'); ?></div>
        </div>
      <?php endforeach; ?>
    </div>
    <div class="mt-12 grid gap-6 rounded-3xl bg-navy-900 p-8 text-white md:grid-cols-[1fr_auto] md:items-center">
      <div><h2 class="text-2xl text-white">مورّد أو مقدّم خدمة للمحامين؟</h2><p class="mt-2 leading-8 text-navy-100">نتعاقد مع موردين يقدّمون أسعاراً مخفّضة للسادة المحامين، وفق شروط مكتوبة تحدّد مسؤولية المورّد عن المنتج وضمانه وشحنه وفاتورته.</p></div>
      <?php echo abz_button(abz_url('contact') . '?topic=' . rawurlencode('طلب انضمام مورّد إلى سوق مستلزمات المحامين'), 'انضم كمورّد', 'gold'); ?>
    </div>
  </div>
</section>
<?php get_footer();
