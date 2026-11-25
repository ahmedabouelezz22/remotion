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
require_once ABZ_CORE_DIR . 'includes/notify.php';
require_once ABZ_CORE_DIR . 'includes/forms.php';
require_once ABZ_CORE_DIR . 'includes/newsletter.php';
require_once ABZ_CORE_DIR . 'includes/comments.php';
require_once ABZ_CORE_DIR . 'includes/woo.php';
require_once ABZ_CORE_DIR . 'includes/accounts.php';
require_once ABZ_CORE_DIR . 'includes/marketplace.php';
require_once ABZ_CORE_DIR . 'includes/delegate.php';
require_once ABZ_CORE_DIR . 'includes/library.php';
require_once ABZ_CORE_DIR . 'includes/videos.php';
require_once ABZ_CORE_DIR . 'includes/assistant.php';
require_once ABZ_CORE_DIR . 'includes/importer.php';
require_once ABZ_CORE_DIR . 'includes/dependencies.php';

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
        // قفل ذرّي (add_option يفشل إن سبقه طلب آخر) حتى لا يعمل استيرادان معاً فتتكرّر الصور
        $locked_at = (int) get_option('abz_import_lock_at');
        if ($locked_at && $locked_at > time() - 5 * MINUTE_IN_SECONDS) {
            return;
        }
        if ($locked_at) {
            delete_option('abz_import_lock_at');
        }
        if (!add_option('abz_import_lock_at', time(), '', false)) {
            return;
        }
        try {
            abz_import_seed(false);
        } finally {
            delete_option('abz_import_lock_at');
        }
        flush_rewrite_rules(false);
    }
}, 20);
