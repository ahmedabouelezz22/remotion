<?php
/* ألعاب وألغاز قانونية بسيطة — أصلية، تعمل في المتصفّح بلا تسجيل ولا تتبّع */
if (!defined('ABSPATH')) {
    exit;
}
get_header();
the_post();
$data = ['quiz' => abz_data('platform.quiz', []), 'glossary' => abz_data('platform.glossary', [])];
abz_page_hero('استراحة', 'ألعاب وألغاز قانونية', 'ثلاث ألعاب خفيفة تختبر بها معلوماتك القانونية وتتعلّم مصطلحاً جديداً. للتسلية والتعلّم — لا للاستشارة.', [['المعرفة', abz_url('blog')], ['ألعاب وألغاز', '']], 'books');
?>
<section class="py-12 sm:py-16" data-abz-games>
  <div class="mx-auto max-w-5xl px-5 sm:px-8">
    <div class="flex flex-wrap gap-2" role="tablist" aria-label="الألعاب">
      <?php foreach ([['quiz', 'help-circle', 'اختبر معلوماتك'], ['scramble', 'puzzle', 'رتّب الحروف'], ['memory', 'gamepad', 'طابق المصطلح بمعناه']] as $i => [$key, $icon, $label]) : ?>
        <button type="button" role="tab" aria-selected="<?php echo $i ? 'false' : 'true'; ?>" data-game-tab="<?php echo esc_attr($key); ?>" class="abz-game-tab inline-flex min-h-[48px] items-center gap-2 rounded-full border-2 border-navy-900 px-5 font-bold text-navy-900 aria-selected:bg-navy-900 aria-selected:text-white"><?php echo abz_icon($icon, 'h-5 w-5'); ?><?php echo esc_html($label); ?></button>
      <?php endforeach; ?>
    </div>

    <div class="mt-8 rounded-[2rem] border border-sand-200 bg-white p-6 shadow-[0_18px_44px_rgba(11,31,58,0.08)] sm:p-10">
      <noscript><p class="abz-notice">الألعاب تحتاج تفعيل جافاسكربت في متصفّحك.</p></noscript>

      <div data-game="quiz">
        <div class="flex items-center justify-between gap-4"><h2 class="text-2xl text-navy-900">اختبر معلوماتك</h2><p class="numeric rounded-full bg-sand-100 px-4 py-1.5 text-sm font-bold text-navy-900"><span data-quiz-progress>1</span> / <span data-quiz-total></span> · النقاط: <span data-quiz-score>0</span></p></div>
        <p class="mt-6 text-xl leading-10 text-navy-900" data-quiz-question aria-live="polite"></p>
        <div class="mt-6 grid gap-3" data-quiz-answers></div>
        <p class="mt-5 min-h-[2rem] font-bold" data-quiz-feedback aria-live="polite"></p>
        <div class="mt-4 flex flex-wrap gap-3"><button type="button" data-quiz-next class="hidden min-h-[48px] rounded-xl bg-navy-900 px-6 font-bold text-white">السؤال التالي</button><button type="button" data-quiz-restart class="hidden min-h-[48px] rounded-xl bg-gold-500 px-6 font-bold text-navy-950">العب مرة أخرى</button></div>
      </div>

      <div data-game="scramble" hidden>
        <div class="flex items-center justify-between gap-4"><h2 class="text-2xl text-navy-900">رتّب الحروف</h2><p class="numeric rounded-full bg-sand-100 px-4 py-1.5 text-sm font-bold text-navy-900">النقاط: <span data-scramble-score>0</span></p></div>
        <p class="mt-4 leading-8 text-slate-600">اضغط الحروف بالترتيب الصحيح لتكوين المصطلح الذي يطابق التعريف.</p>
        <p class="mt-6 rounded-2xl bg-forest-50 p-5 text-lg leading-9 text-forest-900" data-scramble-def aria-live="polite"></p>
        <div class="mt-6 flex min-h-[64px] flex-wrap justify-center gap-2 rounded-2xl border-2 border-dashed border-sand-200 p-3" data-scramble-slots aria-label="إجابتك"></div>
        <div class="mt-4 flex flex-wrap justify-center gap-2" data-scramble-letters></div>
        <p class="mt-5 min-h-[2rem] text-center font-bold" data-scramble-feedback aria-live="polite"></p>
        <div class="mt-2 flex flex-wrap justify-center gap-3"><button type="button" data-scramble-clear class="min-h-[48px] rounded-xl border-2 border-navy-900 px-6 font-bold text-navy-900">امسح</button><button type="button" data-scramble-next class="min-h-[48px] rounded-xl bg-navy-900 px-6 font-bold text-white">مصطلح آخر</button></div>
      </div>

      <div data-game="memory" hidden>
        <div class="flex items-center justify-between gap-4"><h2 class="text-2xl text-navy-900">طابق المصطلح بمعناه</h2><p class="numeric rounded-full bg-sand-100 px-4 py-1.5 text-sm font-bold text-navy-900">المحاولات: <span data-memory-moves>0</span></p></div>
        <p class="mt-4 leading-8 text-slate-600">اقلب بطاقتين: مصطلحاً وتعريفه. إن تطابقتا بقيتا مكشوفتين.</p>
        <div class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4" data-memory-grid></div>
        <p class="mt-5 min-h-[2rem] text-center font-bold text-forest-600" data-memory-feedback aria-live="polite"></p>
        <div class="mt-2 text-center"><button type="button" data-memory-restart class="min-h-[48px] rounded-xl bg-navy-900 px-6 font-bold text-white">وزّع من جديد</button></div>
      </div>
    </div>
    <p class="mt-6 text-center text-sm leading-7 text-slate-600">الأسئلة معلومات قانونية عامة للتسلية، وقد تختلف التفاصيل من نظام إلى آخر. لمسألتك أنت: <a class="font-bold text-navy-900 underline" href="<?php echo esc_url(abz_url('booking')); ?>">احجز موعداً مع مستشار</a>.</p>
  </div>
  <script type="application/json" id="abz-games-data"><?php echo wp_json_encode($data, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP); ?></script>
</section>
<?php get_footer();
