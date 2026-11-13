<?php
if (!defined('ABSPATH')) {
    exit;
}
get_header();
the_post();
$post_id = get_the_ID();
[$content, $toc] = abz_prepare_article((string) apply_filters('the_content', get_the_content()));
$category = get_the_category()[0] ?? null;
$sources = abz_post_sources($post_id);
$related = abz_related_posts($post_id, 4);
$url = get_permalink();
$title = get_the_title();
$share = [
    ['واتساب', 'message-circle', 'https://wa.me/?text=' . rawurlencode($title . ' ' . $url)],
    ['إكس', 'x-brand', 'https://x.com/intent/post?url=' . rawurlencode($url) . '&text=' . rawurlencode($title)],
    ['فيسبوك', 'facebook', 'https://www.facebook.com/sharer/sharer.php?u=' . rawurlencode($url)],
    ['لينكدإن', 'linkedin', 'https://www.linkedin.com/sharing/share-offsite/?url=' . rawurlencode($url)],
    ['تيليجرام', 'telegram', 'https://t.me/share/url?url=' . rawurlencode($url) . '&text=' . rawurlencode($title)],
];
$founder = get_posts(['post_type' => 'abz_team', 'numberposts' => 1, 'name' => 'ahmed-abo-elezz'])[0] ?? null;
$wa = abz_wa_link('السلام عليكم، قرأت مقال «' . $title . '» وأودّ استشارة في مسألتي.');
?>
<article>
  <header class="relative isolate overflow-hidden bg-navy-950 text-white">
    <div aria-hidden="true" class="pointer-events-none absolute inset-0 -z-10"><div class="abz-grid absolute inset-0"></div><div class="absolute top-0 start-[-8%] h-[24rem] w-[24rem] rounded-full bg-forest-600/40 blur-[110px]"></div></div>
    <div class="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
      <nav aria-label="مسار التصفّح" class="mb-5 text-sm text-navy-100">
        <a class="hover:text-gold-300" href="<?php echo esc_url(home_url('/')); ?>">الرئيسية</a><span class="mx-1.5 opacity-60">/</span>
        <a class="hover:text-gold-300" href="<?php echo esc_url(abz_url('blog')); ?>">المدونة</a>
        <?php if ($category) : ?><span class="mx-1.5 opacity-60">/</span><a class="hover:text-gold-300" href="<?php echo esc_url(get_category_link($category)); ?>"><?php echo esc_html($category->name); ?></a><?php endif; ?>
      </nav>
      <h1 class="text-3xl leading-[1.4] sm:text-4xl lg:text-[2.6rem]"><?php the_title(); ?></h1>
      <p class="mt-5 max-w-3xl text-[1.05rem] leading-9 text-navy-100"><?php echo esc_html(get_the_excerpt()); ?></p>
      <div class="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-navy-100">
        <span class="flex items-center gap-2"><?php if ($founder && has_post_thumbnail($founder)) { echo get_the_post_thumbnail($founder, [36, 36], ['class' => 'h-9 w-9 rounded-full object-cover', 'alt' => '']); } ?><?php echo esc_html($founder ? $founder->post_title : get_the_author()); ?></span>
        <time class="numeric" datetime="<?php echo esc_attr(get_the_date('c')); ?>"><?php echo esc_html(get_the_date()); ?></time>
        <?php if (get_the_modified_date('Y-m-d') !== get_the_date('Y-m-d')) : ?><span>حُدِّث في <time class="numeric" datetime="<?php echo esc_attr(get_the_modified_date('c')); ?>"><?php echo esc_html(get_the_modified_date()); ?></time></span><?php endif; ?>
        <span><?php echo esc_html((string) abz_reading_minutes($content)); ?> دقائق قراءة</span>
      </div>
    </div>
  </header>

  <div class="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
    <div class="min-w-0">
      <?php if (has_post_thumbnail()) : ?><div class="mb-8 overflow-hidden rounded-3xl"><?php the_post_thumbnail('large', ['class' => 'w-full object-cover', 'alt' => '']); ?></div><?php endif; ?>

      <?php if (count($toc) > 1) : ?>
        <nav aria-label="محتويات المقال" class="mb-8 rounded-2xl border border-sand-200 bg-white p-5 lg:hidden">
          <p class="mb-3 flex items-center gap-2 font-extrabold text-navy-900"><?php echo abz_icon('list-ordered', 'h-5 w-5 text-gold-600'); ?>محتويات المقال</p>
          <ol class="grid gap-1 text-[0.95rem]"><?php foreach ($toc as $i => $item) : ?><li><a class="flex gap-2 py-1 text-navy-800 hover:text-gold-600" href="#<?php echo esc_attr($item['id']); ?>"><span class="numeric text-gold-600"><?php echo esc_html((string) ($i + 1)); ?>.</span><?php echo esc_html($item['title']); ?></a></li><?php endforeach; ?></ol>
        </nav>
      <?php endif; ?>

      <div class="article-body"><?php echo $content; // phpcs:ignore -- محتوى المقال بعد the_content ?></div>

      <?php if ($sources) : ?>
        <section class="mt-12 rounded-2xl border border-sand-200 bg-white p-6" aria-labelledby="sources-title">
          <h2 id="sources-title" class="mb-4 text-lg text-navy-900">المصادر</h2>
          <ol class="grid gap-2 text-sm leading-7">
            <?php foreach ($sources as $i => $source) : ?>
              <li class="flex gap-2"><span class="numeric font-bold text-gold-600"><?php echo esc_html((string) ($i + 1)); ?>.</span><a class="text-navy-800 underline underline-offset-4 hover:text-gold-600" href="<?php echo esc_url($source['url']); ?>" target="_blank" rel="noopener"><?php echo esc_html($source['label']); ?></a></li>
            <?php endforeach; ?>
          </ol>
          <p class="mt-4 text-xs leading-6 text-slate-600">الإحالات استرشادية: ارجع إلى النص النافذ المنشور في الجريدة الرسمية أو البوابة النظامية المختصّة قبل البناء عليه في واقعة بعينها.</p>
        </section>
      <?php endif; ?>

      <p class="mt-6 rounded-xl bg-sand-100 p-4 text-sm leading-7 text-slate-700">هذا المحتوى تثقيفي عام لا يُغني عن استشارة قانونية مختصّة بكل واقعة على حدة.</p>

      <!-- دعوة بعد المقال -->
      <section class="mt-10 overflow-hidden rounded-3xl bg-forest-900 p-7 text-white sm:p-9">
        <p class="text-sm font-bold tracking-[0.15em] text-gold-300">هل تحتاج استشارة قانونية في مسألتك؟</p>
        <h2 class="mt-2 text-2xl text-white">راجع وضعك القانوني مع مستشار مختص واتّخذ الخطوة الصحيحة في وقتها</h2>
        <p class="mt-3 leading-8 text-forest-100">أرسل تفاصيل طلبك لدراسة نطاق الخدمة وتحديد الأتعاب، أو احجز موعداً مباشرة. إرسال الطلب لا يعني بدء الخدمة قبل الاتفاق كتابةً.</p>
        <div class="mt-6 flex flex-wrap gap-3">
          <?php echo abz_button(abz_url('booking'), 'احجز موعداً مع مستشار', 'gold'); ?>
          <?php echo abz_button($wa, abz_icon('message-circle', 'h-4 w-4') . ' تواصل مع المستشار عبر واتساب', 'whatsapp', 'md', '', true); ?>
        </div>
      </section>

      <?php if ($founder) : $role = (string) get_post_meta($founder->ID, 'abz_role', true); ?>
        <!-- كاتب المقال -->
        <section class="mt-10 flex flex-col gap-5 rounded-3xl border border-sand-200 bg-white p-6 sm:flex-row" aria-labelledby="author-title">
          <?php if (has_post_thumbnail($founder)) { echo get_the_post_thumbnail($founder, [112, 112], ['class' => 'h-28 w-28 shrink-0 rounded-2xl object-cover', 'alt' => esc_attr($founder->post_title)]); } ?>
          <div>
            <p class="text-xs font-bold tracking-[0.15em] text-gold-600">كاتب المقال</p>
            <h2 id="author-title" class="mt-1 text-xl text-navy-900"><?php echo esc_html($founder->post_title); ?></h2>
            <p class="text-sm font-semibold text-slate-600"><?php echo esc_html($role); ?> — <?php bloginfo('name'); ?></p>
            <p class="mt-3 leading-8 text-slate-700"><?php echo esc_html($founder->post_excerpt); ?></p>
            <a class="mt-3 inline-flex min-h-[40px] items-center gap-1.5 font-bold text-navy-900 hover:text-gold-600" href="<?php echo esc_url(abz_url('team') . '#' . $founder->post_name); ?>">الملف المهني الكامل <?php echo abz_arrow('h-3.5 w-3.5'); ?></a>
          </div>
        </section>
      <?php endif; ?>

      <!-- مشاركة ومتابعة -->
      <section class="mt-10 grid gap-6 rounded-3xl border border-sand-200 bg-white p-6 sm:grid-cols-2">
        <div>
          <h2 class="mb-3 text-base text-navy-900">شارك المقال</h2>
          <ul class="flex flex-wrap gap-2">
            <?php foreach ($share as [$label, $icon, $href]) : ?>
              <li><a href="<?php echo esc_url($href); ?>" target="_blank" rel="noopener" class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-sand-200 text-navy-900 hover:border-gold-500 hover:text-gold-600" aria-label="شارك عبر <?php echo esc_attr($label); ?>"><?php echo abz_icon($icon, 'h-[18px] w-[18px]'); ?></a></li>
            <?php endforeach; ?>
            <li><button type="button" data-abz-copy="<?php echo esc_url($url); ?>" class="inline-flex h-11 items-center gap-2 rounded-full border border-sand-200 px-4 text-sm font-bold text-navy-900 hover:border-gold-500"><?php echo abz_icon('link', 'h-4 w-4'); ?><span data-label>نسخ الرابط</span></button></li>
          </ul>
        </div>
        <div>
          <h2 class="mb-3 text-base text-navy-900">تابعنا على وسائل التواصل</h2>
          <?php abz_social_icons('light', 'h-11 w-11'); ?>
        </div>
      </section>
    </div>

    <!-- الشريط الجانبي -->
    <aside class="hidden lg:block">
      <div class="sticky top-24 grid gap-5">
        <?php if (count($toc) > 1) : ?>
          <nav aria-label="محتويات المقال" class="rounded-2xl border border-sand-200 bg-white p-5">
            <p class="mb-3 flex items-center gap-2 font-extrabold text-navy-900"><?php echo abz_icon('list-ordered', 'h-5 w-5 text-gold-600'); ?>محتويات المقال</p>
            <ol class="grid gap-1 text-sm"><?php foreach ($toc as $i => $item) : ?><li><a class="flex gap-2 py-1 leading-7 text-navy-800 hover:text-gold-600" href="#<?php echo esc_attr($item['id']); ?>"><span class="numeric text-gold-600"><?php echo esc_html((string) ($i + 1)); ?>.</span><?php echo esc_html($item['title']); ?></a></li><?php endforeach; ?></ol>
          </nav>
        <?php endif; ?>
        <div class="rounded-2xl bg-navy-900 p-5 text-white">
          <p class="flex items-center gap-2 text-sm font-bold text-gold-300"><span class="abz-pulse h-2 w-2 rounded-full bg-forest-100"></span>متاحون للتواصل</p>
          <p class="mt-2 font-display text-lg font-extrabold">قضيتك تتطلّب رأي مستشار</p>
          <p class="mt-1.5 text-sm leading-7 text-navy-100">تواصل معنا لدراسة مسألتك بسرّية وتحديد النطاق والأتعاب قبل البدء.</p>
          <div class="mt-4 grid gap-2">
            <?php echo abz_button(abz_url('booking'), 'احجز موعداً', 'gold', 'sm', 'w-full'); ?>
            <?php echo abz_button($wa, 'واتساب', 'whatsapp', 'sm', 'w-full', true); ?>
          </div>
        </div>
        <?php if ($related) : ?>
          <div class="rounded-2xl border border-sand-200 bg-white p-5">
            <p class="mb-3 font-extrabold text-navy-900">مقالات أخرى قد تهمّك</p>
            <ul class="grid gap-3 text-sm"><?php foreach (array_slice($related, 0, 4) as $item) : ?><li><a class="leading-7 text-navy-800 hover:text-gold-600" href="<?php echo esc_url(get_permalink($item)); ?>"><?php echo esc_html(get_the_title($item)); ?></a></li><?php endforeach; ?></ul>
          </div>
        <?php endif; ?>
      </div>
    </aside>
  </div>
</article>

<?php if ($related) : ?>
<section class="bg-sand-100 py-14 sm:py-20">
  <div class="mx-auto max-w-7xl px-5 sm:px-8">
    <?php abz_section_heading('مقالات مرتبطة', 'مقالات أخرى قد تهمّك', '', 'start'); ?>
    <div class="mt-10 grid gap-6 md:grid-cols-3">
      <?php global $post; foreach (array_slice($related, 0, 3) as $post) : setup_postdata($post); get_template_part('template-parts/article-card'); endforeach; wp_reset_postdata(); ?>
    </div>
  </div>
</section>
<?php endif; ?>

<!-- اكتشف المزيد -->
<section class="py-14 sm:py-20">
  <div class="mx-auto max-w-7xl px-5 sm:px-8">
    <?php abz_section_heading('اكتشف المزيد', 'خدمات وأقسام ذات صلة', '', 'start'); ?>
    <div class="mt-8 flex flex-wrap gap-2">
      <?php foreach (get_categories(['hide_empty' => true, 'exclude' => [(int) get_option('default_category')]]) as $term) : ?>
        <a class="inline-flex min-h-[44px] items-center rounded-full border border-sand-200 bg-white px-4 font-bold text-navy-900 hover:border-gold-500" href="<?php echo esc_url(get_category_link($term)); ?>"><?php echo esc_html($term->name); ?></a>
      <?php endforeach; ?>
      <?php foreach (get_posts(['post_type' => 'abz_service', 'numberposts' => 6, 'orderby' => 'menu_order', 'order' => 'ASC']) as $service) : ?>
        <a class="inline-flex min-h-[44px] items-center rounded-full border border-forest-100 bg-forest-50 px-4 font-bold text-forest-800 hover:border-forest-600" href="<?php echo esc_url(get_permalink($service)); ?>"><?php echo esc_html($service->post_title); ?></a>
      <?php endforeach; ?>
      <a class="inline-flex min-h-[44px] items-center rounded-full border border-gold-500/40 bg-gold-50 px-4 font-bold text-gold-600" href="<?php echo esc_url(abz_shop_url('templates')); ?>">نماذج عقود — تحميل فوري</a>
      <a class="inline-flex min-h-[44px] items-center rounded-full border border-navy-200 bg-navy-50 px-4 font-bold text-navy-800" href="<?php echo esc_url(abz_url('library')); ?>">المكتبة القانونية</a>
    </div>
  </div>
</section>

<?php comments_template(); ?>
<?php get_footer(); ?>
