<?php
if (!defined('ABSPATH')) {
    exit;
}
get_header();
the_post();
$groups = abz_data('practiceGroups', []);
$professional = abz_data('professionalServices', []);
$count = array_sum(array_map(fn($g) => count($g['items']), $groups));
abz_page_hero('مجالات الممارسة', 'تخصّصات تخدم أكثر من قطاع', $count . ' مجال ممارسة عابراً للقطاعات: التحكيم يخدم الإنشاءات والطاقة والرياضة معاً، وحماية البيانات تخدم المستشفيات والسيارات والتكنولوجيا.', [['مجالات الممارسة', '']]);
$group_icons = ['corporate' => 'briefcase', 'disputes' => 'gavel', 'crime' => 'shield', 'regulatory' => 'clipboard-check', 'ip-tech' => 'cpu', 'people' => 'users'];
?>
<section class="py-14 sm:py-20">
  <div class="mx-auto grid max-w-7xl gap-6 px-5 sm:px-8 md:grid-cols-2">
    <?php foreach ($groups as $group) : ?>
      <section id="<?php echo esc_attr($group['key']); ?>" class="abz-reveal scroll-mt-28 rounded-3xl border border-sand-200 bg-white p-6 sm:p-8">
        <div class="flex items-center gap-3"><span class="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-900 text-gold-300"><?php echo abz_icon($group_icons[$group['key']] ?? 'scale'); ?></span><h2 class="text-xl text-navy-900"><?php echo esc_html($group['title']['ar']); ?></h2></div>
        <ul class="mt-5 grid gap-2">
          <?php foreach ($group['items'] as $item) : ?><li class="flex gap-2.5 leading-8 text-slate-700"><?php echo abz_icon('check', 'mt-2 h-4 w-4 shrink-0 text-forest-600'); ?><?php echo esc_html($item['ar']); ?></li><?php endforeach; ?>
        </ul>
        <a class="mt-5 inline-flex min-h-[44px] items-center gap-1.5 font-bold text-navy-900 hover:text-gold-600" href="<?php echo esc_url(abz_url('contact') . '?topic=' . rawurlencode('طلب خدمة — ' . $group['title']['ar'])); ?>">اطلب عرض سعر في هذا المجال <?php echo abz_arrow('h-3.5 w-3.5'); ?></a>
      </section>
    <?php endforeach; ?>
  </div>
</section>
<section id="professional" class="scroll-mt-28 bg-forest-900 py-14 text-white sm:py-20">
  <div class="mx-auto max-w-7xl px-5 sm:px-8">
    <?php abz_section_heading('الخدمات المهنية والاستشارية', 'ما يكمّل العمل القانوني', 'العميل المؤسسي لا يحتاج محامياً وحده، بل منظومة تساعده على إدارة المخاطر والتشغيل والامتثال.', 'center', true); ?>
    <ul class="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <?php foreach ($professional as $item) : ?><li class="abz-reveal flex items-center gap-3 rounded-2xl border border-white/15 bg-forest-800 px-4 py-3.5 font-semibold"><?php echo abz_icon('check', 'h-4 w-4 shrink-0 text-gold-300'); ?><?php echo esc_html($item['ar']); ?></li><?php endforeach; ?>
    </ul>
  </div>
</section>
<?php get_template_part('template-parts/cta-band'); ?>
<?php get_footer();
