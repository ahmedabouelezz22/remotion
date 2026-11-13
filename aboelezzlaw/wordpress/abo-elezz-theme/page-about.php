<?php
if (!defined('ABSPATH')) {
    exit;
}
get_header();
the_post();
$mv = abz_data('firm.missionValues', []);
abz_page_hero('من نحن', 'مؤسسة أبو العز للمحاماة والاستشارات القانونية', 'من مقرّنا في مدينة 6 أكتوبر بالجيزة نخدم الأفراد والشركات والمؤسسات حضورياً، وعن بُعد في جميع أنحاء العالم.', [['عن المؤسسة', '']]);
?>
<section class="py-14 sm:py-20">
  <div class="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[1.2fr_0.8fr]">
    <div class="prose-page"><?php the_content(); ?></div>
    <aside class="grid content-start gap-4">
      <?php foreach ([['target', 'رسالتنا', $mv['mission']['body'] ?? ''], ['eye', 'رؤيتنا', $mv['vision']['body'] ?? '']] as [$icon, $title, $body]) : ?>
        <div class="rounded-2xl border border-sand-200 bg-white p-6" data-abz-tilt>
          <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-50 text-gold-600"><?php echo abz_icon($icon); ?></span>
          <h2 class="mt-4 text-lg text-navy-900"><?php echo esc_html($title); ?></h2>
          <p class="mt-2 leading-8 text-slate-700"><?php echo esc_html($body); ?></p>
        </div>
      <?php endforeach; ?>
      <?php echo abz_button(abz_url('mission-values'), 'قيمنا وأهدافنا ' . abz_arrow(), 'outline'); ?>
    </aside>
  </div>
</section>
<section class="bg-sand-100 py-14 sm:py-20">
  <div class="mx-auto max-w-7xl px-5 sm:px-8">
    <?php abz_section_heading('تعرّف علينا أكثر', 'المؤسسة في صفحات'); ?>
    <div class="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <?php foreach ([['users', 'فريقنا', 'المؤسس والشركاء وشبكة المختصّين.', 'team'], ['award', 'عملاؤنا', 'من نخدم، وما كتبه العملاء عن تجربتهم.', 'clients'], ['hand-heart', 'رسالتنا وقيمنا', 'ما نلتزم به في كل تكليف.', 'mission-values'], ['user-plus', 'الوظائف', 'انضم إلى الفريق أو شبكة المتعاونين.', 'careers']] as [$icon, $title, $body, $slug]) : ?>
        <a href="<?php echo esc_url(abz_url($slug)); ?>" data-abz-tilt class="abz-reveal flex flex-col rounded-2xl border border-sand-200 bg-white p-6 hover:border-gold-500/60">
          <?php echo abz_icon($icon, 'h-7 w-7 text-forest-600'); ?>
          <h3 class="mt-4 text-lg text-navy-900"><?php echo esc_html($title); ?></h3>
          <p class="mt-2 flex-1 text-sm leading-7 text-slate-600"><?php echo esc_html($body); ?></p>
          <span class="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-navy-900">المزيد <?php echo abz_arrow('h-3.5 w-3.5'); ?></span>
        </a>
      <?php endforeach; ?>
    </div>
  </div>
</section>
<?php get_template_part('template-parts/cta-band'); ?>
<?php get_footer();
