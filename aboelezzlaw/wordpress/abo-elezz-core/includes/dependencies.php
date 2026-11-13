<?php
if (!defined('ABSPATH')) {
    exit;
}

/**
 * يثبّت WooCommerce (مجاني، من مستودع ووردبريس الرسمي) إن لم يكن مثبّتاً،
 * لأن المتجر يعتمد عليه. يجري مرة في الخلفية عبر مهمّة مجدولة، ويُسجَّل
 * نجاحه أو فشله في سجلّ الاستيراد. لا يثبّت أي إضافة مدفوعة.
 */
const ABZ_REQUIRED_PLUGINS = [
    'woocommerce' => 'woocommerce/woocommerce.php',
];

function abz_missing_dependencies(): array
{
    if (!function_exists('get_plugins')) {
        require_once ABSPATH . 'wp-admin/includes/plugin.php';
    }
    $installed = get_plugins();
    $missing = [];
    foreach (ABZ_REQUIRED_PLUGINS as $slug => $file) {
        if (!isset($installed[$file]) || !is_plugin_active($file)) {
            $missing[$slug] = $file;
        }
    }
    return $missing;
}

function abz_install_dependencies(): void
{
    if (get_transient('abz_installing_deps')) {
        return;
    }
    abz_import_log('بدء تثبيت الإضافات المطلوبة');
    set_transient('abz_installing_deps', 1, 10 * MINUTE_IN_SECONDS);
    require_once ABSPATH . 'wp-admin/includes/plugin.php';
    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/misc.php';
    require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
    @set_time_limit(300);

    foreach (abz_missing_dependencies() as $slug => $file) {
        $installed = get_plugins();
        if (!isset($installed[$file])) {
            if (!WP_Filesystem()) {
                abz_import_log("تعذّر تثبيت {$slug}: لا صلاحية كتابة مباشرة على الملفات");
                continue;
            }
            $skin = new Automatic_Upgrader_Skin();
            $upgrader = new Plugin_Upgrader($skin);
            $result = $upgrader->install("https://downloads.wordpress.org/plugin/{$slug}.latest-stable.zip");
            if (is_wp_error($result) || !$result) {
                $details = is_wp_error($result) ? $result->get_error_message() : '';
                $messages = array_map(fn($m) => is_wp_error($m) ? $m->get_error_message() : (string) $m, (array) $skin->get_upgrade_messages());
                $errors = $skin->result instanceof WP_Error ? $skin->result->get_error_message() : '';
                abz_import_log("فشل تثبيت {$slug}: " . trim($details . ' ' . $errors . ' | ' . implode(' / ', array_slice($messages, -6))) . ' | FS=' . get_filesystem_method() . ' | mem=' . ini_get('memory_limit'));
                continue;
            }
            wp_clean_plugins_cache();
        }
        $activated = activate_plugin($file);
        abz_import_log(is_wp_error($activated) ? "فشل تفعيل {$slug}: " . $activated->get_error_message() : "ثُبّت وفُعّل {$slug}");
    }
    // يُعاد الاستيراد في الطلب التالي ليُنشئ المتجر
    delete_option('abz_seed_version');
    delete_transient('abz_installing_deps');
}
add_action('abz_install_dependencies', 'abz_install_dependencies');

/*
 * إن نقصت إضافة مطلوبة يُثبَّت بعد إرسال الصفحة للزائر (فلا ينتظر)، مرة كل
 * ساعة على الأكثر. لا نعتمد على المهام المجدولة لأنها قد تكون معطّلة لدى المضيف.
 */
add_action('init', function () {
    if (get_transient('abz_deps_checked_v5') || wp_installing() || wp_doing_ajax()) {
        return;
    }
    set_transient('abz_deps_checked_v5', 1, HOUR_IN_SECONDS);
    $missing = abz_missing_dependencies();
    if (!$missing) {
        return;
    }
    abz_import_log('تثبيت مطلوب: ' . implode('، ', array_keys($missing)));
    add_action('shutdown', function () {
        if (function_exists('litespeed_finish_request')) {
            litespeed_finish_request();
        } elseif (function_exists('fastcgi_finish_request')) {
            fastcgi_finish_request();
        }
        ignore_user_abort(true);
        abz_install_dependencies();
    }, 1);
}, 30);
