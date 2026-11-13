<?php
if (!defined('ABSPATH')) {
    exit;
}

/**
 * نماذج الموقع: تواصل، حجز استشارة، تسجيل اهتمام.
 *
 * كل طلب يُحفظ في «طلبات العملاء» بلوحة التحكم أولاً ثم يُرسل بريد إلى
 * المؤسسة — فلا يضيع طلب إن تعطّل البريد. الحماية: رمز nonce، حقل فخّ
 * للبرامج الآلية، حدّ للمحاولات، وتحقّق من كل حقل على الخادم.
 */

function abz_form_types(): array
{
    return [
        'contact' => 'رسالة تواصل',
        'booking' => 'طلب حجز استشارة',
        'interest' => 'تسجيل اهتمام',
        'quote' => 'طلب عرض سعر',
    ];
}

function abz_consultation_types(): array
{
    return ['استشارة قانونية عامة', 'مراجعة أو صياغة عقد', 'شركات وتأسيس', 'عمل وموارد بشرية', 'نزاع أو تحكيم', 'زكاة وضرائب', 'امتثال وحماية بيانات', 'أخرى'];
}

function abz_channels(): array
{
    return ['whatsapp' => 'واتساب', 'phone' => 'مكالمة هاتفية', 'video' => 'مكالمة فيديو (Zoom / Google Meet)', 'office' => 'في مقر المؤسسة'];
}

add_shortcode('abz_form', function ($atts) {
    $atts = shortcode_atts(['type' => 'contact', 'topic' => '', 'button' => ''], $atts);
    $type = array_key_exists($atts['type'], abz_form_types()) ? $atts['type'] : 'contact';
    $topic = sanitize_text_field($atts['topic'] !== '' ? $atts['topic'] : (string) ($_GET['topic'] ?? ''));
    $sent = isset($_GET['abz_sent']) && $_GET['abz_sent'] === $type;
    $errors = [];
    $old = [];
    if (!empty($_GET['abz_err'])) {
        $stored = get_transient('abz_form_err_' . sanitize_key(wp_unslash($_GET['abz_err'])));
        if (is_array($stored)) {
            $errors = $stored['errors'];
            $old = $stored['old'];
        }
    }
    ob_start();
    $file = locate_template('template-parts/form-' . $type . '.php');
    $file = $file ?: ABZ_CORE_DIR . 'templates/form.php';
    include $file;
    return (string) ob_get_clean();
});

add_action('admin_post_nopriv_abz_form', 'abz_handle_form');
add_action('admin_post_abz_form', 'abz_handle_form');

function abz_handle_form(): void
{
    $type = sanitize_key(wp_unslash($_POST['abz_type'] ?? 'contact'));
    $back = wp_get_referer() ?: home_url('/');
    $back = remove_query_arg(['abz_sent', 'abz_err'], $back);

    if (!array_key_exists($type, abz_form_types()) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['_abz_nonce'] ?? '')), 'abz_form_' . $type)) {
        wp_safe_redirect(add_query_arg('abz_err', 'expired', $back) . '#abz-form');
        exit;
    }

    // فخّ البرامج الآلية: حقل مخفي لا يملؤه إنسان، وزمن ملء معقول
    $started = (int) ($_POST['abz_t'] ?? 0);
    if (!empty($_POST['website']) || ($started && time() - $started < 3)) {
        wp_safe_redirect(add_query_arg('abz_sent', $type, $back) . '#abz-form');
        exit;
    }

    $field = fn(string $key) => trim(sanitize_text_field(wp_unslash($_POST[$key] ?? '')));
    $data = [
        'name' => $field('name'),
        'email' => sanitize_email(wp_unslash($_POST['email'] ?? '')),
        'phone' => $field('phone'),
        'subject' => $field('subject'),
        'topic' => $field('topic'),
        'consultation_type' => $field('consultation_type'),
        'channel' => $field('channel'),
        'preferred_date' => $field('preferred_date'),
        'preferred_time' => $field('preferred_time'),
        'message' => trim(sanitize_textarea_field(wp_unslash($_POST['message'] ?? ''))),
        'consent' => !empty($_POST['consent']),
    ];

    $errors = [];
    if (mb_strlen($data['name']) < 3 || mb_strlen($data['name']) > 120) {
        $errors['name'] = 'اكتب الاسم كاملاً.';
    }
    if (!is_email($data['email'])) {
        $errors['email'] = 'البريد الإلكتروني غير صحيح.';
    }
    $digits = abz_digits($data['phone']);
    if (strlen($digits) < 8 || strlen($digits) > 15) {
        $errors['phone'] = 'رقم الهاتف غير صحيح — اكتبه بالأرقام مع مفتاح الدولة إن كنت خارج مصر.';
    }
    if ($type === 'contact' && mb_strlen($data['subject']) < 3) {
        $errors['subject'] = 'اكتب موضوع الرسالة.';
    }
    if (in_array($type, ['contact', 'quote'], true) && mb_strlen($data['message']) < 20) {
        $errors['message'] = 'اشرح طلبك في 20 حرفاً على الأقل حتى نستطيع إفادتك.';
    }
    if ($type === 'booking') {
        if (!in_array($data['consultation_type'], abz_consultation_types(), true)) {
            $errors['consultation_type'] = 'اختر نوع الاستشارة.';
        }
        if (!array_key_exists($data['channel'], abz_channels())) {
            $errors['channel'] = 'اختر وسيلة التواصل.';
        }
        $date = DateTime::createFromFormat('Y-m-d', $data['preferred_date'], wp_timezone());
        if (!$date || $date->format('Y-m-d') < wp_date('Y-m-d')) {
            $errors['preferred_date'] = 'اختر تاريخاً قادماً.';
        }
        if (mb_strlen($data['message']) < 20) {
            $errors['message'] = 'اكتب ملخّصاً للموضوع في 20 حرفاً على الأقل.';
        }
    }
    if (mb_strlen($data['message']) > 5000) {
        $errors['message'] = 'الرسالة طويلة جداً — أرسل ملخّصاً وسنتواصل معك.';
    }
    if (!$data['consent']) {
        $errors['consent'] = 'الموافقة على سياسة الخصوصية مطلوبة لمعالجة طلبك.';
    }

    if ($errors) {
        $token = wp_generate_password(12, false);
        $old = $data;
        unset($old['consent']);
        set_transient('abz_form_err_' . strtolower($token), ['errors' => $errors, 'old' => $old], 10 * MINUTE_IN_SECONDS);
        wp_safe_redirect(add_query_arg('abz_err', strtolower($token), $back) . '#abz-form');
        exit;
    }

    if (!abz_rate_limit('form', 6, HOUR_IN_SECONDS)) {
        wp_safe_redirect(add_query_arg('abz_err', 'rate', $back) . '#abz-form');
        exit;
    }

    $label = abz_form_types()[$type];
    $title = sprintf('%s — %s', $label, $data['name']);
    $lines = [
        'النوع' => $label,
        'الاسم' => $data['name'],
        'البريد' => $data['email'],
        'الهاتف' => $data['phone'],
        'الموضوع' => $data['subject'] ?: $data['topic'],
        'نوع الاستشارة' => $data['consultation_type'],
        'وسيلة التواصل' => abz_channels()[$data['channel']] ?? '',
        'التاريخ المفضّل' => $data['preferred_date'],
        'الوقت المفضّل' => $data['preferred_time'],
        'الصفحة' => esc_url_raw($back),
    ];
    $body = '';
    foreach ($lines as $key => $value) {
        if ($value !== '') {
            $body .= $key . ': ' . $value . "\n";
        }
    }
    $body .= "\n" . $data['message'];

    $post_id = wp_insert_post([
        'post_type' => 'abz_request',
        'post_status' => 'private',
        'post_title' => $title,
        'post_content' => $body,
    ], true);
    if (!is_wp_error($post_id)) {
        update_post_meta($post_id, 'abz_type', $type);
        foreach (['name', 'email', 'phone'] as $key) {
            update_post_meta($post_id, 'abz_' . $key, $data[$key]);
        }
        update_post_meta($post_id, 'abz_status', 'new');
    }

    $to = (string) abz_setting('notify_email', get_option('admin_email'));
    $headers = ['Content-Type: text/plain; charset=UTF-8', 'Reply-To: ' . $data['name'] . ' <' . $data['email'] . '>'];
    $admin_link = is_wp_error($post_id) ? '' : "\n\nفي لوحة التحكم: " . admin_url('post.php?post=' . $post_id . '&action=edit');
    $wa = "\nرد سريع على واتساب: " . abz_wa_link('', $digits);
    wp_mail($to, '[' . get_bloginfo('name') . '] ' . $title, $body . $wa . $admin_link, $headers);

    wp_safe_redirect(add_query_arg('abz_sent', $type, $back) . '#abz-form');
    exit;
}

/* أعمدة قائمة الطلبات */
add_filter('manage_abz_request_posts_columns', function ($columns) {
    return ['cb' => $columns['cb'], 'title' => 'الطلب', 'abz_phone' => 'الهاتف', 'abz_email' => 'البريد', 'abz_wa' => 'واتساب', 'date' => 'التاريخ'];
});
add_action('manage_abz_request_posts_custom_column', function ($column, $post_id) {
    if ($column === 'abz_wa') {
        $phone = (string) get_post_meta($post_id, 'abz_phone', true);
        $digits = abz_digits($phone);
        if (str_starts_with($digits, '0')) {
            $digits = '20' . substr($digits, 1);
        }
        printf('<a href="%s" target="_blank" rel="noopener">مراسلة</a>', esc_url(abz_wa_link('', $digits)));
        return;
    }
    echo esc_html((string) get_post_meta($post_id, $column, true));
}, 10, 2);
