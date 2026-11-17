<?php
if (!defined('ABSPATH')) {
    exit;
}

/**
 * النائب الإلكتروني: محامٍ ينشر مهمة إجرائية في محافظة وجهة بعينها، فيُخطَر المحامون
 * المسجّلون في تلك المحافظة ويقدّمون عروضهم، فيختار صاحب المهمة عرضاً ويدفع عبر
 * الموقع، ويبقى المبلغ محجوزاً لدى المنصّة حتى يؤكّد تمام الإجراء، ثم يُضاف صافي
 * أتعاب المنفّذ إلى رصيده ويقيّمه صاحب المهمة.
 *
 * - العمولة من الطرفين (نسبتان يحدّدهما المالك): رسوم على صاحب المهمة تُضاف للدفع،
 *   وعمولة تُخصم من أتعاب المنفّذ.
 * - الهويات مستعارة («محامٍ #…»)، ووسائل التواصل في النصوص تُحجب تلقائياً، حتى
 *   يبقى التعامل داخل المنصّة.
 * - كل إجراء يتحقّق على الخادم من الجلسة ورمز nonce والصلاحية وحالة المهمة.
 */

const ABZ_GOVS = ['القاهرة', 'الجيزة', 'الإسكندرية', 'القليوبية', 'الدقهلية', 'الشرقية', 'الغربية', 'المنوفية', 'البحيرة', 'كفر الشيخ', 'دمياط', 'بورسعيد', 'الإسماعيلية', 'السويس', 'الفيوم', 'بني سويف', 'المنيا', 'أسيوط', 'سوهاج', 'قنا', 'الأقصر', 'أسوان', 'البحر الأحمر', 'الوادي الجديد', 'مطروح', 'شمال سيناء', 'جنوب سيناء'];

function abz_delegate_venues(): array
{
    return ['court' => 'محكمة', 'prosecution' => 'نيابة', 'police' => 'قسم أو مركز شرطة', 'notary' => 'شهر عقاري أو توثيق', 'registry' => 'سجل تجاري أو جهة استثمار', 'government' => 'مصلحة أو جهة حكومية', 'other' => 'جهة أخرى'];
}

function abz_delegate_types(): array
{
    return ['submit' => 'تقديم طلب أو عريضة', 'copy' => 'الاطلاع على ملف أو تصويره', 'certificate' => 'استخراج صورة رسمية أو شهادة', 'session' => 'حضور جلسة بالإنابة', 'follow' => 'متابعة إجراء أو قضية', 'notice' => 'قيد أو إعلان أو تسليم', 'other' => 'إجراء آخر'];
}

function abz_delegate_statuses(): array
{
    return ['open' => 'تستقبل العروض', 'awaiting_payment' => 'بانتظار الدفع', 'in_progress' => 'قيد التنفيذ', 'delivered' => 'سُلِّمت — بانتظار تأكيدك', 'completed' => 'مكتملة', 'disputed' => 'نزاع لدى الإدارة', 'cancelled' => 'ملغاة'];
}

function abz_delegate_settings(): array
{
    $defaults = ['buyer_fee' => 5, 'seller_fee' => 20, 'auto_days' => 3, 'min_amount' => 100, 'min_payout' => 200];
    $saved = get_option('abz_delegate', []);
    return array_merge($defaults, is_array($saved) ? $saved : []);
}

/** المبالغ: [amount, buyer_fee, buyer_total, seller_fee, payout] */
function abz_delegate_fees(float $amount): array
{
    $s = abz_delegate_settings();
    $buyer_fee = round($amount * (float) $s['buyer_fee'] / 100, 2);
    $seller_fee = round($amount * (float) $s['seller_fee'] / 100, 2);
    return ['amount' => $amount, 'buyer_fee' => $buyer_fee, 'buyer_total' => $amount + $buyer_fee, 'seller_fee' => $seller_fee, 'payout' => $amount - $seller_fee];
}

function abz_delegate_can(int $user_id = 0): bool
{
    $user_id = $user_id ?: get_current_user_id();
    return $user_id && function_exists('abz_user_is') && (abz_user_is('lawyer', $user_id) || abz_user_is('law-firm', $user_id) || abz_user_is('partner', $user_id));
}

/** اسم مستعار ثابت لا يكشف الهوية */
function abz_alias(int $user_id): string
{
    return 'محامٍ #' . strtoupper(base_convert((string) ($user_id * 7919 + 104729), 10, 36));
}

function abz_pct(float $value): string
{
    return number_format_i18n($value, $value == floor($value) ? 0 : 1) . '%';
}

function abz_money(float $amount): string
{
    return number_format_i18n($amount, $amount == floor($amount) ? 0 : 2) . ' ج.م';
}

/**
 * يحجب وسائل التواصل من النصّ (أرقام الهواتف، البريد، الروابط، المعرّفات)
 * ويرجع [النصّ المحجوب، هل حُجب شيء].
 */
function abz_mask_contacts(string $text): array
{
    $mask = '[وسيلة تواصل محجوبة]';
    $normalized = strtr($text, ['٠' => '0', '١' => '1', '٢' => '2', '٣' => '3', '٤' => '4', '٥' => '5', '٦' => '6', '٧' => '7', '٨' => '8', '٩' => '9', '۰' => '0', '۱' => '1', '۲' => '2', '۳' => '3', '۴' => '4', '۵' => '5', '۶' => '6', '۷' => '7', '۸' => '8', '۹' => '9']);
    $patterns = [
        '/[\w.+\-]+@[\w\-]+(\.[\w\-]+)+/u',
        '/(https?:\/\/|www\.)\S+/iu',
        '/\b(wa\.me|t\.me|telegram\.me|fb\.com|facebook\.com|instagram\.com|tiktok\.com|x\.com|twitter\.com|linkedin\.com|snapchat\.com)\S*/iu',
        '/(?<![\w])@[A-Za-z0-9_.]{3,}/u',
        '/\+?\d(?:[\s\-.()\/]*\d){9,}/u',
    ];
    $masked = false;
    foreach ($patterns as $pattern) {
        $normalized = preg_replace_callback($pattern, function () use (&$masked, $mask) {
            $masked = true;
            return $mask;
        }, $normalized);
    }
    return [$masked ? $normalized : $text, $masked];
}

/** يحجب ويسجّل المحاولة ويُخطر المالك عند التكرار */
function abz_clean_text(string $text, int $max = 3000): string
{
    $text = trim(sanitize_textarea_field(mb_substr($text, 0, $max)));
    [$clean, $masked] = abz_mask_contacts($text);
    if ($masked && ($uid = get_current_user_id())) {
        $strikes = (int) get_user_meta($uid, 'abz_contact_strikes', true) + 1;
        update_user_meta($uid, 'abz_contact_strikes', $strikes);
        if ($strikes === 3 || $strikes % 10 === 0) {
            abz_notify('delegate', 'محاولات متكررة لتبادل وسائل التواصل', ['المستخدم' => abz_alias($uid), 'عدد المحاولات' => $strikes], admin_url('user-edit.php?user_id=' . $uid));
        }
    }
    return $clean;
}

/* ───────────── أنواع المحتوى ───────────── */

add_action('init', function () {
    register_post_type('abz_task', [
        'labels' => ['name' => 'النائب الإلكتروني', 'singular_name' => 'مهمة', 'all_items' => 'كل المهام', 'edit_item' => 'المهمة'],
        'public' => false,
        'show_ui' => true,
        'show_in_menu' => true,
        'menu_icon' => 'dashicons-networking',
        'menu_position' => 4,
        'supports' => ['title', 'editor', 'author'],
        'capability_type' => 'post',
        'capabilities' => ['create_posts' => 'do_not_allow'],
        'map_meta_cap' => true,
    ]);
    foreach (['abz_offer' => 'عروض', 'abz_ledger' => 'حركات الأرصدة'] as $type => $label) {
        register_post_type($type, ['label' => $label, 'public' => false, 'show_ui' => false, 'supports' => ['title', 'author']]);
    }
}, 6);

function abz_delegate_url(string $view = '', array $args = []): string
{
    $url = home_url('/e-delegate/');
    return $view === '' ? $url : add_query_arg(['view' => $view] + $args, $url);
}

function abz_task_url(int $task_id): string
{
    return abz_delegate_url('task', ['id' => $task_id]);
}

function abz_task_get(int $task_id): ?WP_Post
{
    $post = get_post($task_id);
    return $post && $post->post_type === 'abz_task' ? $post : null;
}

function abz_task_status(int $task_id): string
{
    return (string) get_post_meta($task_id, 'abz_status', true) ?: 'open';
}

function abz_task_log(int $task_id, string $text): void
{
    $log = abz_list(get_post_meta($task_id, 'abz_log', true));
    $log[] = [current_time('mysql'), $text];
    update_post_meta($task_id, 'abz_log', array_slice($log, -40));
}

function abz_task_set_status(int $task_id, string $status, string $log = ''): void
{
    update_post_meta($task_id, 'abz_status', $status);
    update_post_meta($task_id, 'abz_status_at', time());
    abz_task_log($task_id, $log ?: 'الحالة: ' . (abz_delegate_statuses()[$status] ?? $status));
}

/** إشعار داخل الموقع + بريد للمستخدم */
function abz_delegate_notice(int $user_id, string $text, string $url, bool $email = true): void
{
    $notices = array_filter(abz_list(get_user_meta($user_id, 'abz_notices', true)), 'is_array');
    array_unshift($notices, ['t' => time(), 'text' => $text, 'url' => $url, 'read' => 0]);
    update_user_meta($user_id, 'abz_notices', array_slice($notices, 0, 50));
    $user = get_userdata($user_id);
    if ($email && $user) {
        wp_mail($user->user_email, '[النائب الإلكتروني] ' . $text, $text . "\n\n" . $url . "\n\n— " . get_bloginfo('name'), ['Content-Type: text/plain; charset=UTF-8']);
    }
}

function abz_unread_notices(int $user_id): int
{
    return count(array_filter(abz_list(get_user_meta($user_id, 'abz_notices', true)), fn($n) => is_array($n) && empty($n['read'])));
}

/** المحامون المسجّلون في محافظة (عدا صاحب المهمة) */
function abz_delegate_lawyers_in(string $gov, int $exclude = 0): array
{
    $users = get_users([
        'role__in' => ['abz_lawyer', 'abz_law_firm', 'abz_partner'],
        'meta_query' => [['key' => 'abz_govs', 'value' => '"' . $gov . '"', 'compare' => 'LIKE']],
        'exclude' => $exclude ? [$exclude] : [],
        'number' => 300,
        'fields' => 'ID',
    ]);
    return array_map('intval', $users);
}

function abz_user_rating(int $user_id): array
{
    $tasks = get_posts(['post_type' => 'abz_task', 'numberposts' => 500, 'fields' => 'ids', 'meta_query' => [['key' => 'abz_executor', 'value' => $user_id], ['key' => 'abz_status', 'value' => 'completed']]]);
    $ratings = array_filter(array_map(fn($id) => (int) get_post_meta($id, 'abz_rating', true), $tasks));
    return ['avg' => $ratings ? round(array_sum($ratings) / count($ratings), 1) : 0, 'count' => count($ratings), 'done' => count($tasks)];
}

/* ───────────── الأرصدة ───────────── */

function abz_ledger_add(int $user_id, string $type, float $amount, string $status, int $task_id, string $note): int
{
    $id = wp_insert_post(['post_type' => 'abz_ledger', 'post_status' => 'private', 'post_author' => $user_id, 'post_title' => $note], true);
    if (is_wp_error($id)) {
        return 0;
    }
    update_post_meta($id, 'abz_type', $type);
    update_post_meta($id, 'abz_amount', round($amount, 2));
    update_post_meta($id, 'abz_status', $status);
    update_post_meta($id, 'abz_task', $task_id);
    return (int) $id;
}

function abz_wallet(int $user_id): array
{
    $entries = get_posts(['post_type' => 'abz_ledger', 'post_status' => 'private', 'author' => $user_id, 'numberposts' => 1000, 'orderby' => 'date', 'order' => 'DESC']);
    $w = ['available' => 0.0, 'requested' => 0.0, 'paid' => 0.0, 'earned' => 0.0, 'held' => 0.0, 'entries' => $entries];
    foreach ($entries as $entry) {
        $amount = (float) get_post_meta($entry->ID, 'abz_amount', true);
        $type = (string) get_post_meta($entry->ID, 'abz_type', true);
        $status = (string) get_post_meta($entry->ID, 'abz_status', true);
        if ($type === 'earning') {
            $w['earned'] += $amount;
            $w['available'] += $amount;
        } elseif ($type === 'payout' && $status !== 'rejected') {
            $w['available'] += $amount; // سالب
            $w[$status === 'paid' ? 'paid' : 'requested'] += -$amount;
        }
    }
    $held = get_posts(['post_type' => 'abz_task', 'numberposts' => 200, 'fields' => 'ids', 'meta_query' => [['key' => 'abz_executor', 'value' => $user_id], ['key' => 'abz_status', 'value' => ['in_progress', 'delivered', 'disputed'], 'compare' => 'IN']]]);
    foreach ($held as $task_id) {
        $w['held'] += (float) get_post_meta($task_id, 'abz_payout', true);
    }
    return $w;
}

/* ───────────── منتج الدفع المخفي ───────────── */

function abz_delegate_product_id(): int
{
    $id = (int) get_option('abz_delegate_product');
    if ($id && get_post_status($id) === 'publish') {
        return $id;
    }
    if (!class_exists('WC_Product_Simple')) {
        return 0;
    }
    $product = new WC_Product_Simple();
    $product->set_name('خدمة النائب الإلكتروني');
    $product->set_slug('abz-e-delegate-service');
    $product->set_status('publish');
    $product->set_catalog_visibility('hidden');
    $product->set_virtual(true);
    $product->set_regular_price('0');
    $product->set_reviews_allowed(false);
    $id = $product->save();
    update_option('abz_delegate_product', $id, false);
    return (int) $id;
}

// منتج داخلي: لا يُضاف إلى السلة يدوياً ولا تُعرض صفحته — يُستخدم فقط في طلبات الدفع التي تنشئها المنصّة
add_filter('woocommerce_add_to_cart_validation', function ($valid, $product_id) {
    if ((int) $product_id === (int) get_option('abz_delegate_product')) {
        wc_add_notice('هذه الخدمة تُطلب من صفحة النائب الإلكتروني فقط.', 'error');
        return false;
    }
    return $valid;
}, 10, 2);
add_action('template_redirect', function () {
    if (is_singular('product') && (int) get_queried_object_id() === (int) get_option('abz_delegate_product')) {
        wp_safe_redirect(abz_delegate_url(), 302);
        exit;
    }
});

/* ───────────── الإجراءات ───────────── */

function abz_delegate_guard(string $action, bool $eligible = true): int
{
    if (!is_user_logged_in()) {
        wp_safe_redirect(wp_login_url(abz_delegate_url()));
        exit;
    }
    check_admin_referer($action);
    $uid = get_current_user_id();
    if ($eligible && !abz_delegate_can($uid)) {
        wp_die('النائب الإلكتروني متاح للمحامين ومكاتب المحاماة وشركاء المؤسسة بعد اعتماد حساباتهم.', 403);
    }
    return $uid;
}

function abz_delegate_back(string $url, string $msg = ''): void
{
    wp_safe_redirect($msg !== '' ? add_query_arg('msg', $msg, $url) : $url);
    exit;
}

add_action('admin_post_abz_delegate_profile', function () {
    $uid = abz_delegate_guard('abz_delegate_profile');
    $govs = array_values(array_intersect(ABZ_GOVS, array_map('sanitize_text_field', (array) wp_unslash($_POST['govs'] ?? []))));
    update_user_meta($uid, 'abz_govs', $govs);
    update_user_meta($uid, 'abz_delegate_bio', abz_clean_text((string) wp_unslash($_POST['bio'] ?? ''), 500));
    abz_delegate_back(abz_delegate_url('settings'), 'saved');
});

add_action('admin_post_abz_task_create', function () {
    $uid = abz_delegate_guard('abz_task_create');
    if (!abz_rate_limit('task_create', 15, DAY_IN_SECONDS)) {
        abz_delegate_back(abz_delegate_url('new'), 'limit');
    }
    $in = wp_unslash($_POST);
    $gov = sanitize_text_field($in['gov'] ?? '');
    $venue = sanitize_key($in['venue'] ?? '');
    $type = sanitize_key($in['type'] ?? '');
    $venue_name = sanitize_text_field(mb_substr((string) ($in['venue_name'] ?? ''), 0, 120));
    $details = abz_clean_text((string) ($in['details'] ?? ''));
    $deadline = sanitize_text_field($in['deadline'] ?? '');
    $budget = max(0, (float) ($in['budget'] ?? 0));
    if (!in_array($gov, ABZ_GOVS, true) || !isset(abz_delegate_venues()[$venue]) || !isset(abz_delegate_types()[$type]) || $venue_name === '' || mb_strlen($details) < 20 || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $deadline) || empty($in['agree'])) {
        abz_delegate_back(abz_delegate_url('new'), 'fields');
    }
    [$venue_name] = abz_mask_contacts($venue_name);
    $title = abz_delegate_types()[$type] . ' — ' . $venue_name . ' (' . $gov . ')';
    $task_id = wp_insert_post(['post_type' => 'abz_task', 'post_status' => 'publish', 'post_author' => $uid, 'post_title' => $title, 'post_content' => $details], true);
    if (is_wp_error($task_id)) {
        abz_delegate_back(abz_delegate_url('new'), 'error');
    }
    foreach (['abz_gov' => $gov, 'abz_venue' => $venue, 'abz_venue_name' => $venue_name, 'abz_type' => $type, 'abz_deadline' => $deadline, 'abz_budget' => $budget] as $key => $value) {
        update_post_meta($task_id, $key, $value);
    }
    abz_task_set_status($task_id, 'open', 'نُشرت المهمة');
    $lawyers = abz_delegate_lawyers_in($gov, $uid);
    foreach ($lawyers as $lawyer) {
        abz_delegate_notice($lawyer, 'مهمة جديدة في ' . $gov . ': ' . abz_delegate_types()[$type], abz_task_url($task_id));
    }
    update_post_meta($task_id, 'abz_notified', count($lawyers));
    abz_notify('delegate', 'مهمة جديدة على النائب الإلكتروني', ['المهمة' => $title, 'أُخطر' => count($lawyers) . ' محامياً'], admin_url('post.php?post=' . $task_id . '&action=edit'));
    abz_delegate_back(abz_task_url($task_id), 'posted');
});

add_action('admin_post_abz_offer_create', function () {
    $uid = abz_delegate_guard('abz_offer_create');
    $task_id = (int) ($_POST['task'] ?? 0);
    $task = abz_task_get($task_id);
    $s = abz_delegate_settings();
    $amount = round((float) ($_POST['amount'] ?? 0), 2);
    $days = max(1, min(60, (int) ($_POST['days'] ?? 1)));
    $note = abz_clean_text((string) wp_unslash($_POST['note'] ?? ''), 1000);
    if (!$task || (int) $task->post_author === $uid || abz_task_status($task_id) !== 'open') {
        abz_delegate_back(abz_task_url($task_id), 'closed');
    }
    if ($amount < (float) $s['min_amount'] || empty($_POST['agree'])) {
        abz_delegate_back(abz_task_url($task_id), 'amount');
    }
    $existing = get_posts(['post_type' => 'abz_offer', 'post_parent' => $task_id, 'author' => $uid, 'numberposts' => 1, 'post_status' => 'publish']);
    $offer_id = $existing ? $existing[0]->ID : wp_insert_post(['post_type' => 'abz_offer', 'post_status' => 'publish', 'post_parent' => $task_id, 'post_author' => $uid, 'post_title' => 'عرض على المهمة #' . $task_id]);
    update_post_meta($offer_id, 'abz_amount', $amount);
    update_post_meta($offer_id, 'abz_days', $days);
    update_post_meta($offer_id, 'abz_note', $note);
    update_post_meta($offer_id, 'abz_state', 'pending');
    abz_delegate_notice((int) $task->post_author, ($existing ? 'عرض مُحدَّث' : 'عرض جديد') . ' على مهمتك: ' . abz_money($amount), abz_task_url($task_id));
    abz_notify('delegate', 'عرض جديد على النائب الإلكتروني', ['المهمة' => $task->post_title, 'المبلغ' => abz_money($amount)], admin_url('post.php?post=' . $task_id . '&action=edit'));
    abz_delegate_back(abz_task_url($task_id), 'offered');
});

add_action('admin_post_abz_offer_withdraw', function () {
    $uid = abz_delegate_guard('abz_offer_withdraw');
    $offer = get_post((int) ($_POST['offer'] ?? 0));
    if ($offer && $offer->post_type === 'abz_offer' && (int) $offer->post_author === $uid && get_post_meta($offer->ID, 'abz_state', true) === 'pending' && abz_task_status($offer->post_parent) === 'open') {
        update_post_meta($offer->ID, 'abz_state', 'withdrawn');
    }
    abz_delegate_back(abz_task_url((int) ($offer->post_parent ?? 0)), 'withdrawn');
});

add_action('admin_post_abz_offer_accept', function () {
    $uid = abz_delegate_guard('abz_offer_accept');
    $offer = get_post((int) ($_POST['offer'] ?? 0));
    $task = $offer ? abz_task_get((int) $offer->post_parent) : null;
    if (!$offer || $offer->post_type !== 'abz_offer' || !$task || (int) $task->post_author !== $uid || !in_array(abz_task_status($task->ID), ['open', 'awaiting_payment'], true) || get_post_meta($offer->ID, 'abz_state', true) !== 'pending') {
        abz_delegate_back(abz_task_url((int) ($task->ID ?? 0)), 'invalid');
    }
    if (!function_exists('wc_create_order') || !abz_delegate_product_id()) {
        abz_delegate_back(abz_task_url($task->ID), 'payments');
    }
    // طلب دفع سابق لم يُدفع يُلغى قبل إنشاء الجديد
    $old_order = (int) get_post_meta($task->ID, 'abz_order', true);
    if ($old_order && ($old = wc_get_order($old_order)) && $old->has_status(['pending', 'failed'])) {
        $old->update_status('cancelled', 'استُبدل بطلب دفع لعرض آخر.');
    }
    $fees = abz_delegate_fees((float) get_post_meta($offer->ID, 'abz_amount', true));
    $user = wp_get_current_user();
    $order = wc_create_order(['customer_id' => $uid, 'created_via' => 'abz_delegate']);
    $order->add_product(wc_get_product(abz_delegate_product_id()), 1, [
        'name' => 'النائب الإلكتروني — مهمة #' . $task->ID . ' (أتعاب ' . abz_money($fees['amount']) . ' + رسوم المنصّة ' . abz_money($fees['buyer_fee']) . ')',
        'subtotal' => $fees['buyer_total'],
        'total' => $fees['buyer_total'],
    ]);
    $order->set_address([
        'first_name' => $user->first_name ?: $user->display_name,
        'last_name' => $user->last_name ?: 'NA',
        'email' => $user->user_email,
        'phone' => (string) get_user_meta($uid, 'billing_phone', true) ?: 'NA',
        'country' => 'EG',
        'city' => (string) get_post_meta($task->ID, 'abz_gov', true),
        'address_1' => 'NA',
    ], 'billing');
    $order->update_meta_data('_abz_task_id', $task->ID);
    $order->update_meta_data('_abz_offer_id', $offer->ID);
    $order->calculate_totals(false);
    $order->set_status('pending');
    $order->save();
    update_post_meta($task->ID, 'abz_order', $order->get_id());
    update_post_meta($task->ID, 'abz_pending_offer', $offer->ID);
    abz_task_set_status($task->ID, 'awaiting_payment', 'اختير عرض ' . abz_alias((int) $offer->post_author) . ' — بانتظار الدفع');
    wp_safe_redirect($order->get_checkout_payment_url());
    exit;
});

/** تأكيد الدفع: المبلغ محجوز والمهمة تبدأ */
function abz_delegate_paid($order_id): void
{
    $order = wc_get_order($order_id);
    $task_id = $order ? (int) $order->get_meta('_abz_task_id') : 0;
    if (!$task_id || $order->get_meta('_abz_task_started') || !$order->is_paid()) {
        return;
    }
    $offer = get_post((int) $order->get_meta('_abz_offer_id'));
    $task = abz_task_get($task_id);
    if (!$task || !$offer) {
        return;
    }
    // دفعة لطلب لم يعد هو طلب المهمة الحالي، أو لمهمة بدأت بالفعل: لا تُعتمد، وتُحال للإدارة لردّها
    if ((int) get_post_meta($task_id, 'abz_order', true) !== (int) $order->get_id() || !in_array(abz_task_status($task_id), ['open', 'awaiting_payment'], true)) {
        $order->update_meta_data('_abz_task_started', 'conflict');
        $order->add_order_note('تنبيه: هذه الدفعة لا تخص الطلب الحالي للمهمة #' . $task_id . ' أو أن المهمة بدأت بدفعة أخرى. راجعها ونفّذ الاسترداد من زر «استرداد».');
        $order->save();
        abz_notify('delegate', 'دفعة مكرّرة أو قديمة على النائب الإلكتروني — تحتاج استرداداً', ['المهمة' => $task->post_title, 'الطلب' => '#' . $order->get_id()], $order->get_edit_order_url());
        return;
    }
    $fees = abz_delegate_fees((float) get_post_meta($offer->ID, 'abz_amount', true));
    $executor = (int) $offer->post_author;
    update_post_meta($task_id, 'abz_executor', $executor);
    update_post_meta($task_id, 'abz_offer', $offer->ID);
    foreach (['abz_amount' => $fees['amount'], 'abz_buyer_fee' => $fees['buyer_fee'], 'abz_seller_fee' => $fees['seller_fee'], 'abz_payout' => $fees['payout']] as $key => $value) {
        update_post_meta($task_id, $key, $value);
    }
    update_post_meta($offer->ID, 'abz_state', 'accepted');
    foreach (get_posts(['post_type' => 'abz_offer', 'post_parent' => $task_id, 'numberposts' => 200, 'exclude' => [$offer->ID]]) as $other) {
        if (get_post_meta($other->ID, 'abz_state', true) === 'pending') {
            update_post_meta($other->ID, 'abz_state', 'rejected');
        }
    }
    $order->update_meta_data('_abz_task_started', 1);
    $order->save();
    abz_task_set_status($task_id, 'in_progress', 'تم الدفع — المبلغ محجوز لدى المنصّة حتى تأكيد التنفيذ');
    abz_delegate_notice($executor, 'تم قبول عرضك وبدأت المهمة: ' . $task->post_title, abz_task_url($task_id));
    abz_delegate_notice((int) $task->post_author, 'تم الدفع وبدأ التنفيذ: ' . $task->post_title, abz_task_url($task_id), false);
    abz_notify('delegate', 'دفعة محجوزة لمهمة على النائب الإلكتروني', ['المهمة' => $task->post_title, 'المدفوع' => abz_money($fees['buyer_total']), 'عمولة المنصّة' => abz_money($fees['buyer_fee'] + $fees['seller_fee'])], $order->get_edit_order_url());
}
add_action('woocommerce_payment_complete', 'abz_delegate_paid');
add_action('woocommerce_order_status_processing', 'abz_delegate_paid');
add_action('woocommerce_order_status_completed', 'abz_delegate_paid');

/** صاحب المهمة أو المنفّذ — وإلا يُرفض */
function abz_task_participant(int $task_id, int $uid): string
{
    $task = abz_task_get($task_id);
    if (!$task) {
        return '';
    }
    if ((int) $task->post_author === $uid) {
        return 'owner';
    }
    if ((int) get_post_meta($task_id, 'abz_executor', true) === $uid) {
        return 'executor';
    }
    return user_can($uid, 'manage_options') ? 'admin' : '';
}

add_action('admin_post_abz_task_message', function () {
    $uid = abz_delegate_guard('abz_task_message', false);
    $task_id = (int) ($_POST['task'] ?? 0);
    $role = abz_task_participant($task_id, $uid);
    if (!$role || !in_array(abz_task_status($task_id), ['in_progress', 'delivered', 'disputed'], true)) {
        abz_delegate_back(abz_task_url($task_id), 'invalid');
    }
    $text = abz_clean_text((string) wp_unslash($_POST['text'] ?? ''), 2000);
    $file = abz_task_store_file($task_id);
    if ($text === '' && !$file) {
        abz_delegate_back(abz_task_url($task_id) . '#messages');
    }
    abz_task_add_message($task_id, $uid, $text, $file);
    $task = abz_task_get($task_id);
    $other = $role === 'owner' ? (int) get_post_meta($task_id, 'abz_executor', true) : (int) $task->post_author;
    abz_delegate_notice($other, 'رسالة جديدة في المهمة: ' . $task->post_title, abz_task_url($task_id) . '#messages');
    abz_delegate_back(abz_task_url($task_id) . '#messages');
});

function abz_task_add_message(int $task_id, int $uid, string $text, ?array $file): void
{
    $comment_id = wp_insert_comment([
        'comment_post_ID' => $task_id,
        'user_id' => $uid,
        'comment_author' => abz_alias($uid),
        'comment_content' => $text !== '' ? $text : '(مرفق)',
        'comment_type' => 'abz_msg',
        'comment_approved' => 1,
    ]);
    if ($comment_id && $file) {
        update_comment_meta($comment_id, 'abz_file', $file);
    }
}

/** مرفق رسالة: PDF أو صورة حتى 8 ميجابايت، في مجلّد محمي */
function abz_task_store_file(int $task_id): ?array
{
    $file = $_FILES['file'] ?? null; // phpcs:ignore -- يُفحص أدناه
    if (!$file || empty($file['tmp_name']) || !empty($file['error'])) {
        return null;
    }
    $check = wp_check_filetype_and_ext($file['tmp_name'], (string) $file['name']);
    $allowed = ['pdf' => 'application/pdf', 'jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'png' => 'image/png'];
    if ((int) $file['size'] > 8 * MB_IN_BYTES || !in_array($check['type'] ?? '', $allowed, true)) {
        return null;
    }
    $dir = trailingslashit(wp_upload_dir()['basedir']) . 'abz-private/tasks/' . $task_id;
    if (!wp_mkdir_p($dir)) {
        return null;
    }
    $root = dirname($dir, 2);
    if (!file_exists($root . '/.htaccess')) {
        file_put_contents($root . '/.htaccess', "deny from all\n");
    }
    $name = wp_generate_password(20, false) . '.' . $check['ext'];
    if (!move_uploaded_file($file['tmp_name'], $dir . '/' . $name)) {
        return null;
    }
    return ['path' => 'tasks/' . $task_id . '/' . $name, 'name' => sanitize_file_name((string) $file['name']), 'type' => $check['type']];
}

add_action('admin_post_abz_task_file', function () {
    $uid = get_current_user_id();
    $comment = get_comment((int) ($_GET['msg'] ?? 0));
    if (!$uid || !$comment || $comment->comment_type !== 'abz_msg' || !wp_verify_nonce(sanitize_text_field(wp_unslash($_GET['_wpnonce'] ?? '')), 'abz_task_file_' . $comment->comment_ID) || !abz_task_participant((int) $comment->comment_post_ID, $uid)) {
        wp_die('غير مصرّح.', 403);
    }
    $file = (array) get_comment_meta($comment->comment_ID, 'abz_file', true);
    $path = trailingslashit(wp_upload_dir()['basedir']) . 'abz-private/' . ($file['path'] ?? '');
    if (empty($file['path']) || str_contains($file['path'], '..') || !is_readable($path)) {
        wp_die('الملف غير موجود.', 404);
    }
    nocache_headers();
    header('Content-Type: ' . $file['type']);
    header('Content-Disposition: attachment; filename="' . rawurlencode($file['name']) . '"');
    header('X-Content-Type-Options: nosniff');
    readfile($path);
    exit;
});

add_action('admin_post_abz_task_deliver', function () {
    $uid = abz_delegate_guard('abz_task_deliver', false);
    $task_id = (int) ($_POST['task'] ?? 0);
    if (abz_task_participant($task_id, $uid) !== 'executor' || abz_task_status($task_id) !== 'in_progress') {
        abz_delegate_back(abz_task_url($task_id), 'invalid');
    }
    $note = abz_clean_text((string) wp_unslash($_POST['note'] ?? ''), 2000);
    $file = abz_task_store_file($task_id);
    abz_task_add_message($task_id, $uid, '✅ تسليم: ' . ($note ?: 'تم تنفيذ الإجراء.'), $file);
    update_post_meta($task_id, 'abz_delivered_at', time());
    abz_task_set_status($task_id, 'delivered', 'سلّم المنفّذ المهمة');
    $task = abz_task_get($task_id);
    $days = (int) abz_delegate_settings()['auto_days'];
    abz_delegate_notice((int) $task->post_author, 'تم تسليم مهمتك — راجعها وأكّد خلال ' . $days . ' أيام وإلا تُعتمد تلقائياً', abz_task_url($task_id));
    abz_delegate_back(abz_task_url($task_id), 'delivered');
});

/** إتمام المهمة: يُضاف صافي الأتعاب لرصيد المنفّذ */
function abz_task_complete(int $task_id, string $how): void
{
    if (!in_array(abz_task_status($task_id), ['in_progress', 'delivered', 'disputed'], true)) {
        return;
    }
    $executor = (int) get_post_meta($task_id, 'abz_executor', true);
    $payout = (float) get_post_meta($task_id, 'abz_payout', true);
    abz_ledger_add($executor, 'earning', $payout, 'available', $task_id, 'أتعاب المهمة #' . $task_id . ' بعد عمولة المنصّة');
    abz_task_set_status($task_id, 'completed', $how);
    $order = function_exists('wc_get_order') ? wc_get_order((int) get_post_meta($task_id, 'abz_order', true)) : null;
    if ($order && !$order->has_status('completed')) {
        $order->update_status('completed', 'اكتملت مهمة النائب الإلكتروني #' . $task_id);
    }
    $task = abz_task_get($task_id);
    abz_delegate_notice($executor, 'اكتملت المهمة وأُضيف ' . abz_money($payout) . ' إلى رصيدك', abz_delegate_url('wallet'));
    abz_notify('delegate', 'اكتملت مهمة على النائب الإلكتروني', ['المهمة' => $task->post_title, 'صافي المنفّذ' => abz_money($payout)], admin_url('post.php?post=' . $task_id . '&action=edit'));
}

add_action('admin_post_abz_task_complete', function () {
    $uid = abz_delegate_guard('abz_task_complete', false);
    $task_id = (int) ($_POST['task'] ?? 0);
    if (abz_task_participant($task_id, $uid) !== 'owner' || !in_array(abz_task_status($task_id), ['in_progress', 'delivered'], true)) {
        abz_delegate_back(abz_task_url($task_id), 'invalid');
    }
    abz_task_complete($task_id, 'أكّد صاحب المهمة تمام التنفيذ');
    abz_delegate_back(abz_task_url($task_id) . '#rate', 'completed');
});

add_action('admin_post_abz_task_rate', function () {
    $uid = abz_delegate_guard('abz_task_rate', false);
    $task_id = (int) ($_POST['task'] ?? 0);
    $rating = max(1, min(5, (int) ($_POST['rating'] ?? 0)));
    if (abz_task_participant($task_id, $uid) !== 'owner' || abz_task_status($task_id) !== 'completed' || get_post_meta($task_id, 'abz_rating', true)) {
        abz_delegate_back(abz_task_url($task_id), 'invalid');
    }
    update_post_meta($task_id, 'abz_rating', $rating);
    update_post_meta($task_id, 'abz_review', abz_clean_text((string) wp_unslash($_POST['review'] ?? ''), 600));
    abz_delegate_notice((int) get_post_meta($task_id, 'abz_executor', true), 'حصلت على تقييم ' . $rating . ' من 5', abz_task_url($task_id), false);
    abz_delegate_back(abz_task_url($task_id), 'rated');
});

add_action('admin_post_abz_task_dispute', function () {
    $uid = abz_delegate_guard('abz_task_dispute', false);
    $task_id = (int) ($_POST['task'] ?? 0);
    $role = abz_task_participant($task_id, $uid);
    if (!in_array($role, ['owner', 'executor'], true) || !in_array(abz_task_status($task_id), ['in_progress', 'delivered'], true)) {
        abz_delegate_back(abz_task_url($task_id), 'invalid');
    }
    $reason = abz_clean_text((string) wp_unslash($_POST['reason'] ?? ''), 1500);
    abz_task_add_message($task_id, $uid, '⚠️ فُتح نزاع: ' . $reason, null);
    abz_task_set_status($task_id, 'disputed', 'فُتح نزاع من ' . ($role === 'owner' ? 'صاحب المهمة' : 'المنفّذ'));
    abz_notify('delegate', 'نزاع جديد على النائب الإلكتروني', ['المهمة' => get_the_title($task_id), '_detail' => $reason], admin_url('admin.php?page=abz-delegate-admin'));
    abz_delegate_back(abz_task_url($task_id), 'disputed');
});

add_action('admin_post_abz_task_cancel', function () {
    $uid = abz_delegate_guard('abz_task_cancel', false);
    $task_id = (int) ($_POST['task'] ?? 0);
    if (abz_task_participant($task_id, $uid) !== 'owner' || !in_array(abz_task_status($task_id), ['open', 'awaiting_payment'], true)) {
        abz_delegate_back(abz_task_url($task_id), 'invalid');
    }
    $order = function_exists('wc_get_order') ? wc_get_order((int) get_post_meta($task_id, 'abz_order', true)) : null;
    if ($order && $order->has_status(['pending', 'failed'])) {
        $order->update_status('cancelled', 'ألغى صاحب المهمة مهمته.');
    }
    abz_task_set_status($task_id, 'cancelled', 'ألغى صاحب المهمة مهمته');
    abz_delegate_back(abz_delegate_url('mine'), 'cancelled');
});

add_action('admin_post_abz_payout_request', function () {
    $uid = abz_delegate_guard('abz_payout_request');
    $wallet = abz_wallet($uid);
    $min = (float) abz_delegate_settings()['min_payout'];
    $amount = round(min((float) ($_POST['amount'] ?? 0), $wallet['available']), 2);
    $method = sanitize_text_field(mb_substr((string) wp_unslash($_POST['method'] ?? ''), 0, 200));
    if ($amount < $min || $method === '') {
        abz_delegate_back(abz_delegate_url('wallet'), 'payout_min');
    }
    $id = abz_ledger_add($uid, 'payout', -$amount, 'requested', 0, 'طلب سحب رصيد');
    update_post_meta($id, 'abz_method', $method);
    abz_notify('delegate', 'طلب سحب رصيد من النائب الإلكتروني', ['المحامي' => abz_alias($uid), 'المبلغ' => abz_money($amount)], admin_url('admin.php?page=abz-delegate-admin'));
    abz_delegate_back(abz_delegate_url('wallet'), 'payout_sent');
});

/* اعتماد تلقائي للمهام المسلَّمة بعد المهلة (WP-cron لا يعمل على هذه الاستضافة) */
add_action('init', function () {
    if (get_transient('abz_delegate_sweep')) {
        return;
    }
    set_transient('abz_delegate_sweep', 1, HOUR_IN_SECONDS);
    $limit = time() - (int) abz_delegate_settings()['auto_days'] * DAY_IN_SECONDS;
    foreach (get_posts(['post_type' => 'abz_task', 'numberposts' => 50, 'fields' => 'ids', 'meta_query' => [['key' => 'abz_status', 'value' => 'delivered'], ['key' => 'abz_delivered_at', 'value' => $limit, 'compare' => '<', 'type' => 'NUMERIC']]]) as $task_id) {
        abz_task_complete((int) $task_id, 'اعتُمدت تلقائياً بعد انقضاء مهلة المراجعة');
    }
}, 30);

/* رسائل المهام ليست تعليقات عامة: تُستبعد من كل استعلامات التعليقات إلا إذا طُلبت صراحةً */
add_action('pre_get_comments', function (WP_Comment_Query $query) {
    $type = (array) ($query->query_vars['type'] ?? []);
    $in = (array) ($query->query_vars['type__in'] ?? []);
    if (in_array('abz_msg', $type, true) || in_array('abz_msg', $in, true)) {
        return;
    }
    $query->query_vars['type__not_in'] = array_merge((array) ($query->query_vars['type__not_in'] ?? []), ['abz_msg']);
});
add_filter('comment_feed_where', fn($where) => $where . " AND comment_type <> 'abz_msg'");

/* ───────────── لوحة الإدارة: النزاعات والسحب والإعدادات ───────────── */

add_action('admin_menu', function () {
    add_submenu_page('edit.php?post_type=abz_task', 'النزاعات وطلبات السحب', 'النزاعات والسحب', 'manage_options', 'abz-delegate-admin', 'abz_render_delegate_admin');
});

add_action('admin_post_abz_delegate_admin', function () {
    if (!current_user_can('manage_options')) {
        wp_die('غير مصرّح.', 403);
    }
    check_admin_referer('abz_delegate_admin');
    $do = sanitize_key($_POST['do'] ?? '');
    $id = (int) ($_POST['id'] ?? 0);
    if ($do === 'release' && abz_task_status($id) === 'disputed') {
        abz_task_complete($id, 'حسمت الإدارة النزاع لصالح المنفّذ');
    } elseif ($do === 'refund' && abz_task_status($id) === 'disputed') {
        abz_task_set_status($id, 'cancelled', 'حسمت الإدارة النزاع بردّ المبلغ لصاحب المهمة');
        $order = function_exists('wc_get_order') ? wc_get_order((int) get_post_meta($id, 'abz_order', true)) : null;
        if ($order) {
            $order->add_order_note('حُسم النزاع بردّ المبلغ: نفّذ الاسترداد من زر «استرداد» في هذا الطلب.');
        }
    } elseif (in_array($do, ['paid', 'reject'], true) && get_post_type($id) === 'abz_ledger' && get_post_meta($id, 'abz_status', true) === 'requested') {
        update_post_meta($id, 'abz_status', $do === 'paid' ? 'paid' : 'rejected');
        abz_delegate_notice((int) get_post_field('post_author', $id), $do === 'paid' ? 'تم تحويل طلب السحب' : 'تعذّر تنفيذ طلب السحب — راجع بيانات التحويل', abz_delegate_url('wallet'));
    } elseif ($do === 'settings') {
        $in = wp_unslash($_POST['s'] ?? []);
        update_option('abz_delegate', [
            'buyer_fee' => max(0, min(50, (float) ($in['buyer_fee'] ?? 5))),
            'seller_fee' => max(0, min(50, (float) ($in['seller_fee'] ?? 20))),
            'auto_days' => max(1, min(30, (int) ($in['auto_days'] ?? 3))),
            'min_amount' => max(1, (float) ($in['min_amount'] ?? 100)),
            'min_payout' => max(1, (float) ($in['min_payout'] ?? 200)),
        ], false);
    }
    wp_safe_redirect(admin_url('admin.php?page=abz-delegate-admin&done=1'));
    exit;
});

function abz_render_delegate_admin(): void
{
    $s = abz_delegate_settings();
    $disputes = get_posts(['post_type' => 'abz_task', 'numberposts' => 50, 'meta_key' => 'abz_status', 'meta_value' => 'disputed']);
    $payouts = get_posts(['post_type' => 'abz_ledger', 'post_status' => 'private', 'numberposts' => 100, 'meta_query' => [['key' => 'abz_type', 'value' => 'payout'], ['key' => 'abz_status', 'value' => 'requested']]]);
    $button = function (string $do, int $id, string $label, string $confirm = '') {
        echo '<form method="post" action="' . esc_url(admin_url('admin-post.php')) . '" style="display:inline">';
        wp_nonce_field('abz_delegate_admin');
        echo '<input type="hidden" name="action" value="abz_delegate_admin"><input type="hidden" name="do" value="' . esc_attr($do) . '"><input type="hidden" name="id" value="' . (int) $id . '">';
        echo '<button class="button"' . ($confirm ? ' onclick="return confirm(\'' . esc_js($confirm) . '\')"' : '') . '>' . esc_html($label) . '</button></form> ';
    };
    echo '<div class="wrap" dir="rtl"><h1>النائب الإلكتروني — النزاعات وطلبات السحب</h1>';
    echo '<h2>النزاعات (' . count($disputes) . ')</h2>';
    if (!$disputes) {
        echo '<p>لا نزاعات مفتوحة.</p>';
    }
    foreach ($disputes as $task) {
        echo '<div class="card" style="max-width:none"><h3><a href="' . esc_url(abz_task_url($task->ID)) . '" target="_blank">' . esc_html($task->post_title) . '</a></h3>';
        echo '<p>المبلغ المحجوز: ' . esc_html(abz_money((float) get_post_meta($task->ID, 'abz_amount', true))) . ' — المنفّذ: ' . esc_html(abz_alias((int) get_post_meta($task->ID, 'abz_executor', true))) . '</p>';
        $button('release', $task->ID, 'اعتمد التنفيذ وحوّل للمنفّذ', 'تأكيد: إضافة الأتعاب لرصيد المنفّذ؟');
        $button('refund', $task->ID, 'ألغِ المهمة وردّ المبلغ', 'تأكيد: إلغاء المهمة؟ ستنفّذ الاسترداد يدوياً من الطلب.');
        echo '</div>';
    }
    echo '<h2>طلبات سحب الأرصدة (' . count($payouts) . ')</h2>';
    if (!$payouts) {
        echo '<p>لا طلبات معلّقة.</p>';
    }
    foreach ($payouts as $entry) {
        $user = get_userdata((int) $entry->post_author);
        echo '<div class="card" style="max-width:none"><p><strong>' . esc_html(abz_money(-(float) get_post_meta($entry->ID, 'abz_amount', true))) . '</strong> — ' . esc_html($user ? $user->display_name . ' (' . $user->user_email . ')' : '') . ' — ' . esc_html(get_the_date('j F Y', $entry)) . '</p>';
        echo '<p>بيانات التحويل: ' . esc_html((string) get_post_meta($entry->ID, 'abz_method', true)) . '</p>';
        $button('paid', $entry->ID, 'تم التحويل', 'تأكيد: حوّلت المبلغ فعلاً؟');
        $button('reject', $entry->ID, 'رفض');
        echo '</div>';
    }
    echo '<h2>الإعدادات</h2><form method="post" action="' . esc_url(admin_url('admin-post.php')) . '">';
    wp_nonce_field('abz_delegate_admin');
    echo '<input type="hidden" name="action" value="abz_delegate_admin"><input type="hidden" name="do" value="settings"><table class="form-table">';
    foreach (['buyer_fee' => 'رسوم المنصّة على صاحب المهمة (%)', 'seller_fee' => 'عمولة المنصّة من المنفّذ (%)', 'auto_days' => 'أيام الاعتماد التلقائي بعد التسليم', 'min_amount' => 'أقل قيمة للعرض (ج.م)', 'min_payout' => 'أقل مبلغ للسحب (ج.م)'] as $key => $label) {
        echo '<tr><th>' . esc_html($label) . '</th><td><input type="number" step="0.5" name="s[' . esc_attr($key) . ']" value="' . esc_attr((string) $s[$key]) . '"></td></tr>';
    }
    echo '</table><p><button class="button button-primary">حفظ</button></p></form></div>';
}

/* أعمدة قائمة المهام في اللوحة */
add_filter('manage_abz_task_posts_columns', fn($c) => ['cb' => $c['cb'], 'title' => 'المهمة', 'abz_status' => 'الحالة', 'abz_amount' => 'القيمة', 'date' => 'التاريخ']);
add_action('manage_abz_task_posts_custom_column', function ($column, $post_id) {
    if ($column === 'abz_status') {
        echo esc_html(abz_delegate_statuses()[abz_task_status($post_id)] ?? '');
    } elseif ($column === 'abz_amount') {
        $amount = (float) get_post_meta($post_id, 'abz_amount', true);
        echo $amount ? esc_html(abz_money($amount)) : '—';
    }
}, 10, 2);
