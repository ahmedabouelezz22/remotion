<?php
if (!defined('ABSPATH')) {
    exit;
}

/**
 * إشعارات المالك على واتساب (وتيليجرام احتياطياً) بكل ما يحدث في الموقع.
 *
 * - خدمة الإرسال يختارها المالك ويُدخل مفتاحها بنفسه في «الإعدادات ← الإشعارات».
 *   المفاتيح لا تُعرض في أي صفحة ولا تُكتب في السجلّ.
 * - الإرسال يتمّ بعد إنهاء استجابة الزائر، فلا يبطئ الموقع.
 * - مستوى التفاصيل يحدّده المالك: الرسالة تمرّ بخادم مزوّد الخدمة، فالافتراضي
 *   «أساسي» (نوع الحدث والاسم والموضوع ورابط اللوحة) لا «كامل».
 */

function abz_notify_events(): array
{
    return [
        'request' => 'رسائل التواصل والحجز وطلبات عروض الأسعار',
        'register' => 'تسجيل حساب جديد',
        'approval' => 'حسابات تنتظر اعتمادك (محامون، مكاتب، موردون، شركاء)',
        'order' => 'طلبات المتجر والمدفوعات (مدفوع، معلّق، فشل)',
        'comment' => 'تعليقات وأسئلة القرّاء على المقالات',
        'newsletter' => 'اشتراك مؤكَّد في النشرة البريدية',
        'delegate' => 'النائب الإلكتروني: مهام وعروض ومدفوعات ونزاعات وطلبات سحب',
        'supplier' => 'منتجات جديدة من الموردين بانتظار المراجعة',
        'ai' => 'زائر طلب التواصل من محادثة «مُفيد»',
    ];
}

function abz_notify_settings(): array
{
    $defaults = [
        'wa_provider' => 'none',
        'wa_phone' => (string) abz_setting('whatsapp', ''),
        'wa_apikey' => '',
        'wa_url' => '',
        'tg_token' => '',
        'tg_chat' => '',
        'detail' => 'basic',
        'events' => array_fill_keys(array_keys(abz_notify_events()), '1'),
    ];
    $saved = get_option('abz_notify', []);
    return is_array($saved) ? array_merge($defaults, $saved) : $defaults;
}

/** مزوّدو واتساب المدعومون: [الاسم، رابط الإعداد، قالب الإرسال GET] */
function abz_notify_providers(): array
{
    return [
        'none' => ['معطّل', '', ''],
        'callmebot' => ['CallMeBot (مجاني للاستخدام الشخصي)', 'https://www.callmebot.com/blog/free-api-whatsapp-messages/', 'https://api.callmebot.com/whatsapp.php?phone={phone}&text={text}&apikey={apikey}'],
        'textmebot' => ['TextMeBot (منخفض التكلفة)', 'https://textmebot.com/', 'https://api.textmebot.com/send.php?recipient={phone}&apikey={apikey}&text={text}'],
        'custom' => ['خدمة أخرى (رابط إرسال GET)', '', ''],
    ];
}

/**
 * يضيف إشعاراً إلى قائمة الإرسال. $lines: [تسمية => قيمة]؛ المفتاح '_detail'
 * يُعرض في المستوى «الكامل» فقط (مثل نصّ الرسالة).
 */
function abz_notify(string $event, string $title, array $lines = [], string $link = ''): void
{
    $settings = abz_notify_settings();
    if (empty($settings['events'][$event])) {
        return;
    }
    $GLOBALS['abz_notify_queue'][] = compact('event', 'title', 'lines', 'link');
    if (!has_action('shutdown', 'abz_notify_flush')) {
        add_action('shutdown', 'abz_notify_flush', 20);
    }
}

function abz_notify_flush(): void
{
    $queue = $GLOBALS['abz_notify_queue'] ?? [];
    $GLOBALS['abz_notify_queue'] = [];
    if (!$queue) {
        return;
    }
    if (function_exists('litespeed_finish_request')) {
        litespeed_finish_request();
    } elseif (function_exists('fastcgi_finish_request')) {
        fastcgi_finish_request();
    }
    foreach ($queue as $item) {
        abz_notify_send(abz_notify_text($item));
    }
}

function abz_notify_text(array $item): string
{
    $settings = abz_notify_settings();
    $text = '🔔 *' . $item['title'] . '*';
    if ($settings['detail'] !== 'minimal') {
        foreach ($item['lines'] as $label => $value) {
            $value = trim(wp_strip_all_tags((string) $value));
            if ($value === '' || ($label === '_detail' && $settings['detail'] !== 'full')) {
                continue;
            }
            $text .= "\n" . ($label === '_detail' ? mb_substr($value, 0, 400) : $label . ': ' . mb_substr($value, 0, 160));
        }
    }
    if ($item['link'] !== '') {
        $text .= "\n" . $item['link'];
    }
    return mb_substr($text, 0, 1400);
}

/** يرسل نصاً إلى كل القنوات المفعّلة، ويحفظ نتيجة آخر محاولة (رمز الاستجابة فقط) */
function abz_notify_send(string $text): array
{
    $settings = abz_notify_settings();
    $results = [];
    $provider = (string) $settings['wa_provider'];
    $phone = preg_replace('/\D+/', '', (string) $settings['wa_phone']);
    $template = $provider === 'custom' ? (string) $settings['wa_url'] : (abz_notify_providers()[$provider][2] ?? '');
    if ($provider !== 'none' && $template !== '' && $phone !== '') {
        $url = strtr($template, [
            '{phone}' => rawurlencode('+' . $phone),
            '{phone_digits}' => $phone,
            '{text}' => rawurlencode($text),
            '{apikey}' => rawurlencode((string) $settings['wa_apikey']),
        ]);
        if (wp_http_validate_url($url)) {
            $response = wp_remote_get($url, ['timeout' => 12, 'redirection' => 2]);
            $results['whatsapp'] = is_wp_error($response) ? 'خطأ اتصال: ' . $response->get_error_code() : (string) wp_remote_retrieve_response_code($response);
        } else {
            $results['whatsapp'] = 'رابط الإرسال غير صالح';
        }
    }
    if ($settings['tg_token'] !== '' && $settings['tg_chat'] !== '') {
        $response = wp_remote_post('https://api.telegram.org/bot' . rawurlencode((string) $settings['tg_token']) . '/sendMessage', [
            'timeout' => 12,
            'body' => ['chat_id' => (string) $settings['tg_chat'], 'text' => str_replace('*', '', $text), 'disable_web_page_preview' => 'true'],
        ]);
        $results['telegram'] = is_wp_error($response) ? 'خطأ اتصال: ' . $response->get_error_code() : (string) wp_remote_retrieve_response_code($response);
    }
    if ($results) {
        update_option('abz_notify_last', ['time' => current_time('mysql'), 'results' => $results], false);
    }
    return $results;
}

/* ───────────── الأحداث ───────────── */

add_action('abz_request_created', function ($post_id, $type, $data, $title) {
    abz_notify('request', $title, [
        'الاسم' => $data['name'] ?? '',
        'الموضوع' => ($data['subject'] ?? '') ?: ($data['topic'] ?? ''),
        'الهاتف' => abz_notify_settings()['detail'] === 'full' ? ($data['phone'] ?? '') : '',
        '_detail' => $data['message'] ?? '',
    ], admin_url('post.php?post=' . (int) $post_id . '&action=edit'));
}, 10, 4);

add_action('user_register', function ($user_id) {
    $user = get_userdata($user_id);
    if (!$user || user_can($user, 'edit_posts')) {
        return;
    }
    // نوع الحساب يُحفظ بعد هذا الحدث؛ فنقرؤه عند الإرسال
    add_action('shutdown', function () use ($user_id, $user) {
        $type = (string) get_user_meta($user_id, 'abz_account_type', true) ?: 'citizen';
        $types = function_exists('abz_account_types') ? abz_account_types() : [];
        abz_notify('register', 'حساب جديد على الموقع', [
            'النوع' => $types[$type]['title'] ?? $type,
            'البريد' => abz_notify_settings()['detail'] === 'full' ? $user->user_email : '',
        ], admin_url('user-edit.php?user_id=' . (int) $user_id));
    }, 5);
});

add_action('woocommerce_order_status_changed', function ($order_id, $from, $to) {
    if (!in_array($to, ['processing', 'completed', 'on-hold', 'failed'], true)) {
        return;
    }
    $order = wc_get_order($order_id);
    if (!$order) {
        return;
    }
    $labels = ['processing' => 'طلب مدفوع', 'completed' => 'طلب مكتمل', 'on-hold' => 'طلب معلّق بانتظار التحقّق', 'failed' => 'فشل دفع طلب'];
    $items = implode('، ', array_map(fn($i) => $i->get_name(), array_values($order->get_items())));
    abz_notify('order', $labels[$to] . ' #' . $order->get_order_number(), [
        'المبلغ' => wp_strip_all_tags(wc_price($order->get_total(), ['currency' => $order->get_currency()])),
        'الوسيلة' => $order->get_payment_method_title(),
        'المنتج' => mb_substr($items, 0, 120),
    ], $order->get_edit_order_url());
}, 10, 3);

add_action('comment_post', function ($comment_id, $approved) {
    $comment = get_comment($comment_id);
    if (!$comment || !in_array($comment->comment_type, ['', 'comment'], true) || $comment->user_id && user_can((int) $comment->user_id, 'moderate_comments')) {
        return;
    }
    abz_notify('comment', $approved ? 'تعليق جديد' : 'تعليق ينتظر موافقتك', [
        'المقال' => get_the_title((int) $comment->comment_post_ID),
        'الاسم' => $comment->comment_author,
        '_detail' => $comment->comment_content,
    ], admin_url('edit-comments.php?comment_status=moderated'));
}, 10, 2);

add_action('abz_subscriber_confirmed', function ($subscriber_id) {
    abz_notify('newsletter', 'مشترك جديد في النشرة البريدية', [], admin_url('edit.php?post_type=abz_subscriber'));
});

/* ───────────── صفحة الإعدادات ───────────── */

add_action('admin_menu', function () {
    add_options_page('الإشعارات وواتساب', 'الإشعارات وواتساب', 'manage_options', 'abz-notify', 'abz_render_notify_settings');
});

add_action('admin_post_abz_notify_save', function () {
    if (!current_user_can('manage_options')) {
        wp_die('غير مصرّح.', 403);
    }
    check_admin_referer('abz_notify_save');
    $old = abz_notify_settings();
    $in = wp_unslash($_POST['abz_notify'] ?? []);
    $providers = abz_notify_providers();
    $new = [
        'wa_provider' => isset($providers[$in['wa_provider'] ?? '']) ? $in['wa_provider'] : 'none',
        'wa_phone' => preg_replace('/[^\d+]/', '', (string) ($in['wa_phone'] ?? '')),
        // لا نستخدم esc_url_raw: فهو يحذف الأقواس {phone} من القالب
        'wa_url' => preg_match('#^https://[^\s"<>]+$#', $url = trim(sanitize_text_field((string) ($in['wa_url'] ?? '')))) ? $url : '',
        'tg_chat' => preg_replace('/[^\d\-]/', '', (string) ($in['tg_chat'] ?? '')),
        'detail' => in_array($in['detail'] ?? '', ['minimal', 'basic', 'full'], true) ? $in['detail'] : 'basic',
        'events' => array_map(fn() => '1', array_intersect_key((array) ($in['events'] ?? []), abz_notify_events())),
    ];
    // حقل المفتاح الفارغ يعني «اترك المحفوظ كما هو»؛ والخيار «احذف» يمسحه
    foreach (['wa_apikey', 'tg_token'] as $secret) {
        $value = trim((string) ($in[$secret] ?? ''));
        $new[$secret] = !empty($in[$secret . '_clear']) ? '' : ($value !== '' ? sanitize_text_field($value) : $old[$secret]);
    }
    // رابط الخدمة المخصّصة يحمل المفتاح غالباً: يُحتفظ به إن تُرك فارغاً
    if ($new['wa_url'] === '' && $new['wa_provider'] === 'custom') {
        $new['wa_url'] = $old['wa_url'];
    }
    update_option('abz_notify', $new, false);
    $result = '';
    if (!empty($_POST['send_test'])) {
        $sent = abz_notify_send(abz_notify_text(['title' => 'رسالة تجريبية من موقع المؤسسة', 'lines' => ['الوقت' => wp_date('j F Y — H:i')], 'link' => admin_url()]));
        $result = $sent ? wp_json_encode($sent, JSON_UNESCAPED_UNICODE) : 'لا توجد قناة مفعّلة';
    }
    if (!empty($_POST['tg_detect']) && $new['tg_token'] !== '') {
        $response = wp_remote_get('https://api.telegram.org/bot' . rawurlencode($new['tg_token']) . '/getUpdates', ['timeout' => 12]);
        $body = is_wp_error($response) ? [] : json_decode((string) wp_remote_retrieve_body($response), true);
        $chat = '';
        foreach (array_reverse((array) ($body['result'] ?? [])) as $update) {
            $chat = (string) ($update['message']['chat']['id'] ?? '');
            if ($chat !== '') {
                break;
            }
        }
        if ($chat !== '') {
            $new['tg_chat'] = $chat;
            update_option('abz_notify', $new, false);
            $result = 'تم العثور على معرّف المحادثة وحفظه.';
        } else {
            $result = 'لم نجد رسالة: افتح البوت في تيليجرام وأرسل له أي رسالة، ثم اضغط الزر مرة أخرى.';
        }
    }
    wp_safe_redirect(add_query_arg(['page' => 'abz-notify', 'saved' => 1, 'result' => rawurlencode($result)], admin_url('options-general.php')));
    exit;
});

function abz_render_notify_settings(): void
{
    $s = abz_notify_settings();
    $last = get_option('abz_notify_last');
    $result = isset($_GET['result']) ? sanitize_text_field(wp_unslash($_GET['result'])) : ''; // phpcs:ignore -- عرض فقط
    ?>
    <div class="wrap" dir="rtl">
      <h1>الإشعارات وواتساب</h1>
      <p>يصلك إشعار فوري بكل حدث تختاره أدناه. الرسالة تمرّ بخادم الخدمة التي تختارها، فاختر مستوى التفاصيل المناسب لسرّية عملائك.</p>
      <?php if (!empty($_GET['saved'])) : // phpcs:ignore ?><div class="notice notice-success"><p>تم الحفظ. <?php echo esc_html($result); ?></p></div><?php endif; ?>
      <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
        <input type="hidden" name="action" value="abz_notify_save">
        <?php wp_nonce_field('abz_notify_save'); ?>
        <h2>واتساب</h2>
        <table class="form-table" role="presentation">
          <tr><th>خدمة الإرسال</th><td><select name="abz_notify[wa_provider]">
            <?php foreach (abz_notify_providers() as $key => [$label, $help]) : ?><option value="<?php echo esc_attr($key); ?>" <?php selected($s['wa_provider'], $key); ?>><?php echo esc_html($label); ?></option><?php endforeach; ?>
          </select>
          <p class="description">CallMeBot: أضف رقم البوت من <a href="https://www.callmebot.com/blog/free-api-whatsapp-messages/" target="_blank" rel="noopener">صفحتهم</a> إلى جهاتك، وأرسل له «I allow callmebot to send me messages»، فيصلك المفتاح. الخدمة المجانية للاستخدام الشخصي وقد تكون ممتلئة مؤقتاً. TextMeBot خدمة مدفوعة منخفضة التكلفة بالطريقة نفسها.</p></td></tr>
          <tr><th>رقمك على واتساب</th><td><input type="text" dir="ltr" name="abz_notify[wa_phone]" value="<?php echo esc_attr($s['wa_phone']); ?>" placeholder="201157844664" class="regular-text"><p class="description">بالصيغة الدولية بلا أصفار في البداية.</p></td></tr>
          <tr><th>مفتاح الخدمة (API key)</th><td><input type="password" autocomplete="new-password" dir="ltr" name="abz_notify[wa_apikey]" value="" placeholder="<?php echo $s['wa_apikey'] !== '' ? 'محفوظ — اتركه فارغاً للإبقاء عليه' : ''; ?>" class="regular-text">
            <?php if ($s['wa_apikey'] !== '') : ?><label><input type="checkbox" name="abz_notify[wa_apikey_clear]" value="1"> احذف المفتاح المحفوظ</label><?php endif; ?></td></tr>
          <tr><th>رابط الإرسال (للخدمات الأخرى)</th><td><input type="url" dir="ltr" name="abz_notify[wa_url]" value="" placeholder="<?php echo $s['wa_url'] !== '' ? 'محفوظ — اتركه فارغاً للإبقاء عليه' : 'https://api.example.com/send?to={phone}&msg={text}&key={apikey}'; ?>" class="large-text"><p class="description">استخدم {phone} و{text} و{apikey} في الرابط.</p></td></tr>
        </table>
        <h2>تيليجرام (اختياري، مجاني وموثوق)</h2>
        <table class="form-table" role="presentation">
          <tr><th>رمز البوت</th><td><input type="password" autocomplete="new-password" dir="ltr" name="abz_notify[tg_token]" value="" placeholder="<?php echo $s['tg_token'] !== '' ? 'محفوظ — اتركه فارغاً للإبقاء عليه' : 'من @BotFather'; ?>" class="regular-text">
            <?php if ($s['tg_token'] !== '') : ?><label><input type="checkbox" name="abz_notify[tg_token_clear]" value="1"> احذف</label><?php endif; ?>
            <p class="description">أنشئ بوتاً من @BotFather في تيليجرام، والصق الرمز هنا، ثم أرسل أي رسالة للبوت واضغط «اكتشف معرّف المحادثة».</p></td></tr>
          <tr><th>معرّف المحادثة</th><td><input type="text" dir="ltr" name="abz_notify[tg_chat]" value="<?php echo esc_attr($s['tg_chat']); ?>" class="regular-text"> <button class="button" name="tg_detect" value="1">اكتشف معرّف المحادثة</button></td></tr>
        </table>
        <h2>ما الذي يصلك</h2>
        <table class="form-table" role="presentation">
          <tr><th>الأحداث</th><td><?php foreach (abz_notify_events() as $key => $label) : ?><label style="display:block;margin:.3em 0"><input type="checkbox" name="abz_notify[events][<?php echo esc_attr($key); ?>]" value="1" <?php checked(!empty($s['events'][$key])); ?>> <?php echo esc_html($label); ?></label><?php endforeach; ?></td></tr>
          <tr><th>مستوى التفاصيل</th><td><select name="abz_notify[detail]">
            <option value="minimal" <?php selected($s['detail'], 'minimal'); ?>>مختصر: نوع الحدث ورابط اللوحة فقط</option>
            <option value="basic" <?php selected($s['detail'], 'basic'); ?>>أساسي: + الاسم والموضوع والمبلغ (موصى به)</option>
            <option value="full" <?php selected($s['detail'], 'full'); ?>>كامل: + الهاتف والبريد ونصّ الرسالة</option>
          </select></td></tr>
        </table>
        <p><button class="button button-primary">حفظ</button> <button class="button" name="send_test" value="1">حفظ وإرسال رسالة تجريبية</button></p>
      </form>
      <?php if (is_array($last)) : ?><p>آخر محاولة إرسال: <?php echo esc_html($last['time']); ?> — <?php echo esc_html(wp_json_encode($last['results'], JSON_UNESCAPED_UNICODE)); ?> (الرمز 200 يعني نجاح الإرسال إلى الخدمة)</p><?php endif; ?>
    </div>
    <?php
}
