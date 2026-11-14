<?php
/* أنواع الحسابات: يختار الزائر نوع حسابه ثم يسجّل من صفحة «حسابي» */
if (!defined('ABSPATH')) {
    exit;
}
get_header();
the_post();
$types = abz_data('platform.accountTypes', []);
abz_page_hero('الحسابات', 'أنشئ حسابك واختر نوعه', 'لكل نوع حساب مزاياه وصلاحياته. اختر ما يناسبك، وسجّل بالبريد وكلمة مرور تختارها. لديك حساب؟ ادخل مباشرة.', [['أنشئ حسابك', '']], 'collab');
?>
<section class="py-14 sm:py-20">
  <div class="mx-auto max-w-7xl px-5 sm:px-8">
    <div class="mb-10 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-sand-200 bg-white p-5">
      <p class="font-bold text-navy-900"><?php echo abz_icon('log-in', 'me-2 inline h-5 w-5 text-gold-600'); ?>لديك حساب بالفعل؟</p>
      <?php echo abz_button(abz_account_url(), 'تسجيل الدخول', 'primary', 'sm'); ?>
    </div>
    <div class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      <?php foreach ($types as $type) : ?>
        <article id="<?php echo esc_attr($type['key']); ?>" class="abz-reveal flex scroll-mt-28 flex-col rounded-3xl border border-sand-200 bg-white p-7" data-abz-tilt>
          <div class="flex items-center justify-between gap-3">
            <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-900 text-gold-300"><?php echo abz_icon($type['icon'], 'h-6 w-6'); ?></span>
            <?php if (!empty($type['review'])) : ?><span class="rounded-full bg-gold-50 px-3 py-1 text-xs font-bold text-gold-600">يُفعَّل بعد المراجعة</span><?php else : ?><span class="rounded-full bg-forest-50 px-3 py-1 text-xs font-bold text-forest-600">تفعيل فوري</span><?php endif; ?>
          </div>
          <h2 class="mt-5 text-xl text-navy-900"><?php echo esc_html($type['title']); ?></h2>
          <p class="mt-2 leading-8 text-slate-600"><?php echo esc_html($type['body']); ?></p>
          <ul class="mt-4 grid flex-1 content-start gap-2 text-sm leading-7 text-slate-700">
            <?php foreach ($type['perks'] as $perk) : ?><li class="flex gap-2.5"><?php echo abz_icon('check', 'mt-1 h-4 w-4 shrink-0 text-forest-600'); ?><?php echo esc_html($perk); ?></li><?php endforeach; ?>
          </ul>
          <div class="mt-6"><?php echo abz_button(abz_account_url($type['key']) . '#customer_login', 'سجّل كـ' . $type['title'], $type['key'] === 'citizen' ? 'gold' : 'outline', 'md', 'w-full'); ?></div>
        </article>
      <?php endforeach; ?>
    </div>
    <ul class="mt-10 grid gap-3 rounded-3xl bg-sand-100 p-6 leading-8 text-slate-700">
      <li class="flex gap-3"><?php echo abz_icon('shield-check', 'mt-1.5 h-4 w-4 shrink-0 text-gold-600'); ?>حسابات المحامين ومكاتب المحاماة والموردين وشركاء المؤسسة تُراجَع بياناتها قبل تفعيل مزاياها، وحتى ذلك الحين تعمل كحساب فرد.</li>
      <li class="flex gap-3"><?php echo abz_icon('lock', 'mt-1.5 h-4 w-4 shrink-0 text-gold-600'); ?>بياناتك تُستخدم لإدارة حسابك وطلباتك فقط، وفق <a class="font-bold underline" href="<?php echo esc_url(abz_url('privacy')); ?>">سياسة الخصوصية</a>.</li>
    </ul>
  </div>
</section>
<?php get_footer();
