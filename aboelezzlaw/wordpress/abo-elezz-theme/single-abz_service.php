<?php
if (!defined('ABSPATH')) {
    exit;
}
get_header();
the_post();
$slug = get_post_field('post_name', get_the_ID());
$deliverables = abz_lines(get_the_ID(), 'abz_deliverables');
$audience = (string) get_post_meta(get_the_ID(), 'abz_audience', true);
$d = (array) (abz_data('platform.serviceDetails', [])[$slug] ?? []);
$quote = abz_url('contact') . '?topic=' . rawurlencode('طلب عرض سعر — ' . get_the_title());
$book = abz_url('booking') . '?topic=' . rawurlencode(get_the_title());
$wa = abz_wa_link('السلام عليكم، أودّ الاستفسار عن خدمة: ' . get_the_title());
$others = get_posts(['post_type' => 'abz_service', 'numberposts' => 3, 'post__not_in' => [get_the_ID()], 'orderby' => 'menu_order', 'order' => 'ASC']);
abz_page_hero('الخدمات', get_the_title(), get_the_excerpt(), [['الخدمات', get_post_type_archive_link('abz_service')], [get_the_title(), '']], abz_service_photo($slug));
?>
<section class="py-14 sm:py-20">
  <div class="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[1.3fr_0.7fr]">
    <div>
      <?php if (!empty($d['hook'])) : ?><p class="abz-reveal rounded-3xl border-s-4 border-gold-500 bg-gold-50 p-6 font-display text-xl font-extrabold leading-10 text-navy-900"><?php echo esc_html($d['hook']); ?></p><?php endif; ?>
      <div class="abz-reveal mt-8 overflow-hidden rounded-[2rem]"><img src="<?php echo esc_url(abz_img(abz_service_photo($slug))); ?>" alt="<?php echo esc_attr(get_the_title()); ?>" width="1200" height="750" class="aspect-[16/8] w-full object-cover"></div>
      <div class="prose-page mt-8"><?php the_content(); ?></div>

      <?php if (!empty($d['when'])) : ?>
        <h2 class="mt-12 text-2xl text-navy-900">متى تحتاج هذه الخدمة؟</h2>
        <ul class="mt-5 grid gap-3 sm:grid-cols-2"><?php foreach ($d['when'] as $line) : ?><li class="abz-reveal flex gap-3 rounded-2xl bg-sand-100 p-4 leading-8 text-navy-900"><?php echo abz_icon('help-circle', 'mt-1.5 h-5 w-5 shrink-0 text-gold-600'); ?><?php echo esc_html($line); ?></li><?php endforeach; ?></ul>
      <?php endif; ?>

      <?php if (!empty($d['includes'])) : ?>
        <h2 class="mt-12 text-2xl text-navy-900">ما يشمله العمل</h2>
        <ol class="mt-5 grid gap-3"><?php foreach ($d['includes'] as $i => $line) : ?><li class="abz-reveal flex items-center gap-4 rounded-2xl border border-sand-200 bg-white p-4 leading-8"><span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-900 font-display text-sm font-black text-gold-300" aria-hidden="true"><?php echo esc_html((string) ($i + 1)); ?></span><?php echo esc_html($line); ?></li><?php endforeach; ?></ol>
      <?php endif; ?>

      <?php if ($deliverables) : ?>
        <h2 class="mt-12 text-2xl text-navy-900">ما الذي تتسلّمه</h2>
        <ul class="mt-5 grid gap-3 sm:grid-cols-2"><?php foreach ($deliverables as $line) : ?><li class="abz-reveal flex gap-3 rounded-2xl border border-forest-100 bg-forest-50 p-4 leading-8 text-forest-900"><?php echo abz_icon('clipboard-check', 'mt-1.5 h-5 w-5 shrink-0 text-forest-600'); ?><?php echo esc_html($line); ?></li><?php endforeach; ?></ul>
      <?php endif; ?>

      <div class="abz-reveal my-12 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-navy-900 p-7 text-white">
        <div><p class="font-display text-xl font-extrabold text-white">جاهز للبدء؟</p><p class="mt-1 text-navy-100">أرسل تفاصيل طلبك، ويصلك عرض مكتوب بالنطاق والأتعاب والمدة خلال يوم عمل.</p></div>
        <div class="flex flex-wrap gap-2"><?php echo abz_button($quote, 'احصل على عرض سعر', 'gold'); ?><?php echo abz_button($book, 'احجز موعداً', 'outline-light'); ?></div>
      </div>

      <div class="grid gap-5 md:grid-cols-2">
        <?php if (!empty($d['needs'])) : ?><div class="rounded-3xl border border-sand-200 bg-white p-6"><h2 class="text-lg text-navy-900">ما نحتاجه منك</h2><ul class="mt-3 grid gap-2 text-sm leading-7 text-slate-700"><?php foreach ($d['needs'] as $line) : ?><li class="flex gap-2.5"><?php echo abz_icon('file-text', 'mt-1 h-4 w-4 shrink-0 text-gold-600'); ?><?php echo esc_html($line); ?></li><?php endforeach; ?></ul></div><?php endif; ?>
        <?php if (!empty($d['excludes'])) : ?><div class="rounded-3xl border border-sand-200 bg-white p-6"><h2 class="text-lg text-navy-900">ما لا يشمله السعر</h2><ul class="mt-3 grid gap-2 text-sm leading-7 text-slate-700"><?php foreach ($d['excludes'] as $line) : ?><li class="flex gap-2.5"><?php echo abz_icon('info', 'mt-1 h-4 w-4 shrink-0 text-slate-500'); ?><?php echo esc_html($line); ?></li><?php endforeach; ?></ul></div><?php endif; ?>
      </div>
      <?php if ($audience) : ?><p class="mt-6 rounded-2xl bg-sand-100 p-5 leading-8"><strong>لمن هذه الخدمة: </strong><?php echo esc_html($audience); ?></p><?php endif; ?>

      <?php $products = function_exists('wc_get_product') ? array_filter(array_map(fn($s) => ($p = get_page_by_path($s, OBJECT, 'product')) ? wc_get_product($p->ID) : null, $d['products'] ?? [])) : [];
      if ($products) : ?>
        <h2 class="mt-12 text-2xl text-navy-900">اطلبها مباشرة من المتجر</h2>
        <p class="mt-2 leading-8 text-slate-600">منتجات بسعر معلوم ترتبط بهذه الخدمة:</p>
        <div class="mt-5 grid gap-4 sm:grid-cols-3">
          <?php foreach ($products as $product) : ?>
            <a href="<?php echo esc_url($product->get_permalink()); ?>" class="abz-reveal group flex flex-col overflow-hidden rounded-2xl border border-sand-200 bg-white hover:border-gold-500">
              <?php echo abz_cover(abz_product_photo($product->get_id()), '', 'aspect-[16/9]'); ?>
              <span class="flex flex-1 flex-col p-4"><span class="block flex-1 font-display font-extrabold leading-7 text-navy-900"><?php echo esc_html($product->get_name()); ?></span><span class="numeric mt-2 block font-black text-forest-600"><?php echo wp_kses_post($product->get_price_html()); ?></span></span>
            </a>
          <?php endforeach; ?>
        </div>
      <?php endif; ?>

      <?php if (!empty($d['faqs'])) : ?>
        <h2 class="mt-12 text-2xl text-navy-900">أسئلة شائعة عن الخدمة</h2>
        <div class="mt-5 space-y-3">
          <?php foreach ($d['faqs'] as [$question, $answer]) : ?>
            <details class="group rounded-2xl border border-sand-200 bg-white px-6 py-5 open:border-gold-400/60"><summary class="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-navy-900 [&::-webkit-details-marker]:hidden"><?php echo esc_html($question); ?><span class="shrink-0 text-xl text-gold-600 transition-transform group-open:rotate-45" aria-hidden="true">+</span></summary><p class="mt-4 leading-8 text-slate-600"><?php echo esc_html($answer); ?></p></details>
          <?php endforeach; ?>
        </div>
      <?php endif; ?>
    </div>
    <aside>
      <div class="sticky top-24 grid gap-4">
        <div class="rounded-3xl bg-navy-900 p-6 text-white">
          <h2 class="text-xl text-white">اطلب هذه الخدمة</h2>
          <p class="mt-2 leading-8 text-navy-100">أرسل تفاصيل طلبك لدراسة النطاق وتحديد الأتعاب، أو احجز موعداً لمناقشته.</p>
          <div class="mt-5 grid gap-2">
            <?php echo abz_button($quote, 'احصل على عرض سعر', 'gold', 'md', 'w-full'); ?>
            <?php echo abz_button($book, 'احجز موعداً', 'outline-light', 'md', 'w-full'); ?>
            <?php echo abz_button($wa, abz_icon('message-circle', 'h-4 w-4') . ' واتساب', 'whatsapp', 'md', 'w-full', true); ?>
          </div>
          <ul class="mt-5 grid gap-2 border-t border-white/15 pt-4 text-sm text-navy-100">
            <?php foreach (['عرض مكتوب قبل البدء', 'ردّ خلال يوم عمل', 'سرّية ملتزمة', 'مخرج مكتوب يمكنك البناء عليه'] as $chip) : ?><li class="flex items-center gap-2"><?php echo abz_icon('check', 'h-4 w-4 text-gold-400'); ?><?php echo esc_html($chip); ?></li><?php endforeach; ?>
          </ul>
        </div>
        <a href="<?php echo esc_url(abz_url('memberships')); ?>" class="rounded-3xl border border-gold-500/40 bg-gold-50 p-6 hover:border-gold-500"><p class="font-display text-lg font-extrabold text-navy-900">وفّر حتى 30% بالعضوية</p><p class="mt-1 text-sm leading-7 text-slate-700">خصم يُطبَّق تلقائياً على هذه الخدمة وكل خدمات المتجر طوال مدة عضويتك.</p><span class="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-navy-900">قارن العضويات <?php echo abz_arrow('h-3.5 w-3.5'); ?></span></a>
      </div>
    </aside>
  </div>
</section>
<section class="bg-sand-100 py-14">
  <div class="mx-auto max-w-7xl px-5 sm:px-8">
    <h2 class="text-2xl text-navy-900">خدمات أخرى</h2>
    <div class="mt-6 grid gap-5 sm:grid-cols-3">
      <?php foreach ($others as $service) : ?><a class="group overflow-hidden rounded-2xl border border-sand-200 bg-white hover:border-gold-500" href="<?php echo esc_url(get_permalink($service)); ?>"><?php echo abz_cover(abz_service_photo($service->post_name), '', 'aspect-[16/9]'); ?><span class="block p-4 font-display font-extrabold text-navy-900"><?php echo esc_html($service->post_title); ?></span></a><?php endforeach; ?>
    </div>
  </div>
</section>
<?php get_footer();
