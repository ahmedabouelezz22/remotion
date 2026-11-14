<?php
/* عن المؤسسة — عن المؤسسة نفسها: نشأتها وطريقة عملها ومن تخدم. الرسالة والقيم في صفحتها. */
if (!defined('ABSPATH')) {
    exit;
}
get_header();
the_post();
$about = abz_data('firm.about', []);
$sectors = wp_count_posts('abz_sector')->publish ?? 27;
abz_page_hero('من نحن', 'مؤسسة أبو العز للمحاماة والاستشارات القانونية', (string) ($about['lead'] ?? ''), [['عن المؤسسة', '']], 'justice');
?>
<section class="py-14 sm:py-20">
  <div class="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2">
    <div>
      <?php abz_section_heading('قصّتنا', 'خدمة قانونية لا تحدّها المسافة', '', 'start'); ?>
      <div class="mt-6 space-y-5 text-[1.05rem] leading-9 text-slate-700">
        <?php foreach ($about['paragraphs'] ?? [] as $paragraph) : ?><p><?php echo esc_html($paragraph); ?></p><?php endforeach; ?>
      </div>
      <div class="mt-8 flex flex-wrap gap-3">
        <?php echo abz_button(abz_url('booking'), 'احجز موعداً مع مستشار', 'primary'); ?>
        <?php echo abz_button(abz_url('team'), 'تعرّف على الفريق', 'outline'); ?>
      </div>
    </div>
    <div class="relative">
      <div class="abz-reveal overflow-hidden rounded-[2rem] shadow-[0_30px_70px_rgba(11,31,58,0.22)]"><img src="<?php echo esc_url(abz_img('meeting')); ?>" alt="اجتماع عمل لمناقشة مستندات قانونية" width="1200" height="750" loading="lazy" class="aspect-[4/3] h-full w-full object-cover"></div>
      <div class="abz-reveal absolute -bottom-8 start-6 hidden w-56 overflow-hidden rounded-2xl border-4 border-white shadow-xl sm:block"><img src="<?php echo esc_url(abz_img('lawbooks')); ?>" alt="تمثال العدالة" width="1200" height="750" loading="lazy" class="aspect-[4/3] w-full object-cover"></div>
      <div class="abz-float absolute -top-5 end-4 rounded-2xl bg-navy-900 px-5 py-3 text-white shadow-xl">
        <p class="numeric font-display text-2xl font-black text-gold-400"><?php echo esc_html((string) $sectors); ?></p>
        <p class="text-xs text-navy-100">قطاعاً نخدمه</p>
      </div>
    </div>
  </div>
</section>

<section class="bg-sand-100 py-14 sm:py-20">
  <div class="mx-auto max-w-7xl px-5 sm:px-8">
    <?php abz_section_heading('كيف نعمل', 'أربعة أمور تميّز العمل معنا'); ?>
    <div class="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <?php foreach ($about['pillars'] ?? [] as $pillar) : ?>
        <div class="abz-reveal rounded-3xl border border-sand-200 bg-white p-6" data-abz-tilt>
          <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-900 text-gold-300"><?php echo abz_icon($pillar['icon'], 'h-6 w-6'); ?></span>
          <h3 class="mt-5 text-lg text-navy-900"><?php echo esc_html($pillar['title']); ?></h3>
          <p class="mt-2 text-sm leading-8 text-slate-600"><?php echo esc_html($pillar['body']); ?></p>
        </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<section class="py-14 sm:py-20">
  <div class="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
    <div class="abz-reveal overflow-hidden rounded-[2rem]"><img src="<?php echo esc_url(abz_img('forum')); ?>" alt="كرة أرضية زجاجية ترمز إلى العمل عبر الحدود" width="1200" height="750" loading="lazy" class="aspect-[4/3] w-full object-cover"></div>
    <div>
      <?php abz_section_heading('الإدارة والفريق', 'إدارة من الجيزة… وفريق من دول متعدّدة', 'مقرّ إدارة المؤسسة في مدينة 6 أكتوبر بالجيزة. أما العمل فيجري عن بُعد: مستشارون ومختصّون وإدارات مساندة يعملون من أماكن مختلفة، ويُسنَد كل ملف إلى المختص بنظام الدولة المعنية وبقطاع العميل.', 'start'); ?>
      <div class="mt-8 grid gap-3 sm:grid-cols-2">
        <?php foreach ($about['howWeServe'] ?? [] as $row) : ?>
          <div class="rounded-2xl border border-sand-200 bg-white p-5"><h3 class="text-base text-navy-900"><?php echo esc_html($row['title']); ?></h3><p class="mt-1.5 text-sm leading-7 text-slate-600"><?php echo esc_html($row['body']); ?></p></div>
        <?php endforeach; ?>
      </div>
    </div>
  </div>
</section>

<section class="bg-sand-100 py-14 sm:py-20">
  <div class="mx-auto max-w-7xl px-5 sm:px-8">
    <?php abz_section_heading('تعرّف علينا أكثر', 'المؤسسة في صفحات'); ?>
    <div class="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <?php foreach ([['hand-heart', 'رسالتنا وقيمنا وأهدافنا', 'ما نؤمن به وما نلتزم به في كل تكليف.', 'mission-values', 'lawbooks'], ['users', 'فريقنا', 'القيادة وإدارات المؤسسة وشبكة المختصّين.', 'team', 'team'], ['award', 'عملاؤنا', 'من نخدم، وما كتبه العملاء عن تجربتهم.', 'clients', 'contract'], ['briefcase', 'انضم إلينا', 'للمحامين والخبراء والموردين.', 'careers', 'collab']] as [$icon, $title, $body, $slug, $photo]) : ?>
        <a href="<?php echo esc_url(abz_url($slug)); ?>" class="abz-reveal group flex flex-col overflow-hidden rounded-3xl border border-sand-200 bg-white hover:border-gold-500/60 hover:shadow-[0_12px_32px_rgba(11,31,58,0.12)]">
          <?php echo abz_cover($photo, $icon); ?>
          <span class="flex flex-1 flex-col p-6">
            <span class="block font-display text-lg font-extrabold text-navy-900"><?php echo esc_html($title); ?></span>
            <span class="mt-2 block flex-1 text-sm leading-7 text-slate-600"><?php echo esc_html($body); ?></span>
            <span class="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-navy-900">المزيد <?php echo abz_arrow('h-3.5 w-3.5'); ?></span>
          </span>
        </a>
      <?php endforeach; ?>
    </div>
  </div>
</section>
<?php get_template_part('template-parts/cta-band'); ?>
<?php get_footer();
