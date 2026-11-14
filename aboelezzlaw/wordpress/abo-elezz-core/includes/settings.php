<?php
if (!defined('ABSPATH')) {
    exit;
}

/** حقول صفحة «بيانات المؤسسة»: المفتاح ← [التسمية، النوع] */
function abz_settings_fields(): array
{
    return [
        'phone' => ['رقم الهاتف وواتساب (1)', 'text'],
        'whatsapp' => ['واتساب (1) بالصيغة الدولية بلا +', 'text'],
        'phone2' => ['رقم واتساب (2)', 'text'],
        'whatsapp2' => ['واتساب (2) بالصيغة الدولية بلا +', 'text'],
        'landline' => ['الهاتف الأرضي', 'text'],
        'email' => ['البريد الرسمي المعروض', 'email'],
        'alt_email' => ['البريد البديل', 'email'],
        'notify_email' => ['البريد الذي تصله إشعارات النماذج', 'email'],
        'address' => ['عنوان المقر', 'text'],
        'map_url' => ['رابط الخريطة', 'url'],
        'hours' => ['سطر الاستجابة (يظهر بجوار وسائل التواصل)', 'text'],
        'social_facebook' => ['فيسبوك', 'url'],
        'social_instagram' => ['إنستجرام', 'url'],
        'social_tiktok' => ['تيك توك', 'url'],
        'social_x' => ['إكس', 'url'],
        'social_youtube' => ['يوتيوب', 'url'],
        'social_telegram' => ['تيليجرام', 'url'],
        'social_whatsapp_channel' => ['قناة واتساب', 'url'],
        'social_linkedin' => ['لينكدإن', 'url'],
        'social_snapchat' => ['سناب شات', 'url'],
        'social_threads' => ['ثريدز', 'url'],
        'whatsapp_groups' => ['روابط مجموعات واتساب (سطر لكل رابط)', 'textarea'],
    ];
}

/** القيم الأولى من بيانات الموقع — تُكتب مرة واحدة ولا تُستبدل بعد تعديل المالك */
function abz_default_settings(): array
{
    $c = abz_data('site.contact', []);
    $s = abz_data('site.social', []);
    return [
        'phone' => $c['phoneLocal'] ?? '',
        'whatsapp' => $c['whatsapp'] ?? '',
        'phone2' => $c['phone2Local'] ?? '',
        'whatsapp2' => $c['whatsapp2'] ?? '',
        'landline' => $c['landlineLocal'] ?? '',
        'email' => $c['publicEmail'] ?? '',
        'alt_email' => $c['altEmail'] ?? '',
        'notify_email' => $c['email'] ?? get_option('admin_email'),
        'address' => $c['address'] ?? '',
        'map_url' => $c['mapUrl'] ?? '',
        'hours' => abz_data('site.workingHours.label', ''),
        'social_facebook' => $s['facebook'] ?? '',
        'social_instagram' => $s['instagram'] ?? '',
        'social_tiktok' => $s['tiktok'] ?? '',
        'social_x' => $s['x'] ?? '',
        'social_youtube' => $s['youtube'] ?? '',
        'social_telegram' => $s['telegram'] ?? '',
        'social_whatsapp_channel' => $s['whatsappChannel'] ?? '',
        'social_linkedin' => $s['linkedin'] ?? '',
        'social_snapchat' => $s['snapchat'] ?? '',
        'social_threads' => $s['threads'] ?? '',
        'whatsapp_groups' => implode("\n", $s['whatsappGroups'] ?? []),
    ];
}

add_action('admin_menu', function () {
    add_options_page('بيانات المؤسسة', 'بيانات المؤسسة', 'manage_options', 'abz-settings', 'abz_render_settings');
});

add_action('admin_init', function () {
    register_setting('abz_settings', 'abz_settings', [
        'type' => 'array',
        'sanitize_callback' => function ($input) {
            $clean = [];
            foreach (abz_settings_fields() as $key => [, $type]) {
                $value = is_array($input) && isset($input[$key]) ? (string) $input[$key] : '';
                $clean[$key] = match ($type) {
                    'email' => sanitize_email($value),
                    'url' => esc_url_raw($value),
                    'textarea' => sanitize_textarea_field($value),
                    default => sanitize_text_field($value),
                };
            }
            return $clean;
        },
    ]);
});

function abz_render_settings(): void
{
    if (!current_user_can('manage_options')) {
        return;
    }
    $values = get_option('abz_settings', []);
    echo '<div class="wrap"><h1>بيانات المؤسسة</h1><p>تظهر هذه البيانات في رأس الموقع وتذييله وصفحة التواصل ونهاية كل مقال.</p>';
    echo '<form method="post" action="options.php">';
    settings_fields('abz_settings');
    echo '<table class="form-table" role="presentation">';
    foreach (abz_settings_fields() as $key => [$label, $type]) {
        $value = $values[$key] ?? '';
        printf('<tr><th scope="row"><label for="abz_%1$s">%2$s</label></th><td>', esc_attr($key), esc_html($label));
        if ($type === 'textarea') {
            printf('<textarea id="abz_%1$s" name="abz_settings[%1$s]" rows="3" class="large-text">%2$s</textarea>', esc_attr($key), esc_textarea($value));
        } else {
            printf('<input id="abz_%1$s" name="abz_settings[%1$s]" type="%3$s" value="%2$s" class="regular-text" dir="auto">', esc_attr($key), esc_attr($value), esc_attr($type === 'url' ? 'url' : ($type === 'email' ? 'email' : 'text')));
        }
        echo '</td></tr>';
    }
    echo '</table>';
    submit_button('حفظ');
    echo '</form></div>';
}
