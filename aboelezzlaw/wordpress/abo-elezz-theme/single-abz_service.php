<?php
if (!defined('ABSPATH')) {
    exit;
}
get_header();
the_post();
$deliverables = abz_lines(get_the_ID(), 'abz_deliverables');
$audience = (string) get_post_meta(get_the_ID(), 'abz_audience', true);
abz_page_hero('الخدمات', get_the_title(), get_the_excerpt(), [['الخدمات', get_post_type_archive_link('abz_service')], [get_the_title(), '']]);
?>
<section class="py-14 sm:py-20">
  <div class="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[1.3fr_0.7fr]">
    <div>
      <div class="prose-page"><?php the_content(); ?></div>
      <?php if ($deliverables) : ?>
        <h2 class="mt-10 text-2xl text-navy-900">ما الذي تتسلّمه</h2>
        <ul class="mt-5 grid gap-3"><?php foreach ($deliverables as $line) : ?><li class="flex gap-3 rounded-2xl border border-sand-200 bg-white p-4 leading-8"><?php echo abz_icon('clipboard-check', 'mt-1.5 h-5 w-5 shrink-0 text-forest-600'); ?><?php echo esc_html($line); ?></li><?php endforeach; ?></ul>
      <?php endif; ?>
      <?php if ($audience) : ?><p class="mt-8 rounded-2xl bg-sand-100 p-5 leading-8"><strong>لمن هذه الخدمة: </strong><?php echo esc_html($audience); ?></p><?php endif; ?>
    </div>
    <aside>
      <div class="sticky top-24 rounded-3xl bg-navy-900 p-6 text-white">
        <h2 class="text-lg text-white">اطلب هذه الخدمة</h2>
        <p class="mt-2 leading-8 text-navy-100">أرسل تفاصيل طلبك لدراسة النطاق وتحديد الأتعاب، أو احجز موعداً لمناقشته.</p>
        <div class="mt-5 grid gap-2">
          <?php echo abz_button(abz_url('contact') . '?topic=' . rawurlencode('طلب عرض سعر — ' . get_the_title()), 'احصل على عرض سعر', 'gold', 'md', 'w-full'); ?>
          <?php echo abz_button(abz_url('booking') . '?topic=' . rawurlencode(get_the_title()), 'احجز موعداً', 'outline-light', 'md', 'w-full'); ?>
          <?php echo abz_button(abz_wa_link('السلام عليكم، أودّ الاستفسار عن خدمة: ' . get_the_title()), 'واتساب', 'whatsapp', 'md', 'w-full', true); ?>
        </div>
      </div>
    </aside>
  </div>
</section>
<?php get_footer();
