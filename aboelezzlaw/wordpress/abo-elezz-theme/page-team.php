<?php
if (!defined('ABSPATH')) {
    exit;
}
get_header();
the_post();
$members = get_posts(['post_type' => 'abz_team', 'numberposts' => 50, 'orderby' => 'menu_order', 'order' => 'ASC']);
abz_page_hero('من نحن', 'فريقنا', 'خبرة قانونية وتكوين أكاديمي، وشبكة من المختصّين المرخَّصين في كل ولاية قضائية حيث يلزم.', [['عن المؤسسة', abz_url('about')], ['فريقنا', '']]);
?>
<section class="py-14 sm:py-20">
  <div class="mx-auto max-w-7xl px-5 sm:px-8">
    <div class="prose-page mx-auto max-w-3xl text-center"><?php the_content(); ?></div>
    <div class="mt-12 grid gap-8">
      <?php foreach ($members as $i => $member) :
          $role = (string) get_post_meta($member->ID, 'abz_role', true);
          $highlights = abz_lines($member->ID, 'abz_highlights');
          $specialties = abz_lines($member->ID, 'abz_specialties'); ?>
        <article id="<?php echo esc_attr($member->post_name); ?>" class="abz-reveal scroll-mt-28 overflow-hidden rounded-3xl border border-sand-200 bg-white lg:grid lg:grid-cols-[22rem_1fr]">
          <div class="relative bg-navy-950">
            <?php if (has_post_thumbnail($member)) : ?>
              <?php echo get_the_post_thumbnail($member, 'large', ['class' => 'aspect-square h-full w-full object-cover lg:aspect-auto', 'alt' => esc_attr($member->post_title)]); ?>
            <?php else : ?>
              <div class="flex aspect-square h-full w-full items-center justify-center bg-gradient-to-br from-navy-900 to-forest-800 lg:aspect-auto"><span class="font-display text-6xl font-black text-gold-400"><?php echo esc_html(abz_initials($member->post_title)); ?></span></div>
            <?php endif; ?>
            <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950/95 to-transparent p-6 pt-16 text-white">
              <h2 class="text-2xl text-white"><?php echo esc_html($member->post_title); ?></h2>
              <p class="mt-1 font-bold text-gold-300"><?php echo esc_html($role); ?></p>
            </div>
          </div>
          <div class="p-6 sm:p-8">
            <p class="text-lg leading-9 text-navy-900"><?php echo esc_html($member->post_excerpt); ?></p>
            <?php if ($highlights) : ?>
              <h3 class="mt-6 text-base text-navy-900">المؤهلات والخبرات</h3>
              <ul class="mt-3 grid gap-2.5">
                <?php foreach ($highlights as $line) : ?><li class="flex gap-3 leading-8 text-slate-700"><span class="mt-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-forest-600 text-white"><?php echo abz_icon('check', 'h-3 w-3'); ?></span><?php echo esc_html($line); ?></li><?php endforeach; ?>
              </ul>
            <?php endif; ?>
            <?php if ($specialties) : ?>
              <details class="group mt-6 rounded-2xl border border-sand-200 bg-sand-50 p-5">
                <summary class="flex cursor-pointer list-none items-center justify-between font-extrabold text-navy-900 [&::-webkit-details-marker]:hidden"><span>مجالات التخصّص (<span class="numeric"><?php echo esc_html((string) count($specialties)); ?></span>)</span><?php echo abz_icon('chevron-down', 'h-4 w-4 text-gold-600 transition-transform group-open:rotate-180'); ?></summary>
                <ul class="mt-4 grid gap-2 sm:grid-cols-2"><?php foreach ($specialties as $line) : ?><li class="flex gap-2 text-sm leading-7 text-slate-700"><?php echo abz_icon('scale', 'mt-1 h-4 w-4 shrink-0 text-gold-600'); ?><?php echo esc_html($line); ?></li><?php endforeach; ?></ul>
              </details>
            <?php endif; ?>
            <div class="mt-6 flex flex-wrap gap-3">
              <?php echo abz_button(abz_url('booking') . '?topic=' . rawurlencode('استشارة مع ' . $member->post_title), 'احجز استشارة', 'primary', 'sm'); ?>
              <?php if ($i === 0) { echo abz_button(abz_url('blog'), 'مقالاته', 'outline', 'sm'); } ?>
            </div>
          </div>
        </article>
      <?php endforeach; ?>
    </div>

    <div class="mt-12 grid gap-6 rounded-3xl bg-forest-900 p-8 text-white md:grid-cols-[1fr_auto] md:items-center">
      <div>
        <p class="text-sm font-bold tracking-[0.15em] text-gold-300">انضم إلينا</p>
        <h2 class="mt-2 text-2xl text-white">محامٍ أو مستشار أو خبير؟ نرحّب بانضمامك إلى الفريق أو شبكة المتعاونين</h2>
        <p class="mt-2 leading-8 text-forest-100">نعرض في هذه الصفحة أعضاء الفريق الفعليين فقط، ويُضاف كل عضو جديد بعد انضمامه واعتماد ملفه.</p>
      </div>
      <?php echo abz_button(abz_url('careers'), 'الوظائف والانضمام', 'gold'); ?>
    </div>
  </div>
</section>
<?php get_template_part('template-parts/cta-band'); ?>
<?php get_footer();
