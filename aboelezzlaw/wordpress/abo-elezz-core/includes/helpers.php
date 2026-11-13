<?php
if (!defined('ABSPATH')) {
    exit;
}

/** بيانات المحتوى الأولي (seed.json) — تُقرأ مرة واحدة لكل طلب */
function abz_seed(): array
{
    static $seed = null;
    if ($seed === null) {
        $file = ABZ_CORE_DIR . 'seed/seed.json';
        $seed = is_readable($file) ? (json_decode((string) file_get_contents($file), true) ?: []) : [];
    }
    return $seed;
}

/** نسخة البيانات + مراجعة المستورد: تغيّر أيّهما يعيد الاستيراد مرة واحدة */
const ABZ_IMPORTER_REVISION = 'r5';

function abz_seed_version(): string
{
    $version = (string) (abz_seed()['version'] ?? '');
    return $version === '' ? '' : $version . '-' . ABZ_IMPORTER_REVISION;
}

/** قسم من البيانات بمسار منقوط: abz_data('firm.team') */
function abz_data(string $path, $default = null)
{
    $value = abz_seed();
    foreach (explode('.', $path) as $key) {
        if (!is_array($value) || !array_key_exists($key, $value)) {
            return $default;
        }
        $value = $value[$key];
    }
    return $value;
}

/**
 * إعدادات المؤسسة (الأرقام، البريد، الحسابات) — قابلة للتعديل من
 * «الإعدادات ← بيانات المؤسسة»، وقيمها الأولى من البيانات.
 */
function abz_setting(string $key, $default = '')
{
    $settings = get_option('abz_settings', []);
    if (isset($settings[$key]) && $settings[$key] !== '') {
        return $settings[$key];
    }
    return $default;
}

function abz_digits(string $value): string
{
    return preg_replace('/\D+/', '', $value);
}

/** رابط واتساب برسالة اختيارية */
function abz_wa_link(string $message = '', string $number = ''): string
{
    $number = abz_digits($number !== '' ? $number : (string) abz_setting('whatsapp', '201157844664'));
    return 'https://wa.me/' . $number . ($message !== '' ? '?text=' . rawurlencode($message) : '');
}

/** حسابات التواصل الاجتماعي بالترتيب المعروض: [key, label, url] */
function abz_social_links(): array
{
    $labels = [
        'facebook' => 'فيسبوك',
        'instagram' => 'إنستجرام',
        'tiktok' => 'تيك توك',
        'x' => 'إكس',
        'youtube' => 'يوتيوب',
        'telegram' => 'تيليجرام',
        'whatsapp_channel' => 'قناة واتساب',
        'linkedin' => 'لينكدإن',
    ];
    $links = [];
    foreach ($labels as $key => $label) {
        $url = (string) abz_setting('social_' . $key, '');
        if ($url !== '' && wp_http_validate_url($url)) {
            $links[] = ['key' => $key, 'label' => $label, 'url' => $url];
        }
    }
    return $links;
}

function abz_price(float $amount): string
{
    return number_format_i18n($amount) . ' ج.م';
}

/** عنوان IP للعميل لأغراض الحدّ من الإرسال المتكرر فقط — لا يُخزَّن */
function abz_client_key(): string
{
    $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    return substr(hash_hmac('sha256', $ip, wp_salt('nonce')), 0, 32);
}

/** حدّ بسيط للمحاولات: يرجع false إذا تجاوز العدد خلال المدة */
function abz_rate_limit(string $bucket, int $max, int $seconds): bool
{
    $key = 'abz_rl_' . $bucket . '_' . abz_client_key();
    $count = (int) get_transient($key);
    if ($count >= $max) {
        return false;
    }
    set_transient($key, $count + 1, $seconds);
    return true;
}
