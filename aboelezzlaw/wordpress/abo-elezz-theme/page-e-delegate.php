<?php
/* النائب الإلكتروني: نشر مهمة إجرائية في محافظة، عروض المحامين، دفع محجوز، تسليم وتقييم */
if (!defined('ABSPATH')) {
    exit;
}
get_header();

if (!function_exists('abz_delegate_can')) {
    abz_page_hero('النائب الإلكتروني', 'الخدمة غير مفعّلة حالياً', '');
    get_footer();
    return;
}

$uid = get_current_user_id();
$can = abz_delegate_can($uid);
$view = sanitize_key(wp_unslash($_GET['view'] ?? '')); // phpcs:ignore -- عرض فقط
$msg = sanitize_key(wp_unslash($_GET['msg'] ?? '')); // phpcs:ignore
$settings = abz_delegate_settings();
$statuses = abz_delegate_statuses();
$venues = abz_delegate_venues();
$types = abz_delegate_types();
$input = 'block w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-navy-900 placeholder:text-slate-500 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/30';
$label = 'mb-1.5 block text-sm font-bold text-navy-900';
$card = 'rounded-3xl border border-sand-200 bg-white p-6 sm:p-7';
$post_url = admin_url('admin-post.php');
$notices = [
    'posted' => ['ok', 'نُشرت مهمتك، وأُخطر المحامون المسجّلون في المحافظة. ستصلك العروض هنا وعلى بريدك.'],
    'offered' => ['ok', 'أُرسل عرضك إلى صاحب المهمة. يمكنك تعديله ما دامت المهمة تستقبل العروض.'],
    'withdrawn' => ['ok', 'سُحب عرضك.'],
    'delivered' => ['ok', 'سُجِّل التسليم، وأُخطر صاحب المهمة لمراجعته.'],
    'completed' => ['ok', 'اكتملت المهمة وأُضيفت الأتعاب إلى رصيد المنفّذ. قيّم تجربتك من فضلك.'],
    'rated' => ['ok', 'شكراً لتقييمك.'],
    'disputed' => ['warn', 'فُتح نزاع وأُخطرت الإدارة. يبقى المبلغ محجوزاً حتى تحسمه الإدارة.'],
    'cancelled' => ['ok', 'أُلغيت المهمة.'],
    'saved' => ['ok', 'حُفظت إعداداتك.'],
    'payout_sent' => ['ok', 'وصل طلب السحب إلى الإدارة، وستُخطر عند التحويل.'],
    'payout_min' => ['err', 'أقل مبلغ للسحب ' . abz_money((float) $settings['min_payout']) . '، ويجب أن يغطيه رصيدك المتاح، مع كتابة بيانات التحويل.'],
    'fields' => ['err', 'أكمل الحقول المطلوبة: المحافظة والجهة واسمها ونوع الإجراء والموعد وتفاصيل لا تقل عن 20 حرفاً، ووافق على الشروط.'],
    'amount' => ['err', 'أقل قيمة للعرض ' . abz_money((float) $settings['min_amount']) . '، ويجب الموافقة على الشروط.'],
    'closed' => ['err', 'لم تعد هذه المهمة تستقبل العروض.'],
    'invalid' => ['err', 'تعذّر تنفيذ الإجراء: ليس متاحاً لك أو لحالة المهمة الحالية.'],
    'limit' => ['err', 'نشرت مهاماً كثيرة اليوم. حاول غداً.'],
    'payments' => ['err', 'الدفع الإلكتروني غير متاح الآن. حاول لاحقاً أو راسلنا.'],
    'error' => ['err', 'حدث خطأ غير متوقع. حاول مرة أخرى.'],
];

$hidden = function (string $action, array $fields = []) {
    wp_nonce_field($action);
    echo '<input type="hidden" name="action" value="' . esc_attr($action) . '">';
    foreach ($fields as $name => $value) {
        echo '<input type="hidden" name="' . esc_attr($name) . '" value="' . esc_attr((string) $value) . '">';
    }
};
$badge = function (string $status) use ($statuses): string {
    $tone = ['open' => 'bg-forest-50 text-forest-800', 'awaiting_payment' => 'bg-gold-50 text-gold-700', 'in_progress' => 'bg-navy-50 text-navy-800', 'delivered' => 'bg-gold-50 text-gold-700', 'completed' => 'bg-forest-50 text-forest-800', 'disputed' => 'bg-red-50 text-red-800', 'cancelled' => 'bg-slate-100 text-slate-600'][$status] ?? 'bg-slate-100 text-slate-600';
    return '<span class="inline-flex rounded-full px-3 py-1 text-xs font-bold ' . esc_attr($tone) . '">' . esc_html($statuses[$status] ?? $status) . '</span>';
};
$task_row = function (WP_Post $task) use ($badge, $venues, $types): void {
    $status = abz_task_status($task->ID);
    $offers = count(get_posts(['post_type' => 'abz_offer', 'post_parent' => $task->ID, 'numberposts' => 100, 'fields' => 'ids', 'meta_key' => 'abz_state', 'meta_value' => 'pending']));
    $budget = (float) get_post_meta($task->ID, 'abz_budget', true);
    echo '<a href="' . esc_url(abz_task_url($task->ID)) . '" class="group block rounded-2xl border border-sand-200 bg-white p-5 transition hover:border-gold-500 hover:shadow-md">';
    echo '<div class="flex flex-wrap items-center justify-between gap-3"><h3 class="text-base leading-7 text-navy-900 group-hover:text-gold-700">' . esc_html($task->post_title) . '</h3>' . $badge($status) . '</div>';
    echo '<p class="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-600">';
    echo '<span>' . abz_icon('map-pin', 'me-1 inline h-4 w-4 text-gold-600') . esc_html((string) get_post_meta($task->ID, 'abz_gov', true)) . ' — ' . esc_html($venues[(string) get_post_meta($task->ID, 'abz_venue', true)] ?? '') . '</span>';
    echo '<span>' . abz_icon('calendar', 'me-1 inline h-4 w-4 text-gold-600') . 'الموعد: ' . esc_html((string) get_post_meta($task->ID, 'abz_deadline', true)) . '</span>';
    if ($budget > 0) {
        echo '<span>الميزانية التقريبية: ' . esc_html(abz_money($budget)) . '</span>';
    }
    if ($status === 'open') {
        echo '<span>' . esc_html(number_format_i18n($offers)) . ' عرض</span>';
    }
    echo '</p></a>';
};

$hero_lead = 'انشر إجراءك في أي محافظة، فيصل إلى المحامين المسجّلين فيها، وتختار أنسب عرض، وتدفع عبر المنصّة ويبقى المبلغ محجوزاً حتى يتم الإجراء.';
abz_page_hero('للمحامين ومكاتب المحاماة', 'النائب الإلكتروني', $hero_lead, [['الخدمات', get_post_type_archive_link('abz_service')], ['النائب الإلكتروني', '']], 'justice');
?>
<section class="py-10 sm:py-14">
  <div class="mx-auto max-w-7xl px-5 sm:px-8">

    <?php if ($msg && isset($notices[$msg])) : [$tone, $text] = $notices[$msg]; ?>
      <p class="mb-6 rounded-2xl border p-4 font-semibold <?php echo $tone === 'ok' ? 'border-forest-100 bg-forest-50 text-forest-900' : ($tone === 'warn' ? 'border-gold-500/40 bg-gold-50 text-navy-900' : 'border-red-200 bg-red-50 text-red-800'); ?>" role="<?php echo $tone === 'err' ? 'alert' : 'status'; ?>"><?php echo esc_html($text); ?></p>
    <?php endif; ?>

    <?php if ($uid && $can) :
        $unread = abz_unread_notices($uid);
        $tabs = ['' => 'المهام المتاحة', 'new' => 'انشر مهمة', 'mine' => 'مهامي وعروضي', 'wallet' => 'رصيدي', 'notices' => 'الإشعارات', 'settings' => 'محافظاتي'];
        ?>
      <nav class="mb-8 flex flex-wrap gap-2" aria-label="أقسام النائب الإلكتروني">
        <?php foreach ($tabs as $key => $text) : $active = $view === $key || ($key === '' && in_array($view, ['', 'browse'], true)); ?>
          <a href="<?php echo esc_url(abz_delegate_url($key)); ?>" class="inline-flex min-h-[44px] items-center gap-2 rounded-xl px-4 text-sm font-bold <?php echo $active ? 'bg-navy-900 text-white' : 'border border-sand-200 bg-white text-navy-900 hover:border-gold-500'; ?>"<?php echo $active ? ' aria-current="page"' : ''; ?>>
            <?php echo esc_html($text); ?>
            <?php if ($key === 'notices' && $unread) : ?><span class="rounded-full bg-gold-500 px-2 text-xs text-navy-950"><?php echo esc_html(number_format_i18n($unread)); ?></span><?php endif; ?>
          </a>
        <?php endforeach; ?>
      </nav>
    <?php endif; ?>

    <?php
    /* ───── زائر أو حساب غير مؤهّل: شرح الخدمة ───── */
    if (!$uid || !$can) :
        ?>
      <div class="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <div>
          <?php abz_section_heading('كيف تعمل', 'من محافظتك إلى أي محكمة أو جهة — دون أن تتحرّك', 'خدمة بين المحامين: محامٍ يحتاج إجراءً في محافظة أخرى، ومحامٍ مسجّل في تلك المحافظة ينفّذه بأتعاب يتفقان عليها داخل المنصّة.', 'start'); ?>
          <ol class="relative mt-10 space-y-7 border-s border-sand-200 ps-8">
            <?php foreach ([
                ['انشر مهمتك', 'اختر المحافظة، ثم الجهة (محكمة، نيابة، قسم شرطة، شهر عقاري، سجل تجاري، مصلحة حكومية…) ونوع الإجراء والموعد المطلوب.'],
                ['تصلك العروض', 'يُخطَر المحامون المسجّلون في تلك المحافظة فوراً، ويقدّم كل منهم عرضه بالأتعاب والمدة.'],
                ['اختر وادفع', 'تختار العرض المناسب بحسب السعر والتقييم وعدد المهام المنجزة، وتدفع عبر المنصّة. يبقى المبلغ محجوزاً لدينا ولا يُصرف للمنفّذ بعد.'],
                ['التنفيذ والتسليم', 'تتواصلان داخل المنصّة فقط، ويرفع المنفّذ ما يثبت تمام الإجراء (صورة إيصال، صورة رسمية، محضر…).'],
                ['التأكيد والتقييم', 'تؤكّد تمام الإجراء فيُضاف صافي الأتعاب إلى رصيد المنفّذ، ثم تقيّمه. إن لم تراجع خلال ' . (int) $settings['auto_days'] . ' أيام من التسليم يُعتمد التسليم تلقائياً، ولك فتح نزاع قبل ذلك.'],
            ] as $i => [$title, $body]) : ?>
              <li class="abz-reveal relative"><span class="absolute -start-[3.1rem] top-0 flex h-9 w-9 items-center justify-center rounded-full bg-gold-500 font-display text-sm font-black text-navy-950 ring-4 ring-white" aria-hidden="true"><?php echo esc_html((string) ($i + 1)); ?></span><h3 class="text-lg text-navy-900"><?php echo esc_html($title); ?></h3><p class="mt-1.5 leading-8 text-slate-600"><?php echo esc_html($body); ?></p></li>
            <?php endforeach; ?>
          </ol>
        </div>
        <aside class="grid content-start gap-5">
          <div class="rounded-3xl bg-navy-900 p-7 text-white">
            <h2 class="text-lg text-white">رسوم المنصّة — من الطرفين</h2>
            <ul class="mt-4 grid gap-3 leading-8 text-navy-100">
              <li class="flex gap-3"><?php echo abz_icon('check', 'mt-1.5 h-4 w-4 shrink-0 text-gold-400'); ?>صاحب المهمة: <?php echo esc_html(abz_pct((float) $settings['buyer_fee'])); ?> تُضاف على قيمة العرض عند الدفع.</li>
              <li class="flex gap-3"><?php echo abz_icon('check', 'mt-1.5 h-4 w-4 shrink-0 text-gold-400'); ?>المنفّذ: <?php echo esc_html(abz_pct((float) $settings['seller_fee'])); ?> تُخصم من أتعابه عند اكتمال المهمة.</li>
              <li class="flex gap-3"><?php echo abz_icon('check', 'mt-1.5 h-4 w-4 shrink-0 text-gold-400'); ?>لا اشتراك ولا رسوم تسجيل: تدفع فقط حين تُنجَز مهمة.</li>
            </ul>
          </div>
          <div class="<?php echo esc_attr($card); ?>">
            <h2 class="text-lg text-navy-900">قواعد التعامل</h2>
            <ul class="mt-4 grid gap-3 leading-8 text-slate-700">
              <li class="flex gap-3"><?php echo abz_icon('shield-check', 'mt-1.5 h-4 w-4 shrink-0 text-gold-600'); ?>التواصل والدفع داخل المنصّة فقط. أرقام الهواتف والبريد والروابط وحسابات التواصل تُحجب تلقائياً من العروض والرسائل.</li>
              <li class="flex gap-3"><?php echo abz_icon('shield-check', 'mt-1.5 h-4 w-4 shrink-0 text-gold-600'); ?>تظهر الأسماء مستعارة («محامٍ #…») حتى لا يُستدرج أحد إلى التعامل خارج المنصّة.</li>
              <li class="flex gap-3"><?php echo abz_icon('shield-check', 'mt-1.5 h-4 w-4 shrink-0 text-gold-600'); ?>محاولة التعامل أو الدفع خارج المنصّة تعرّض الحساب للإيقاف، وتسقط حماية المبلغ المحجوز.</li>
              <li class="flex gap-3"><?php echo abz_icon('shield-check', 'mt-1.5 h-4 w-4 shrink-0 text-gold-600'); ?>يتحمّل الطرفان مسؤولية صحة الإنابة أو التوكيل اللازم للإجراء، والتزام القواعد المهنية المعمول بها. المنصّة وسيط تقني ولا تقدّم الإجراء بنفسها.</li>
            </ul>
          </div>
          <div class="rounded-3xl border border-gold-500/40 bg-gold-50 p-7">
            <?php if (!$uid) : ?>
              <h2 class="text-lg text-navy-900">ابدأ الآن</h2>
              <p class="mt-2 leading-8 text-slate-700">الخدمة متاحة للمحامين ومكاتب المحاماة وشركاء المؤسسة بعد اعتماد الحساب.</p>
              <div class="mt-4 flex flex-wrap gap-2">
                <?php echo abz_button(abz_account_url('lawyer'), 'سجّل حساب محامٍ', 'primary', 'sm'); ?>
                <?php echo abz_button(abz_account_url('law-firm'), 'سجّل مكتب محاماة', 'outline', 'sm'); ?>
                <?php echo abz_button(wp_login_url(abz_delegate_url()), 'لديّ حساب', 'ghost', 'sm'); ?>
              </div>
            <?php else : [$type, $state] = abz_account_state($uid); ?>
              <h2 class="text-lg text-navy-900"><?php echo $state === 'pending' ? 'حسابك قيد المراجعة' : 'الخدمة للمحامين المعتمدين'; ?></h2>
              <p class="mt-2 leading-8 text-slate-700"><?php echo $state === 'pending' ? 'نراجع بيانات حسابك، وتُفعَّل الخدمة فور الاعتماد وتصلك رسالة بذلك.' : 'النائب الإلكتروني متاح لحسابات المحامين ومكاتب المحاماة وشركاء المؤسسة المعتمدة. إن كنت محامياً فراسلنا لتعديل نوع حسابك.'; ?></p>
              <div class="mt-4"><?php echo abz_button(abz_url('contact'), 'راسلنا', 'primary', 'sm'); ?></div>
            <?php endif; ?>
          </div>
        </aside>
      </div>
    <?php

    /* ───── نشر مهمة ───── */
    elseif ($view === 'new') :
        $my_govs = abz_list(get_user_meta($uid, 'abz_govs', true));
        ?>
      <div class="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <form method="post" action="<?php echo esc_url($post_url); ?>" class="<?php echo esc_attr($card); ?> grid gap-5">
          <?php $hidden('abz_task_create'); ?>
          <h2 class="text-xl text-navy-900">مهمة جديدة</h2>
          <div class="grid gap-5 sm:grid-cols-2">
            <div><label class="<?php echo esc_attr($label); ?>" for="gov">المحافظة *</label>
              <select class="<?php echo esc_attr($input); ?>" id="gov" name="gov" required><option value="">اختر المحافظة</option><?php foreach (ABZ_GOVS as $gov) : ?><option value="<?php echo esc_attr($gov); ?>"><?php echo esc_html($gov); ?></option><?php endforeach; ?></select></div>
            <div><label class="<?php echo esc_attr($label); ?>" for="venue">نوع الجهة *</label>
              <select class="<?php echo esc_attr($input); ?>" id="venue" name="venue" required><option value="">اختر الجهة</option><?php foreach ($venues as $key => $text) : ?><option value="<?php echo esc_attr($key); ?>"><?php echo esc_html($text); ?></option><?php endforeach; ?></select></div>
          </div>
          <div><label class="<?php echo esc_attr($label); ?>" for="venue_name">اسم الجهة بالتحديد *</label>
            <input class="<?php echo esc_attr($input); ?>" id="venue_name" name="venue_name" maxlength="120" required placeholder="مثال: محكمة شمال الجيزة الابتدائية — دائرة 5 مدني"></div>
          <div class="grid gap-5 sm:grid-cols-2">
            <div><label class="<?php echo esc_attr($label); ?>" for="type">نوع الإجراء *</label>
              <select class="<?php echo esc_attr($input); ?>" id="type" name="type" required><option value="">اختر الإجراء</option><?php foreach ($types as $key => $text) : ?><option value="<?php echo esc_attr($key); ?>"><?php echo esc_html($text); ?></option><?php endforeach; ?></select></div>
            <div><label class="<?php echo esc_attr($label); ?>" for="deadline">آخر موعد للتنفيذ *</label>
              <input class="<?php echo esc_attr($input); ?>" id="deadline" name="deadline" type="date" required min="<?php echo esc_attr(wp_date('Y-m-d')); ?>"></div>
          </div>
          <div><label class="<?php echo esc_attr($label); ?>" for="details">تفاصيل المطلوب *</label>
            <textarea class="<?php echo esc_attr($input); ?>" id="details" name="details" rows="6" minlength="20" maxlength="3000" required placeholder="صف الإجراء المطلوب ورقم القضية أو الملف إن لزم، والمستندات التي ستوفّرها للمنفّذ، وما تحتاجه دليلاً على التنفيذ. لا تكتب أرقام هواتف أو بريداً — تُحجب تلقائياً."></textarea></div>
          <div><label class="<?php echo esc_attr($label); ?>" for="budget">ميزانية تقريبية (اختياري، ج.م)</label>
            <input class="<?php echo esc_attr($input); ?>" id="budget" name="budget" type="number" min="0" step="10" inputmode="numeric"></div>
          <label class="flex gap-3 text-sm leading-7 text-slate-700"><input type="checkbox" name="agree" value="1" required class="mt-1.5 h-4 w-4"> أوافق على قواعد النائب الإلكتروني: التواصل والدفع داخل المنصّة فقط، ومسؤوليتي عن صحة البيانات والإنابة أو التوكيل اللازم.</label>
          <button class="min-h-[52px] rounded-xl bg-navy-900 px-6 font-bold text-white hover:bg-navy-800">انشر المهمة وأخطر محامي المحافظة</button>
        </form>
        <aside class="grid content-start gap-5">
          <div class="rounded-3xl bg-navy-900 p-7 text-white">
            <h2 class="text-lg text-white">قبل النشر</h2>
            <ul class="mt-4 grid gap-3 leading-8 text-navy-100">
              <li>لا تنشر بيانات الموكّلين أو مستندات سرّية في وصف المهمة؛ تُرسل المستندات اللازمة للمنفّذ وحده بعد الدفع.</li>
              <li>رسوم المنصّة عليك <?php echo esc_html(abz_pct((float) $settings['buyer_fee'])); ?> تُضاف على قيمة العرض الذي تختاره.</li>
              <li>تُخطَر حالياً حسابات المحامين التي اختارت المحافظة نفسها في إعداداتها.</li>
            </ul>
          </div>
          <?php if (!$my_govs) : ?>
            <div class="rounded-3xl border border-gold-500/40 bg-gold-50 p-6"><p class="leading-8 text-navy-900">لم تحدّد بعد المحافظات التي تعمل فيها، فلن تصلك مهام الآخرين. <a class="font-bold underline" href="<?php echo esc_url(abz_delegate_url('settings')); ?>">حدّدها الآن</a>.</p></div>
          <?php endif; ?>
        </aside>
      </div>
    <?php

    /* ───── تفاصيل مهمة ───── */
    elseif ($view === 'task') :
        $task_id = (int) ($_GET['id'] ?? 0); // phpcs:ignore
        $task = abz_task_get($task_id);
        $role = $task ? abz_task_participant($task_id, $uid) : '';
        $status = $task ? abz_task_status($task_id) : '';
        if (!$task || (!$role && $status !== 'open')) :
            echo '<div class="' . esc_attr($card) . '"><p class="leading-8">هذه المهمة غير متاحة لك.</p></div>';
        else :
            $owner = (int) $task->post_author;
            $executor = (int) get_post_meta($task_id, 'abz_executor', true);
            $budget = (float) get_post_meta($task_id, 'abz_budget', true);
            ?>
      <div class="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
        <div class="grid content-start gap-6">
          <article class="<?php echo esc_attr($card); ?>">
            <div class="flex flex-wrap items-center justify-between gap-3"><h2 class="text-xl leading-9 text-navy-900"><?php echo esc_html($task->post_title); ?></h2><?php echo $badge($status); ?></div>
            <dl class="mt-5 grid gap-4 text-sm sm:grid-cols-2">
              <div><dt class="font-bold text-slate-500">المحافظة</dt><dd class="mt-1 text-navy-900"><?php echo esc_html((string) get_post_meta($task_id, 'abz_gov', true)); ?></dd></div>
              <div><dt class="font-bold text-slate-500">الجهة</dt><dd class="mt-1 text-navy-900"><?php echo esc_html(($venues[(string) get_post_meta($task_id, 'abz_venue', true)] ?? '') . ' — ' . get_post_meta($task_id, 'abz_venue_name', true)); ?></dd></div>
              <div><dt class="font-bold text-slate-500">الإجراء</dt><dd class="mt-1 text-navy-900"><?php echo esc_html($types[(string) get_post_meta($task_id, 'abz_type', true)] ?? ''); ?></dd></div>
              <div><dt class="font-bold text-slate-500">آخر موعد</dt><dd class="mt-1 text-navy-900"><?php echo esc_html((string) get_post_meta($task_id, 'abz_deadline', true)); ?></dd></div>
              <div><dt class="font-bold text-slate-500">صاحب المهمة</dt><dd class="mt-1 text-navy-900"><?php echo esc_html(abz_alias($owner) . ($role === 'owner' ? ' (أنت)' : '')); ?></dd></div>
              <?php if ($budget > 0) : ?><div><dt class="font-bold text-slate-500">الميزانية التقريبية</dt><dd class="mt-1 text-navy-900"><?php echo esc_html(abz_money($budget)); ?></dd></div><?php endif; ?>
            </dl>
            <div class="mt-6 whitespace-pre-line border-t border-sand-200 pt-5 leading-8 text-slate-700"><?php echo esc_html($task->post_content); ?></div>
          </article>

          <?php
          /* العروض — يراها صاحب المهمة وحده */
          if ($role === 'owner' || $role === 'admin') :
              $offers = get_posts(['post_type' => 'abz_offer', 'post_parent' => $task_id, 'numberposts' => 100, 'orderby' => 'date', 'order' => 'ASC']);
              $offers = array_filter($offers, fn($o) => in_array(get_post_meta($o->ID, 'abz_state', true), ['pending', 'accepted'], true));
              ?>
            <section class="<?php echo esc_attr($card); ?>" aria-labelledby="offers-title">
              <h2 id="offers-title" class="text-lg text-navy-900">العروض (<?php echo esc_html(number_format_i18n(count($offers))); ?>)</h2>
              <?php if (!$offers) : ?><p class="mt-3 leading-8 text-slate-600">لم تصل عروض بعد. أُخطر <?php echo esc_html(number_format_i18n((int) get_post_meta($task_id, 'abz_notified', true))); ?> محامياً مسجّلاً في المحافظة، وسيصلك إشعار بكل عرض.</p><?php endif; ?>
              <div class="mt-4 grid gap-4">
                <?php foreach ($offers as $offer) :
                    $lawyer = (int) $offer->post_author;
                    $rating = abz_user_rating($lawyer);
                    $fees = abz_delegate_fees((float) get_post_meta($offer->ID, 'abz_amount', true));
                    $bio = (string) get_user_meta($lawyer, 'abz_delegate_bio', true);
                    ?>
                  <div class="rounded-2xl border border-sand-200 p-5">
                    <div class="flex flex-wrap items-center justify-between gap-3">
                      <p class="font-bold text-navy-900"><?php echo esc_html(abz_alias($lawyer)); ?>
                        <span class="ms-2 text-sm font-semibold text-gold-600"><?php echo $rating['count'] ? esc_html('★ ' . number_format_i18n($rating['avg'], 1) . ' (' . number_format_i18n($rating['count']) . ' تقييم)') : 'بلا تقييمات بعد'; ?></span>
                        <span class="ms-2 text-sm font-normal text-slate-500"><?php echo esc_html(number_format_i18n($rating['done']) . ' مهمة منجزة'); ?></span></p>
                      <p class="text-lg font-black text-navy-900"><?php echo esc_html(abz_money($fees['amount'])); ?> <span class="text-sm font-semibold text-slate-500">خلال <?php echo esc_html(number_format_i18n((int) get_post_meta($offer->ID, 'abz_days', true))); ?> يوم</span></p>
                    </div>
                    <?php if ($bio) : ?><p class="mt-2 text-sm leading-7 text-slate-500"><?php echo esc_html($bio); ?></p><?php endif; ?>
                    <?php if ($note = (string) get_post_meta($offer->ID, 'abz_note', true)) : ?><p class="mt-3 whitespace-pre-line leading-8 text-slate-700"><?php echo esc_html($note); ?></p><?php endif; ?>
                    <?php if ($role === 'owner' && in_array($status, ['open', 'awaiting_payment'], true) && get_post_meta($offer->ID, 'abz_state', true) === 'pending') : ?>
                      <form method="post" action="<?php echo esc_url($post_url); ?>" class="mt-4 flex flex-wrap items-center gap-3">
                        <?php $hidden('abz_offer_accept', ['offer' => $offer->ID]); ?>
                        <button class="min-h-[44px] rounded-xl bg-gold-500 px-5 font-bold text-navy-950 hover:bg-gold-400">اختر هذا العرض وادفع <?php echo esc_html(abz_money($fees['buyer_total'])); ?></button>
                        <span class="text-xs text-slate-500">(<?php echo esc_html(abz_money($fees['amount']) . ' أتعاب + ' . abz_money($fees['buyer_fee']) . ' رسوم المنصّة'); ?>)</span>
                      </form>
                    <?php endif; ?>
                  </div>
                <?php endforeach; ?>
              </div>
              <?php if ($role === 'owner' && $status === 'awaiting_payment' && function_exists('wc_get_order') && ($order = wc_get_order((int) get_post_meta($task_id, 'abz_order', true))) && $order->needs_payment()) : ?>
                <p class="mt-5 rounded-2xl border border-gold-500/40 bg-gold-50 p-4 leading-8 text-navy-900">اخترت عرضاً ولم يكتمل الدفع بعد. <a class="font-bold underline" href="<?php echo esc_url($order->get_checkout_payment_url()); ?>">أكمل الدفع الآن</a> أو اختر عرضاً آخر.</p>
              <?php endif; ?>
            </section>
          <?php endif; ?>

          <?php
          /* المحادثة — بعد الدفع، للطرفين فقط */
          if (in_array($role, ['owner', 'executor', 'admin'], true) && in_array($status, ['in_progress', 'delivered', 'disputed', 'completed'], true)) :
              $thread = get_comments(['post_id' => $task_id, 'type' => 'abz_msg', 'status' => 'approve', 'order' => 'ASC', 'number' => 300]);
              ?>
            <section id="messages" class="<?php echo esc_attr($card); ?> scroll-mt-28" aria-labelledby="messages-title">
              <h2 id="messages-title" class="text-lg text-navy-900">المحادثة والمستندات</h2>
              <p class="mt-1 text-sm text-slate-500">الرسائل محفوظة لدى المنصّة وتراجعها الإدارة عند النزاع. وسائل التواصل تُحجب تلقائياً.</p>
              <div class="mt-5 grid gap-3">
                <?php if (!$thread) : ?><p class="text-slate-600">لا رسائل بعد.</p><?php endif; ?>
                <?php foreach ($thread as $message) : $mine = (int) $message->user_id === $uid; $file = get_comment_meta($message->comment_ID, 'abz_file', true); ?>
                  <div class="max-w-[85%] rounded-2xl p-4 <?php echo $mine ? 'ms-auto bg-navy-900 text-white' : 'bg-sand-100 text-navy-900'; ?>">
                    <p class="text-xs font-bold <?php echo $mine ? 'text-gold-300' : 'text-gold-700'; ?>"><?php echo esc_html(abz_alias((int) $message->user_id)); ?> · <?php echo esc_html(mysql2date('j F Y — g:i a', $message->comment_date)); ?></p>
                    <p class="mt-1 whitespace-pre-line leading-8"><?php echo esc_html($message->comment_content); ?></p>
                    <?php if (is_array($file) && !empty($file['name'])) : ?>
                      <a class="mt-2 inline-flex items-center gap-1 text-sm font-bold underline" href="<?php echo esc_url(wp_nonce_url(add_query_arg(['action' => 'abz_task_file', 'msg' => $message->comment_ID], $post_url), 'abz_task_file_' . $message->comment_ID)); ?>"><?php echo abz_icon('paperclip', 'h-4 w-4'); ?><?php echo esc_html($file['name']); ?></a>
                    <?php endif; ?>
                  </div>
                <?php endforeach; ?>
              </div>
              <?php if (in_array($status, ['in_progress', 'delivered', 'disputed'], true) && $role !== 'admin') : ?>
                <form method="post" action="<?php echo esc_url($post_url); ?>" enctype="multipart/form-data" class="mt-5 grid gap-3">
                  <?php $hidden('abz_task_message', ['task' => $task_id]); ?>
                  <label class="sr-only" for="msg-text">رسالتك</label>
                  <textarea class="<?php echo esc_attr($input); ?>" id="msg-text" name="text" rows="3" maxlength="2000" placeholder="اكتب رسالتك…"></textarea>
                  <div class="flex flex-wrap items-center gap-3">
                    <label class="text-sm text-slate-600">مرفق (PDF أو صورة حتى 8 ميجابايت): <input type="file" name="file" accept=".pdf,.jpg,.jpeg,.png" class="text-sm"></label>
                    <button class="ms-auto min-h-[44px] rounded-xl bg-navy-900 px-5 font-bold text-white hover:bg-navy-800">أرسل</button>
                  </div>
                </form>
              <?php endif; ?>
            </section>
          <?php endif; ?>
        </div>

        <aside class="grid content-start gap-5">
          <?php
          /* محامٍ آخر: تقديم عرض أو تعديله */
          if (!$role && $status === 'open') :
              $mine_offer = get_posts(['post_type' => 'abz_offer', 'post_parent' => $task_id, 'author' => $uid, 'numberposts' => 1]);
              $mine_offer = $mine_offer[0] ?? null;
              $state = $mine_offer ? (string) get_post_meta($mine_offer->ID, 'abz_state', true) : '';
              ?>
            <form method="post" action="<?php echo esc_url($post_url); ?>" class="<?php echo esc_attr($card); ?> grid gap-4">
              <?php $hidden('abz_offer_create', ['task' => $task_id]); ?>
              <h2 class="text-lg text-navy-900"><?php echo $state === 'pending' ? 'عرضك الحالي — يمكنك تعديله' : 'قدّم عرضك'; ?></h2>
              <div><label class="<?php echo esc_attr($label); ?>" for="amount">أتعابك (ج.م) *</label>
                <input class="<?php echo esc_attr($input); ?>" id="amount" name="amount" type="number" min="<?php echo esc_attr((string) $settings['min_amount']); ?>" step="10" required value="<?php echo esc_attr($state === 'pending' ? (string) get_post_meta($mine_offer->ID, 'abz_amount', true) : ''); ?>" data-abz-fee="<?php echo esc_attr((string) $settings['seller_fee']); ?>">
                <p class="mt-1 text-xs text-slate-500">تُخصم عمولة المنصّة <?php echo esc_html(abz_pct((float) $settings['seller_fee'])); ?> عند اكتمال المهمة.</p></div>
              <div><label class="<?php echo esc_attr($label); ?>" for="days">مدة التنفيذ (أيام) *</label>
                <input class="<?php echo esc_attr($input); ?>" id="days" name="days" type="number" min="1" max="60" required value="<?php echo esc_attr($state === 'pending' ? (string) get_post_meta($mine_offer->ID, 'abz_days', true) : '1'); ?>"></div>
              <div><label class="<?php echo esc_attr($label); ?>" for="note">ملاحظات العرض</label>
                <textarea class="<?php echo esc_attr($input); ?>" id="note" name="note" rows="4" maxlength="1000" placeholder="خبرتك بهذه الجهة، وما تحتاجه من صاحب المهمة لتنفيذها."><?php echo esc_textarea($state === 'pending' ? (string) get_post_meta($mine_offer->ID, 'abz_note', true) : ''); ?></textarea></div>
              <label class="flex gap-3 text-sm leading-7 text-slate-700"><input type="checkbox" name="agree" value="1" required class="mt-1.5 h-4 w-4"> ألتزم بالتواصل والدفع داخل المنصّة فقط، وبتنفيذ الإجراء وفق القواعد المهنية.</label>
              <button class="min-h-[48px] rounded-xl bg-navy-900 px-5 font-bold text-white hover:bg-navy-800"><?php echo $state === 'pending' ? 'حدّث العرض' : 'أرسل العرض'; ?></button>
            </form>
            <?php if ($state === 'pending') : ?>
              <form method="post" action="<?php echo esc_url($post_url); ?>"><?php $hidden('abz_offer_withdraw', ['offer' => $mine_offer->ID]); ?><button class="text-sm font-bold text-red-700 underline">اسحب عرضي</button></form>
            <?php endif; ?>
          <?php elseif (!$role) : ?>
            <div class="<?php echo esc_attr($card); ?>"><p class="leading-8 text-slate-600">لم تعد هذه المهمة تستقبل العروض.</p></div>
          <?php endif; ?>

          <?php if ($role === 'executor' || ($role === 'owner' && $executor)) :
              $amount = (float) get_post_meta($task_id, 'abz_amount', true);
              ?>
            <div class="rounded-3xl bg-navy-900 p-7 text-white">
              <h2 class="text-lg text-white">المبالغ</h2>
              <dl class="mt-4 grid gap-2 text-sm text-navy-100">
                <div class="flex justify-between gap-3"><dt>قيمة العرض</dt><dd class="font-bold text-white"><?php echo esc_html(abz_money($amount)); ?></dd></div>
                <?php if ($role === 'owner') : ?><div class="flex justify-between gap-3"><dt>رسوم المنصّة</dt><dd><?php echo esc_html(abz_money((float) get_post_meta($task_id, 'abz_buyer_fee', true))); ?></dd></div><?php endif; ?>
                <?php if ($role === 'executor') : ?><div class="flex justify-between gap-3"><dt>عمولة المنصّة</dt><dd><?php echo esc_html('− ' . abz_money((float) get_post_meta($task_id, 'abz_seller_fee', true))); ?></dd></div>
                <div class="flex justify-between gap-3 border-t border-white/15 pt-2"><dt>صافي أتعابك</dt><dd class="font-bold text-gold-300"><?php echo esc_html(abz_money((float) get_post_meta($task_id, 'abz_payout', true))); ?></dd></div><?php endif; ?>
                <div class="pt-2 text-xs"><?php echo $status === 'completed' ? 'اكتملت المهمة.' : 'المبلغ محجوز لدى المنصّة حتى تأكيد تمام الإجراء.'; ?></div>
              </dl>
            </div>
          <?php endif; ?>

          <?php if ($role === 'executor' && $status === 'in_progress') : ?>
            <form method="post" action="<?php echo esc_url($post_url); ?>" enctype="multipart/form-data" class="<?php echo esc_attr($card); ?> grid gap-4">
              <?php $hidden('abz_task_deliver', ['task' => $task_id]); ?>
              <h2 class="text-lg text-navy-900">سلّم المهمة</h2>
              <textarea class="<?php echo esc_attr($input); ?>" name="note" rows="3" maxlength="2000" placeholder="ماذا تم؟ (رقم الإيصال أو القيد، ما استُلم…)"></textarea>
              <label class="text-sm text-slate-600">إثبات التنفيذ (PDF أو صورة): <input type="file" name="file" accept=".pdf,.jpg,.jpeg,.png" class="text-sm"></label>
              <button class="min-h-[48px] rounded-xl bg-forest-600 px-5 font-bold text-white hover:bg-forest-700">تم التنفيذ — سلّم المهمة</button>
            </form>
          <?php endif; ?>

          <?php if ($role === 'owner' && in_array($status, ['in_progress', 'delivered'], true)) : ?>
            <form method="post" action="<?php echo esc_url($post_url); ?>" class="<?php echo esc_attr($card); ?> grid gap-3" onsubmit="return confirm('تأكيد: تم الإجراء فعلاً؟ يُضاف صافي الأتعاب إلى رصيد المنفّذ ولا يمكن التراجع.');">
              <?php $hidden('abz_task_complete', ['task' => $task_id]); ?>
              <h2 class="text-lg text-navy-900"><?php echo $status === 'delivered' ? 'راجع التسليم' : 'تم الإجراء؟'; ?></h2>
              <?php if ($status === 'delivered') : $left = max(0, (int) get_post_meta($task_id, 'abz_delivered_at', true) + (int) $settings['auto_days'] * DAY_IN_SECONDS - time()); ?>
                <p class="text-sm leading-7 text-slate-600">يُعتمد التسليم تلقائياً بعد <?php echo esc_html(human_time_diff(time(), time() + $left)); ?> إن لم تؤكّد أو تفتح نزاعاً.</p>
              <?php endif; ?>
              <button class="min-h-[48px] rounded-xl bg-forest-600 px-5 font-bold text-white hover:bg-forest-700">أؤكّد تمام الإجراء</button>
            </form>
          <?php endif; ?>

          <?php if (in_array($role, ['owner', 'executor'], true) && in_array($status, ['in_progress', 'delivered'], true)) : ?>
            <details class="<?php echo esc_attr($card); ?>">
              <summary class="cursor-pointer font-bold text-red-700">هناك مشكلة؟ افتح نزاعاً</summary>
              <form method="post" action="<?php echo esc_url($post_url); ?>" class="mt-4 grid gap-3">
                <?php $hidden('abz_task_dispute', ['task' => $task_id]); ?>
                <textarea class="<?php echo esc_attr($input); ?>" name="reason" rows="3" maxlength="1500" required placeholder="اشرح المشكلة بوضوح. تراجع الإدارة المحادثة والمستندات ثم تقرّر."></textarea>
                <button class="min-h-[44px] rounded-xl border-2 border-red-700 px-5 font-bold text-red-700 hover:bg-red-50">افتح النزاع</button>
              </form>
            </details>
          <?php endif; ?>

          <?php if ($role === 'owner' && in_array($status, ['open', 'awaiting_payment'], true)) : ?>
            <form method="post" action="<?php echo esc_url($post_url); ?>" onsubmit="return confirm('إلغاء المهمة؟');"><?php $hidden('abz_task_cancel', ['task' => $task_id]); ?><button class="text-sm font-bold text-red-700 underline">ألغِ المهمة</button></form>
          <?php endif; ?>

          <?php if ($status === 'completed') :
              $rating = (int) get_post_meta($task_id, 'abz_rating', true);
              if ($rating) : ?>
              <div id="rate" class="<?php echo esc_attr($card); ?>"><h2 class="text-lg text-navy-900">التقييم</h2><p class="mt-2 text-2xl text-gold-500" aria-label="<?php echo esc_attr($rating . ' من 5'); ?>"><?php echo esc_html(str_repeat('★', $rating) . str_repeat('☆', 5 - $rating)); ?></p><?php if ($review = (string) get_post_meta($task_id, 'abz_review', true)) : ?><p class="mt-2 leading-8 text-slate-700"><?php echo esc_html($review); ?></p><?php endif; ?></div>
            <?php elseif ($role === 'owner') : ?>
              <form id="rate" method="post" action="<?php echo esc_url($post_url); ?>" class="<?php echo esc_attr($card); ?> grid gap-3 scroll-mt-28">
                <?php $hidden('abz_task_rate', ['task' => $task_id]); ?>
                <h2 class="text-lg text-navy-900">قيّم المنفّذ</h2>
                <fieldset class="flex flex-wrap gap-2"><legend class="mb-2 text-sm font-bold text-navy-900">تقييمك من 5</legend>
                  <?php for ($i = 5; $i >= 1; $i--) : ?><label class="inline-flex min-h-[44px] cursor-pointer items-center gap-1 rounded-xl border border-sand-200 px-3 font-bold text-navy-900 has-[:checked]:border-gold-500 has-[:checked]:bg-gold-500"><input class="sr-only" type="radio" name="rating" value="<?php echo (int) $i; ?>" required><?php echo esc_html(number_format_i18n($i)); ?> <span class="text-gold-600" aria-hidden="true">★</span></label><?php endfor; ?>
                </fieldset>
                <textarea class="<?php echo esc_attr($input); ?>" name="review" rows="3" maxlength="600" placeholder="رأيك في التنفيذ (اختياري)"></textarea>
                <button class="min-h-[44px] rounded-xl bg-navy-900 px-5 font-bold text-white hover:bg-navy-800">أرسل التقييم</button>
              </form>
            <?php endif; ?>
          <?php endif; ?>
        </aside>
      </div>
    <?php
        endif;

    /* ───── مهامي وعروضي ───── */
    elseif ($view === 'mine') :
        $posted = get_posts(['post_type' => 'abz_task', 'author' => $uid, 'numberposts' => 50]);
        $jobs = get_posts(['post_type' => 'abz_task', 'numberposts' => 50, 'meta_key' => 'abz_executor', 'meta_value' => $uid]);
        $my_offers = get_posts(['post_type' => 'abz_offer', 'author' => $uid, 'numberposts' => 50, 'meta_key' => 'abz_state', 'meta_value' => 'pending']);
        ?>
      <div class="grid gap-8 lg:grid-cols-2">
        <section><h2 class="mb-4 text-xl text-navy-900">مهام نشرتها</h2><div class="grid gap-3">
          <?php if (!$posted) : ?><p class="text-slate-600">لم تنشر مهام بعد. <a class="font-bold underline" href="<?php echo esc_url(abz_delegate_url('new')); ?>">انشر أول مهمة</a>.</p><?php endif; ?>
          <?php foreach ($posted as $task) { $task_row($task); } ?>
        </div></section>
        <section><h2 class="mb-4 text-xl text-navy-900">مهام أنفّذها</h2><div class="grid gap-3">
          <?php if (!$jobs) : ?><p class="text-slate-600">لا مهام تنفّذها حالياً.</p><?php endif; ?>
          <?php foreach ($jobs as $task) { $task_row($task); } ?>
        </div>
        <h2 class="mb-4 mt-10 text-xl text-navy-900">عروضي المفتوحة</h2><div class="grid gap-3">
          <?php if (!$my_offers) : ?><p class="text-slate-600">لا عروض مفتوحة.</p><?php endif; ?>
          <?php foreach ($my_offers as $offer) : if ($task = abz_task_get((int) $offer->post_parent)) { $task_row($task); } endforeach; ?>
        </div></section>
      </div>
    <?php

    /* ───── الرصيد ───── */
    elseif ($view === 'wallet') :
        $wallet = abz_wallet($uid);
        ?>
      <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <?php foreach ([['المتاح للسحب', $wallet['available'], 'bg-navy-900 text-white'], ['محجوز في مهام جارية', $wallet['held'], 'bg-white'], ['طلبات سحب قيد التنفيذ', $wallet['requested'], 'bg-white'], ['إجمالي ما حُوّل إليك', $wallet['paid'], 'bg-white']] as [$title, $value, $tone]) : ?>
          <div class="rounded-3xl border border-sand-200 p-6 <?php echo esc_attr($tone); ?>"><p class="text-sm font-bold <?php echo str_contains($tone, 'navy') ? 'text-gold-300' : 'text-slate-500'; ?>"><?php echo esc_html($title); ?></p><p class="mt-2 text-2xl font-black"><?php echo esc_html(abz_money((float) $value)); ?></p></div>
        <?php endforeach; ?>
      </div>
      <div class="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <form method="post" action="<?php echo esc_url($post_url); ?>" class="<?php echo esc_attr($card); ?> grid gap-4">
          <?php $hidden('abz_payout_request'); ?>
          <h2 class="text-lg text-navy-900">اطلب سحب رصيدك</h2>
          <div><label class="<?php echo esc_attr($label); ?>" for="p-amount">المبلغ (ج.م)</label><input class="<?php echo esc_attr($input); ?>" id="p-amount" name="amount" type="number" min="<?php echo esc_attr((string) $settings['min_payout']); ?>" max="<?php echo esc_attr((string) floor($wallet['available'])); ?>" step="1" required></div>
          <div><label class="<?php echo esc_attr($label); ?>" for="p-method">بيانات التحويل</label><input class="<?php echo esc_attr($input); ?>" id="p-method" name="method" maxlength="200" required placeholder="إنستاباي: العنوان — أو: البنك، اسم الحساب، رقم الحساب"></div>
          <p class="text-xs leading-6 text-slate-500">تراها الإدارة وحدها، وتُحوَّل المبالغ يدوياً بعد المراجعة. أقل مبلغ للسحب <?php echo esc_html(abz_money((float) $settings['min_payout'])); ?>.</p>
          <button class="min-h-[48px] rounded-xl bg-navy-900 px-5 font-bold text-white hover:bg-navy-800" <?php disabled($wallet['available'] < (float) $settings['min_payout']); ?>>أرسل طلب السحب</button>
        </form>
        <section class="<?php echo esc_attr($card); ?>"><h2 class="text-lg text-navy-900">الحركات</h2>
          <?php if (!$wallet['entries']) : ?><p class="mt-3 text-slate-600">لا حركات بعد.</p><?php endif; ?>
          <ul class="mt-4 divide-y divide-sand-200">
            <?php foreach (array_slice($wallet['entries'], 0, 50) as $entry) : $amount = (float) get_post_meta($entry->ID, 'abz_amount', true); $state = (string) get_post_meta($entry->ID, 'abz_status', true); ?>
              <li class="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"><span><?php echo esc_html($entry->post_title); ?> <span class="text-slate-500">· <?php echo esc_html(get_the_date('j F Y', $entry)); ?></span><?php if ($state === 'requested') : ?> <span class="text-gold-700">(قيد المراجعة)</span><?php elseif ($state === 'rejected') : ?> <span class="text-red-700">(مرفوض)</span><?php endif; ?></span><span class="font-bold <?php echo $amount < 0 ? 'text-red-700' : 'text-forest-700'; ?>" dir="ltr"><?php echo esc_html(($amount < 0 ? '−' : '+') . abz_money(abs($amount))); ?></span></li>
            <?php endforeach; ?>
          </ul>
        </section>
      </div>
    <?php

    /* ───── الإشعارات ───── */
    elseif ($view === 'notices') :
        $list = array_values(array_filter(abz_list(get_user_meta($uid, 'abz_notices', true)), 'is_array'));
        ?>
      <section class="<?php echo esc_attr($card); ?>"><h2 class="text-lg text-navy-900">الإشعارات</h2>
        <?php if (!$list) : ?><p class="mt-3 text-slate-600">لا إشعارات.</p><?php endif; ?>
        <ul class="mt-4 divide-y divide-sand-200">
          <?php foreach ($list as $notice) : if (!is_array($notice)) { continue; } ?>
            <li class="py-3"><a class="flex flex-wrap items-center justify-between gap-3 hover:text-gold-700 <?php echo empty($notice['read']) ? 'font-bold text-navy-900' : 'text-slate-600'; ?>" href="<?php echo esc_url((string) ($notice['url'] ?? abz_delegate_url())); ?>"><span><?php echo esc_html((string) ($notice['text'] ?? '')); ?></span><span class="text-xs font-normal text-slate-500"><?php echo esc_html(human_time_diff((int) ($notice['t'] ?? time())) . ' مضت'); ?></span></a></li>
          <?php endforeach; ?>
        </ul>
      </section>
    <?php
        // تعليم الإشعارات مقروءة بعد عرضها
        $list && update_user_meta($uid, 'abz_notices', array_map(fn($n) => is_array($n) ? ['read' => 1] + $n : $n, $list));

    /* ───── المحافظات والنبذة ───── */
    elseif ($view === 'settings') :
        $my_govs = abz_list(get_user_meta($uid, 'abz_govs', true));
        ?>
      <form method="post" action="<?php echo esc_url($post_url); ?>" class="<?php echo esc_attr($card); ?> grid gap-6">
        <?php $hidden('abz_delegate_profile'); ?>
        <div><h2 class="text-lg text-navy-900">المحافظات التي تنفّذ فيها الإجراءات</h2><p class="mt-1 text-sm text-slate-600">تصلك المهام الجديدة في هذه المحافظات بالبريد وفي إشعارات الموقع.</p></div>
        <fieldset class="grid gap-2 sm:grid-cols-3 lg:grid-cols-5"><legend class="sr-only">المحافظات</legend>
          <?php foreach (ABZ_GOVS as $gov) : ?>
            <label class="flex min-h-[44px] items-center gap-2 rounded-xl border border-sand-200 px-3 text-sm"><input type="checkbox" name="govs[]" value="<?php echo esc_attr($gov); ?>" <?php checked(in_array($gov, $my_govs, true)); ?>> <?php echo esc_html($gov); ?></label>
          <?php endforeach; ?>
        </fieldset>
        <div><label class="<?php echo esc_attr($label); ?>" for="bio">نبذة مهنية تظهر مع عروضك (بلا وسائل تواصل)</label><textarea class="<?php echo esc_attr($input); ?>" id="bio" name="bio" rows="3" maxlength="500"><?php echo esc_textarea((string) get_user_meta($uid, 'abz_delegate_bio', true)); ?></textarea></div>
        <button class="min-h-[48px] w-fit rounded-xl bg-navy-900 px-6 font-bold text-white hover:bg-navy-800">احفظ</button>
      </form>
    <?php

    /* ───── المهام المتاحة ───── */
    else :
        $my_govs = abz_list(get_user_meta($uid, 'abz_govs', true));
        $filter = sanitize_text_field(wp_unslash($_GET['gov'] ?? '')); // phpcs:ignore
        $filter = in_array($filter, ABZ_GOVS, true) ? $filter : '';
        $meta = [['key' => 'abz_status', 'value' => 'open']];
        if ($filter) {
            $meta[] = ['key' => 'abz_gov', 'value' => $filter];
        } elseif ($my_govs) {
            $meta[] = ['key' => 'abz_gov', 'value' => array_values($my_govs), 'compare' => 'IN'];
        }
        $open = get_posts(['post_type' => 'abz_task', 'numberposts' => 60, 'meta_query' => $meta, 'author__not_in' => [$uid]]);
        ?>
      <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div><h2 class="text-xl text-navy-900">مهام تستقبل العروض <?php echo $filter ? '— ' . esc_html($filter) : ($my_govs ? 'في محافظاتك' : 'في كل المحافظات'); ?></h2>
          <?php if (!$my_govs) : ?><p class="mt-1 text-sm text-slate-600">حدّد <a class="font-bold underline" href="<?php echo esc_url(abz_delegate_url('settings')); ?>">محافظاتك</a> لتصلك المهام الجديدة فور نشرها.</p><?php endif; ?></div>
        <form method="get" action="<?php echo esc_url(abz_delegate_url()); ?>" class="flex gap-2"><label class="sr-only" for="f-gov">المحافظة</label>
          <select class="<?php echo esc_attr($input); ?> !py-2" id="f-gov" name="gov"><option value=""><?php echo $my_govs ? 'محافظاتي' : 'كل المحافظات'; ?></option><?php foreach (ABZ_GOVS as $gov) : ?><option value="<?php echo esc_attr($gov); ?>" <?php selected($filter, $gov); ?>><?php echo esc_html($gov); ?></option><?php endforeach; ?></select>
          <button class="min-h-[44px] rounded-xl border border-sand-200 bg-white px-4 font-bold text-navy-900">عرض</button></form>
      </div>
      <div class="grid gap-3">
        <?php if (!$open) : ?><div class="<?php echo esc_attr($card); ?>"><p class="leading-8 text-slate-600">لا مهام مفتوحة الآن هنا. ستصلك المهام الجديدة في محافظاتك بالبريد وفي الإشعارات.</p><div class="mt-4"><?php echo abz_button(abz_delegate_url('new'), 'تحتاج إجراءً؟ انشر مهمة', 'primary', 'sm'); ?></div></div><?php endif; ?>
        <?php foreach ($open as $task) { $task_row($task); } ?>
      </div>
    <?php endif; ?>

  </div>
</section>
<?php
get_footer();
