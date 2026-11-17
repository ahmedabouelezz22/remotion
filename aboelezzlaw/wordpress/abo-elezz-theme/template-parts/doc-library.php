<?php
/**
 * ملفات PDF لقسم (المكتبة، الأحكام، التشريعات): بحث وتصفية وقائمة، أو عارض ملف واحد.
 * $args: section
 */
if (!defined('ABSPATH')) {
    exit;
}
if (!function_exists('abz_doc_query')) {
    return;
}
$section = (string) ($args['section'] ?? 'library');
$base = get_permalink();
$doc_id = (int) ($_GET['doc'] ?? 0); // phpcs:ignore -- عرض فقط
$doc = $doc_id ? get_post($doc_id) : null;
$input = 'block w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-navy-900 placeholder:text-slate-500 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/30';
$levels = abz_doc_levels(true);
$cta = function (string $level) use ($base, $doc_id): string {
    if ($level === 'registered') {
        return abz_button(wp_login_url(add_query_arg('doc', $doc_id, $base)), 'سجّل الدخول', 'primary', 'sm') . ' ' . abz_button(abz_account_url(), 'أنشئ حساباً مجانياً', 'outline', 'sm');
    }
    if ($level === 'members') {
        return abz_button(abz_url('memberships'), 'اطّلع على العضويات', 'gold', 'sm') . (is_user_logged_in() ? '' : ' ' . abz_button(wp_login_url(add_query_arg('doc', $doc_id, $base)), 'أنا عضو — سجّل الدخول', 'outline', 'sm'));
    }
    return '';
};

if ($doc && $doc->post_type === 'abz_doc' && ($doc->post_status === 'publish' || current_user_can('edit_post', $doc->ID))) :
    $m = abz_doc_meta($doc->ID);
    $can_view = abz_doc_allowed($m['view']);
    $can_download = abz_doc_allowed($m['download']);
    ?>
  <section class="py-10 sm:py-14">
    <div class="mx-auto max-w-5xl px-5 sm:px-8">
      <a class="inline-flex items-center gap-1 text-sm font-bold text-navy-900 hover:text-gold-700" href="<?php echo esc_url($base); ?>"><?php echo abz_icon(is_rtl() ? 'arrow-right' : 'arrow-left', 'h-4 w-4'); ?> العودة إلى القائمة</a>
      <h2 class="mt-4 text-2xl leading-10 text-navy-900 sm:text-3xl"><?php echo esc_html(get_the_title($doc)); ?></h2>
      <p class="mt-3 flex flex-wrap gap-2 text-xs font-bold">
        <?php foreach (array_filter([$m['jurisdiction'], $m['issuer'], $m['number'], $m['year']]) as $chip) : ?><span class="rounded-full bg-navy-50 px-3 py-1 text-navy-800"><?php echo esc_html($chip); ?></span><?php endforeach; ?>
      </p>
      <?php if ($doc->post_excerpt) : ?><p class="mt-4 text-lg leading-9 text-slate-700"><?php echo esc_html($doc->post_excerpt); ?></p><?php endif; ?>
      <?php if (trim($doc->post_content) !== '') : ?><div class="prose-page mt-4 text-slate-700"><?php echo wp_kses_post(wpautop($doc->post_content)); ?></div><?php endif; ?>

      <div class="mt-6 flex flex-wrap items-center gap-3">
        <?php if ($can_download) : ?>
          <a href="<?php echo esc_url(abz_doc_file_url($doc->ID, 'download')); ?>" class="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-navy-900 px-5 font-bold text-white hover:bg-navy-800"><?php echo abz_icon('download', 'h-5 w-5'); ?> تحميل PDF<?php echo $m['size'] ? ' (' . esc_html(size_format($m['size'])) . ')' : ''; ?></a>
        <?php else : ?>
          <span class="inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-sand-200 bg-sand-100 px-5 text-sm font-bold text-slate-600"><?php echo abz_icon('lock', 'h-4 w-4'); ?> التحميل: <?php echo esc_html($m['download'] === 'none' ? 'غير متاح' : abz_doc_requirement($m['download'])); ?></span>
          <?php echo $m['download'] !== 'none' ? $cta($m['download']) : ''; ?>
        <?php endif; ?>
      </div>

      <?php if ($can_view) : ?>
        <div class="mt-8 rounded-3xl border border-sand-200 bg-sand-100 p-3 sm:p-5" data-abz-pdf="<?php echo esc_url(abz_doc_file_url($doc->ID, 'view')); ?>">
          <p class="p-3 text-sm font-semibold text-slate-600" data-abz-pdf-status role="status">جارٍ تحميل الملف…</p>
          <div class="grid gap-4" data-abz-pdf-pages></div>
        </div>
      <?php else : ?>
        <div class="mt-8 rounded-3xl border border-gold-500/40 bg-gold-50 p-8 text-center">
          <span class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-900 text-gold-300"><?php echo abz_icon('lock', 'h-6 w-6'); ?></span>
          <p class="mt-4 text-lg font-bold text-navy-900">عرض هذا الملف <?php echo esc_html(abz_doc_requirement($m['view'])); ?></p>
          <div class="mt-4 flex flex-wrap justify-center gap-2"><?php echo $cta($m['view']); ?></div>
        </div>
      <?php endif; ?>
    </div>
  </section>
<?php
else :
    $q = sanitize_text_field(wp_unslash($_GET['q'] ?? '')); // phpcs:ignore
    $year = sanitize_text_field(wp_unslash($_GET['y'] ?? '')); // phpcs:ignore
    $place = sanitize_text_field(wp_unslash($_GET['j'] ?? '')); // phpcs:ignore
    $page = max(1, (int) ($_GET['pg'] ?? 1)); // phpcs:ignore
    $facets = abz_doc_facets($section);
    $docs = abz_doc_query($section, ['s' => $q, 'year' => $year, 'jurisdiction' => $place, 'page' => $page]);
    ?>
  <section class="py-10 sm:py-14">
    <div class="mx-auto max-w-7xl px-5 sm:px-8">
      <form method="get" action="<?php echo esc_url($base); ?>" class="grid gap-3 rounded-3xl border border-sand-200 bg-white p-4 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end sm:p-5" role="search">
        <div><label class="mb-1.5 block text-sm font-bold text-navy-900" for="doc-q">ابحث في العناوين والملخّصات</label><input class="<?php echo esc_attr($input); ?>" id="doc-q" name="q" value="<?php echo esc_attr($q); ?>" placeholder="كلمة أو رقم…"></div>
        <?php if ($facets['jurisdiction']) : ?><div><label class="mb-1.5 block text-sm font-bold text-navy-900" for="doc-j">الدولة</label><select class="<?php echo esc_attr($input); ?>" id="doc-j" name="j"><option value="">الكل</option><?php foreach ($facets['jurisdiction'] as $value) : ?><option <?php selected($place, $value); ?>><?php echo esc_html($value); ?></option><?php endforeach; ?></select></div><?php endif; ?>
        <?php if ($facets['year']) : ?><div><label class="mb-1.5 block text-sm font-bold text-navy-900" for="doc-y">السنة</label><select class="<?php echo esc_attr($input); ?>" id="doc-y" name="y"><option value="">الكل</option><?php foreach ($facets['year'] as $value) : ?><option <?php selected($year, $value); ?>><?php echo esc_html($value); ?></option><?php endforeach; ?></select></div><?php endif; ?>
        <button class="min-h-[50px] rounded-xl bg-navy-900 px-6 font-bold text-white hover:bg-navy-800">ابحث</button>
      </form>

      <?php if (!$docs->have_posts()) : ?>
        <div class="mt-8 rounded-3xl border border-sand-200 bg-white p-8 text-center">
          <span class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-900 text-gold-300"><?php echo abz_icon('file-search', 'h-6 w-6'); ?></span>
          <p class="mt-4 text-lg font-bold text-navy-900"><?php echo $q || $year || $place ? 'لا نتائج مطابقة لبحثك.' : 'لم تُرفع ملفات في هذا القسم بعد — نضيفها تباعاً.'; ?></p>
          <p class="mt-2 text-slate-600">يمكنك الاشتراك في النشرة البريدية ليصلك كل جديد.</p>
        </div>
      <?php else : ?>
        <p class="mt-6 text-sm text-slate-600"><?php echo esc_html(number_format_i18n($docs->found_posts) . ' ملف'); ?></p>
        <div class="mt-3 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <?php while ($docs->have_posts()) : $docs->the_post(); $m = abz_doc_meta(get_the_ID()); ?>
            <a href="<?php echo esc_url(add_query_arg('doc', get_the_ID(), $base)); ?>" class="abz-reveal group flex flex-col rounded-2xl border border-sand-200 bg-white p-6 transition hover:border-gold-500/60 hover:shadow-[0_12px_32px_rgba(11,31,58,0.1)]">
              <span class="flex items-start gap-3"><span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-900 text-gold-300"><?php echo abz_icon($section === 'judgments' ? 'gavel' : ($section === 'legislation' ? 'scroll' : 'file-text'), 'h-5 w-5'); ?></span>
                <span><span class="block text-base font-bold leading-7 text-navy-900 group-hover:text-gold-700"><?php the_title(); ?></span>
                <span class="mt-1 block text-xs text-slate-500"><?php echo esc_html(implode(' · ', array_filter([$m['issuer'], $m['number'], $m['year']]))); ?></span></span></span>
              <?php if (has_excerpt()) : ?><span class="mt-3 block flex-1 text-sm leading-7 text-slate-600"><?php echo esc_html(wp_trim_words(get_the_excerpt(), 30)); ?></span><?php endif; ?>
              <span class="mt-4 flex flex-wrap gap-2 text-xs font-bold">
                <span class="rounded-full bg-forest-50 px-3 py-1 text-forest-800"><?php echo abz_icon('eye', 'me-1 inline h-3.5 w-3.5'); ?>العرض: <?php echo esc_html($levels[$m['view']] ?? ''); ?></span>
                <span class="rounded-full bg-gold-50 px-3 py-1 text-gold-700"><?php echo abz_icon('download', 'me-1 inline h-3.5 w-3.5'); ?>التحميل: <?php echo esc_html($levels[$m['download']] ?? ''); ?></span>
              </span>
            </a>
          <?php endwhile; wp_reset_postdata(); ?>
        </div>
        <?php if ($docs->max_num_pages > 1) : ?>
          <nav class="mt-8 flex flex-wrap justify-center gap-2" aria-label="صفحات النتائج">
            <?php for ($i = 1; $i <= $docs->max_num_pages; $i++) : ?>
              <a class="inline-flex h-11 min-w-[44px] items-center justify-center rounded-xl px-3 font-bold <?php echo $i === $page ? 'bg-navy-900 text-white' : 'border border-sand-200 bg-white text-navy-900'; ?>" href="<?php echo esc_url(add_query_arg(array_filter(['q' => $q, 'y' => $year, 'j' => $place, 'pg' => $i > 1 ? $i : null]), $base)); ?>"<?php echo $i === $page ? ' aria-current="page"' : ''; ?>><?php echo esc_html(number_format_i18n($i)); ?></a>
            <?php endfor; ?>
          </nav>
        <?php endif; ?>
      <?php endif; ?>
    </div>
  </section>
<?php endif;
