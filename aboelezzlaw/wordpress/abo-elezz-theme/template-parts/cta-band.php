<?php
if (!defined('ABSPATH')) {
    exit;
}
?>
<section class="relative isolate overflow-hidden bg-navy-950 py-16 text-white sm:py-24">
  <div aria-hidden="true" class="pointer-events-none absolute inset-0 -z-10">
    <div class="abz-drift absolute top-0 start-1/4 h-[28rem] w-[28rem] rounded-full bg-forest-600/40 blur-[110px]"></div>
    <div class="abz-grid absolute inset-0"></div>
  </div>
  <div class="mx-auto max-w-3xl px-5 text-center sm:px-8">
    <h2 class="text-2xl text-white sm:text-4xl">لديك مسألة تحتاج رأياً قانونياً؟</h2>
    <p class="mx-auto mt-5 max-w-xl leading-9 text-navy-100">اطلب استشارتك القانونية أو أرسل تفاصيل طلبك لدراسة نطاق الخدمة وتحديد الأتعاب. نوضّح لك كل شيء كتابةً قبل أي التزام.</p>
    <div class="mt-9 flex flex-wrap justify-center gap-3">
      <?php echo abz_button(abz_url('booking'), 'احجز موعداً مع مستشار', 'gold', 'lg'); ?>
      <?php echo abz_button(abz_url('contact') . '?topic=' . rawurlencode('طلب عرض سعر'), 'احصل على عرض سعر', 'outline-light', 'lg'); ?>
    </div>
  </div>
</section>
