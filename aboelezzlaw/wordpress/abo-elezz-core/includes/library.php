<?php
if (!defined('ABSPATH')) {
    exit;
}

/**
 * المكتبة وقاعدتا الأحكام والتشريعات: ملفات PDF يرفعها المالك من لوحة التحكم.
 *
 * - الملفات تُحفظ في مجلّد محمي من التصفّح (uploads/abz-private/docs) بأسماء عشوائية،
 *   ولا تُسلَّم إلا عبر نقطة واحدة تتحقّق على الخادم من صلاحية العرض أو التحميل.
 * - لكل ملف مستوى للعرض ومستوى للتحميل: للجميع، للمسجّلين، للأعضاء، أو (للتحميل) لا أحد.
 * - العرض داخل الموقع بعارض PDF.js بلا زر تحميل. ملاحظة أمانة: أي ملف يُعرض في المتصفّح
 *   يمكن لمستخدم متمرّس حفظه؛ «العرض فقط» يمنع التحميل المباشر لا النسخ الاحترافي.
 */

function abz_doc_sections(): array
{
    return ['library' => 'المكتبة القانونية', 'judgments' => 'الأحكام القضائية', 'legislation' => 'التشريعات'];
}

function abz_doc_levels(bool $download = false): array
{
    $levels = ['public' => 'للجميع', 'registered' => 'لكل من لديه حساب', 'members' => 'للأعضاء فقط'];
    return $download ? $levels + ['none' => 'غير متاح'] : $levels;
}

add_action('init', function () {
    register_post_type('abz_doc', [
        'labels' => [
            'name' => 'المكتبة والأحكام والتشريعات', 'singular_name' => 'ملف', 'add_new' => 'ارفع ملفاً', 'add_new_item' => 'رفع ملف PDF جديد',
            'edit_item' => 'تعديل الملف', 'all_items' => 'كل الملفات', 'search_items' => 'ابحث في الملفات', 'not_found' => 'لا ملفات بعد',
        ],
        'public' => false,
        'show_ui' => true,
        'show_in_rest' => false, // المحرّر الكلاسيكي: يسمح برفع الملف من صندوق البيانات
        'menu_icon' => 'dashicons-media-document',
        'menu_position' => 5,
        'supports' => ['title', 'editor', 'excerpt'],
        'map_meta_cap' => true,
    ]);
    register_taxonomy('abz_doc_section', 'abz_doc', [
        'labels' => ['name' => 'الأقسام', 'singular_name' => 'القسم'],
        'public' => false,
        'show_ui' => true,
        'show_admin_column' => true,
        'hierarchical' => true,
        'rewrite' => false,
        'meta_box_cb' => false, // يُختار القسم من صندوق بيانات الملف
    ]);
    if (get_option('abz_doc_sections_v') !== '1') {
        foreach (abz_doc_sections() as $slug => $name) {
            if (!term_exists($slug, 'abz_doc_section')) {
                wp_insert_term($name, 'abz_doc_section', ['slug' => $slug]);
            }
        }
        update_option('abz_doc_sections_v', '1');
    }
}, 6);

function abz_doc_dir(): string
{
    $dir = trailingslashit(wp_upload_dir()['basedir']) . 'abz-private/docs';
    if (wp_mkdir_p($dir)) {
        $root = dirname($dir);
        if (!file_exists($root . '/.htaccess')) {
            file_put_contents($root . '/.htaccess', "deny from all\n");
        }
        if (!file_exists($dir . '/index.php')) {
            file_put_contents($dir . '/index.php', "<?php // Silence\n");
        }
    }
    return $dir;
}

function abz_doc_meta(int $id): array
{
    $sections = wp_get_object_terms($id, 'abz_doc_section', ['fields' => 'slugs']);
    return [
        'file' => (string) get_post_meta($id, '_abz_doc_file', true),
        'name' => (string) get_post_meta($id, '_abz_doc_name', true),
        'size' => (int) get_post_meta($id, '_abz_doc_size', true),
        'view' => (string) get_post_meta($id, '_abz_doc_view', true) ?: 'public',
        'download' => (string) get_post_meta($id, '_abz_doc_download', true) ?: 'members',
        'jurisdiction' => (string) get_post_meta($id, '_abz_doc_jurisdiction', true),
        'issuer' => (string) get_post_meta($id, '_abz_doc_issuer', true),
        'number' => (string) get_post_meta($id, '_abz_doc_number', true),
        'year' => (string) get_post_meta($id, '_abz_doc_year', true),
        'section' => is_array($sections) && $sections ? $sections[0] : 'library',
    ];
}

/** هل يحقّ للزائر الحالي هذا المستوى؟ */
function abz_doc_allowed(string $level): bool
{
    switch ($level) {
        case 'public':
            return true;
        case 'registered':
            return is_user_logged_in();
        case 'members':
            return function_exists('abz_is_member') && abz_is_member();
        default:
            return false;
    }
}

function abz_doc_file_url(int $id, string $mode): string
{
    return add_query_arg(['abz_doc_file' => $id, 'mode' => $mode === 'download' ? 'download' : 'view'], home_url('/'));
}

/** رسالة توضّح ما يحتاجه الزائر للوصول */
function abz_doc_requirement(string $level): string
{
    return ['registered' => 'سجّل دخولك أو أنشئ حساباً مجانياً', 'members' => 'متاح لأعضاء المنصّة', 'none' => 'غير متاح للتحميل'][$level] ?? '';
}

/* ── تسليم الملف بعد التحقّق ── */
add_action('template_redirect', function () {
    if (!isset($_GET['abz_doc_file'])) { // phpcs:ignore -- قراءة فقط، والتحقّق أدناه
        return;
    }
    // لا يُخزَّن في ذاكرة LiteSpeed المؤقتة: الصلاحية تختلف من زائر لآخر
    if (!defined('DONOTCACHEPAGE')) {
        define('DONOTCACHEPAGE', true);
    }
    do_action('litespeed_control_set_nocache', 'abz protected document');
    $id = (int) $_GET['abz_doc_file']; // phpcs:ignore
    $mode = ($_GET['mode'] ?? '') === 'download' ? 'download' : 'view'; // phpcs:ignore
    $post = get_post($id);
    if (!$post || $post->post_type !== 'abz_doc' || ($post->post_status !== 'publish' && !current_user_can('edit_post', $id))) {
        status_header(404);
        exit('غير موجود');
    }
    $meta = abz_doc_meta($id);
    if (!abz_doc_allowed($mode === 'download' ? $meta['download'] : $meta['view'])) {
        status_header(403);
        exit('غير مصرّح');
    }
    if (!abz_rate_limit('doc_' . $mode, $mode === 'download' ? 40 : 300, HOUR_IN_SECONDS)) {
        status_header(429);
        exit('محاولات كثيرة. حاول بعد قليل.');
    }
    $path = abz_doc_dir() . '/' . basename($meta['file']);
    if ($meta['file'] === '' || !is_readable($path)) {
        status_header(404);
        exit('الملف غير متاح');
    }
    while (ob_get_level()) {
        ob_end_clean();
    }
    nocache_headers();
    header('Content-Type: application/pdf');
    header('Content-Length: ' . filesize($path));
    header('X-Content-Type-Options: nosniff');
    header('X-Robots-Tag: noindex, nofollow');
    header('Cache-Control: private, no-store, max-age=0');
    $filename = sanitize_file_name($meta['name'] ?: sanitize_title($post->post_title) . '.pdf');
    header('Content-Disposition: ' . ($mode === 'download' ? 'attachment' : 'inline') . '; filename="' . rawurlencode($filename) . '"; filename*=UTF-8\'\'' . rawurlencode($filename));
    if ($mode === 'download') {
        update_post_meta($id, '_abz_doc_downloads', (int) get_post_meta($id, '_abz_doc_downloads', true) + 1);
    }
    readfile($path);
    exit;
}, 0);

/* ── لوحة التحكم: صندوق الملف والإعدادات ── */
add_action('post_edit_form_tag', function ($post) {
    if ($post && $post->post_type === 'abz_doc') {
        echo ' enctype="multipart/form-data"';
    }
});

add_action('add_meta_boxes_abz_doc', function () {
    add_meta_box('abz_doc_box', 'ملف PDF والوصول', 'abz_render_doc_box', 'abz_doc', 'normal', 'high');
});

function abz_render_doc_box(WP_Post $post): void
{
    $m = abz_doc_meta($post->ID);
    wp_nonce_field('abz_doc_save', 'abz_doc_nonce');
    $limit = size_format(wp_max_upload_size());
    echo '<div dir="rtl"><table class="form-table" role="presentation">';
    echo '<tr><th>القسم</th><td><select name="abz_doc[section]">';
    foreach (abz_doc_sections() as $slug => $name) {
        echo '<option value="' . esc_attr($slug) . '"' . selected($m['section'], $slug, false) . '>' . esc_html($name) . '</option>';
    }
    echo '</select></td></tr>';
    echo '<tr><th>ملف PDF</th><td>';
    if ($m['file']) {
        echo '<p>الملف الحالي: <strong>' . esc_html($m['name']) . '</strong> (' . esc_html(size_format($m['size'])) . ') — <a href="' . esc_url(abz_doc_file_url($post->ID, 'view')) . '" target="_blank">معاينة</a></p><p>لاستبداله اختر ملفاً جديداً:</p>';
    }
    echo '<input type="file" name="abz_doc_pdf" accept="application/pdf,.pdf"><p class="description">PDF فقط، حتى ' . esc_html($limit) . '. يُحفظ في مجلّد محمي ولا يُتاح إلا بحسب إعدادات الوصول أدناه. ارفع فقط ما تملك حق نشره.</p></td></tr>';
    foreach (['view' => ['العرض داخل الموقع', false], 'download' => ['التحميل', true]] as $key => [$label, $is_download]) {
        echo '<tr><th>' . esc_html($label) . '</th><td><select name="abz_doc[' . esc_attr($key) . ']">';
        foreach (abz_doc_levels($is_download) as $level => $text) {
            echo '<option value="' . esc_attr($level) . '"' . selected($m[$key], $level, false) . '>' . esc_html($text) . '</option>';
        }
        echo '</select></td></tr>';
    }
    foreach (['jurisdiction' => ['الدولة / النطاق', 'مصر'], 'issuer' => ['الجهة المُصدِرة (المحكمة أو الجهة)', 'محكمة النقض — الدائرة المدنية'], 'number' => ['الرقم', 'الطعن رقم … لسنة … ق'], 'year' => ['السنة', '2024']] as $key => [$label, $placeholder]) {
        echo '<tr><th>' . esc_html($label) . '</th><td><input class="regular-text" name="abz_doc[' . esc_attr($key) . ']" value="' . esc_attr($m[$key]) . '" placeholder="' . esc_attr($placeholder) . '"></td></tr>';
    }
    echo '</table><p class="description">اكتب في «المقتطف» ملخّصاً قصيراً يظهر في القائمة، وفي المحتوى أي شرح أو مبادئ مستخلصة. لا يظهر الملف للزوار قبل «نشر».</p></div>';
}

add_action('save_post_abz_doc', function ($post_id) {
    if ((defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) || wp_is_post_revision($post_id) || !isset($_POST['abz_doc_nonce'])) {
        return;
    }
    if (!wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['abz_doc_nonce'])), 'abz_doc_save') || !current_user_can('edit_post', $post_id)) {
        return;
    }
    $in = (array) wp_unslash($_POST['abz_doc'] ?? []);
    $section = sanitize_key($in['section'] ?? 'library');
    if (isset(abz_doc_sections()[$section])) {
        wp_set_object_terms($post_id, $section, 'abz_doc_section', false);
    }
    $view = sanitize_key($in['view'] ?? 'public');
    $download = sanitize_key($in['download'] ?? 'members');
    update_post_meta($post_id, '_abz_doc_view', isset(abz_doc_levels()[$view]) ? $view : 'public');
    update_post_meta($post_id, '_abz_doc_download', isset(abz_doc_levels(true)[$download]) ? $download : 'members');
    foreach (['jurisdiction', 'issuer', 'number', 'year'] as $key) {
        update_post_meta($post_id, '_abz_doc_' . $key, sanitize_text_field(mb_substr((string) ($in[$key] ?? ''), 0, 160)));
    }

    $file = $_FILES['abz_doc_pdf'] ?? null; // phpcs:ignore -- يُفحص أدناه
    if (!$file || empty($file['tmp_name']) || !empty($file['error']) || !is_uploaded_file($file['tmp_name'])) {
        if ($file && !empty($file['error']) && (int) $file['error'] !== UPLOAD_ERR_NO_FILE) {
            set_transient('abz_doc_notice_' . get_current_user_id(), 'تعذّر رفع الملف (رمز الخطأ ' . (int) $file['error'] . '). قد يكون أكبر من الحد المسموح.', 60);
        }
        return;
    }
    $check = wp_check_filetype_and_ext($file['tmp_name'], (string) $file['name'], ['pdf' => 'application/pdf']);
    $head = (string) file_get_contents($file['tmp_name'], false, null, 0, 5);
    if (($check['type'] ?? '') !== 'application/pdf' || $head !== '%PDF-') {
        set_transient('abz_doc_notice_' . get_current_user_id(), 'الملف المرفوع ليس PDF صالحاً، فلم يُحفظ.', 60);
        return;
    }
    $name = wp_generate_password(24, false) . '.pdf';
    $dir = abz_doc_dir();
    if (!move_uploaded_file($file['tmp_name'], $dir . '/' . $name)) {
        set_transient('abz_doc_notice_' . get_current_user_id(), 'تعذّر حفظ الملف على الخادم.', 60);
        return;
    }
    $old = (string) get_post_meta($post_id, '_abz_doc_file', true);
    if ($old !== '' && is_file($dir . '/' . basename($old))) {
        wp_delete_file($dir . '/' . basename($old));
    }
    update_post_meta($post_id, '_abz_doc_file', $name);
    update_post_meta($post_id, '_abz_doc_name', sanitize_file_name((string) $file['name']));
    update_post_meta($post_id, '_abz_doc_size', (int) $file['size']);
    set_transient('abz_doc_notice_' . get_current_user_id(), 'رُفع الملف وحُفظ بنجاح.', 60);
});

add_action('admin_notices', function () {
    $key = 'abz_doc_notice_' . get_current_user_id();
    if ($notice = get_transient($key)) {
        delete_transient($key);
        echo '<div class="notice notice-info is-dismissible"><p>' . esc_html($notice) . '</p></div>';
    }
});

/* حذف الملف نهائياً يحذف ملف PDF من الخادم */
add_action('before_delete_post', function ($post_id) {
    if (get_post_type($post_id) === 'abz_doc' && ($file = (string) get_post_meta($post_id, '_abz_doc_file', true))) {
        wp_delete_file(abz_doc_dir() . '/' . basename($file));
    }
});

add_filter('manage_abz_doc_posts_columns', fn($c) => array_merge(array_slice($c, 0, 2), ['abz_access' => 'الوصول', 'abz_downloads' => 'التحميلات'], array_slice($c, 2)));
add_action('manage_abz_doc_posts_custom_column', function ($column, $post_id) {
    $m = abz_doc_meta($post_id);
    if ($column === 'abz_access') {
        echo esc_html('العرض: ' . (abz_doc_levels()[$m['view']] ?? '') . ' — التحميل: ' . (abz_doc_levels(true)[$m['download']] ?? '')) . ($m['file'] ? '' : ' <strong style="color:#b32d2e">(بلا ملف)</strong>');
    } elseif ($column === 'abz_downloads') {
        echo (int) get_post_meta($post_id, '_abz_doc_downloads', true);
    }
}, 10, 2);

/** استعلام الملفات المنشورة لقسم، مع البحث والتصفية */
function abz_doc_query(string $section, array $args = []): WP_Query
{
    $query = [
        'post_type' => 'abz_doc',
        'post_status' => 'publish',
        'posts_per_page' => 24,
        'paged' => max(1, (int) ($args['page'] ?? 1)),
        'tax_query' => [['taxonomy' => 'abz_doc_section', 'field' => 'slug', 'terms' => $section]],
        'meta_query' => [['key' => '_abz_doc_file', 'value' => '', 'compare' => '!=']],
    ];
    if (!empty($args['s'])) {
        $query['s'] = $args['s'];
    }
    if (!empty($args['year'])) {
        $query['meta_query'][] = ['key' => '_abz_doc_year', 'value' => $args['year']];
    }
    if (!empty($args['jurisdiction'])) {
        $query['meta_query'][] = ['key' => '_abz_doc_jurisdiction', 'value' => $args['jurisdiction']];
    }
    return new WP_Query($query);
}

/** قيم الفلاتر المتاحة في قسم */
function abz_doc_facets(string $section): array
{
    global $wpdb;
    $term = get_term_by('slug', $section, 'abz_doc_section');
    if (!$term) {
        return ['year' => [], 'jurisdiction' => []];
    }
    $out = [];
    foreach (['year', 'jurisdiction'] as $key) {
        $out[$key] = $wpdb->get_col($wpdb->prepare(
            "SELECT DISTINCT pm.meta_value FROM {$wpdb->postmeta} pm
             INNER JOIN {$wpdb->posts} p ON p.ID = pm.post_id AND p.post_type = 'abz_doc' AND p.post_status = 'publish'
             INNER JOIN {$wpdb->term_relationships} tr ON tr.object_id = p.ID
             INNER JOIN {$wpdb->term_taxonomy} tt ON tt.term_taxonomy_id = tr.term_taxonomy_id AND tt.term_id = %d
             WHERE pm.meta_key = %s AND pm.meta_value <> '' ORDER BY pm.meta_value DESC LIMIT 80",
            $term->term_id,
            '_abz_doc_' . $key
        ));
    }
    return $out;
}
