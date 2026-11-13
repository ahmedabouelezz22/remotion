<?php
/**
 * Plugin Name: Abo Elezz Core
 * Description: أنواع محتوى المؤسسة (القطاعات، الخدمات، الفريق)، ونماذج التواصل والحجز، والنشرة البريدية، واستيراد المحتوى الأولي.
 * Version: 1.0.0
 * Requires PHP: 8.1
 * Author: Abo Elezz Law Firm
 * Text Domain: abo-elezz-core
 *
 * الإضافة مستقلة عن القالب: تبديل القالب لا يُفقد المحتوى ولا الطلبات ولا المشتركين.
 */

if (!defined('ABSPATH')) {
    exit;
}

define('ABZ_CORE_VERSION', '1.0.0');
define('ABZ_CORE_DIR', plugin_dir_path(__FILE__));
define('ABZ_CORE_URL', plugin_dir_url(__FILE__));

require_once ABZ_CORE_DIR . 'includes/helpers.php';
require_once ABZ_CORE_DIR . 'includes/content-types.php';
require_once ABZ_CORE_DIR . 'includes/settings.php';
require_once ABZ_CORE_DIR . 'includes/forms.php';
require_once ABZ_CORE_DIR . 'includes/newsletter.php';
require_once ABZ_CORE_DIR . 'includes/comments.php';
require_once ABZ_CORE_DIR . 'includes/woo.php';
require_once ABZ_CORE_DIR . 'includes/importer.php';

register_activation_hook(__FILE__, function () {
    abz_register_content_types();
    abz_import_seed(true);
    flush_rewrite_rules();
});

/*
 * الاستيراد عند تغيّر نسخة البيانات (بعد رفع إصدار جديد من الإضافة).
 * يجري في الخلفية مرة واحدة لكل نسخة، ولا يكتب فوق ما عدّله المالك.
 */
add_action('init', function () {
    $seed_version = abz_seed_version();
    if ($seed_version && get_option('abz_seed_version') !== $seed_version && !wp_doing_ajax()) {
        if (get_transient('abz_import_lock')) {
            return;
        }
        set_transient('abz_import_lock', 1, 5 * MINUTE_IN_SECONDS);
        abz_import_seed(false);
        delete_transient('abz_import_lock');
        flush_rewrite_rules(false);
    }
}, 20);
