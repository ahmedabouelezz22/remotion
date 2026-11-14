<?php
if (!defined('ABSPATH')) {
    exit;
}

/**
 * الحسابات: نوع الحساب عند التسجيل، اعتماد الإدارة للأنواع التي تحتاج تحقّقاً،
 * وخصم العضوية في السلة.
 *
 * قواعد الأمان:
 *  - المسجِّل يأخذ دور «عميل» دائماً. نوع الحساب الذي يختاره «طلب» لا «صلاحية».
 *  - الأنواع التي تحتاج تحقّقاً (محامٍ، مكتب محاماة، مورّد، شريك) لا تُفعَّل
 *    مزاياها إلا بعد اعتماد مدير من لوحة التحكم — بفحص صلاحية ورمز nonce.
 *  - الخصم يُحسب على الخادم من بيانات المستخدم، لا من أي قيمة يرسلها المتصفّح.
 */

function abz_account_types(): array
{
    $types = [];
    foreach ((array) abz_data('platform.accountTypes', []) as $type) {
        $types[$type['key']] = $type;
    }
    return $types;
}

function abz_account_roles(): array
{
    return ['lawyer' => ['abz_lawyer', 'محامٍ'], 'law-firm' => ['abz_law_firm', 'مكتب محاماة'], 'supplier' => ['abz_supplier', 'مورّد'], 'partner' => ['abz_partner', 'شريك المؤسسة']];
}

add_action('init', function () {
    if (get_option('abz_roles_version') === '1') {
        return;
    }
    foreach (abz_account_roles() as [$role, $label]) {
        if (!get_role($role)) {
            add_role($role, $label, ['read' => true]);
        }
    }
    update_option('abz_roles_version', '1');
}, 6);

/** حالة حساب المستخدم: [type, status] — status: active | pending | approved | rejected */
function abz_account_state(int $user_id): array
{
    $type = (string) get_user_meta($user_id, 'abz_account_type', true) ?: 'citizen';
    $status = (string) get_user_meta($user_id, 'abz_account_status', true) ?: 'active';
    return [$type, $status];
}

/* ── حقل نوع الحساب في نموذج التسجيل ── */
add_action('woocommerce_register_form', function () {
    $selected = sanitize_key(wp_unslash($_POST['abz_account_type'] ?? $_GET['type'] ?? 'citizen')); // phpcs:ignore -- عرض فقط
    echo '<fieldset class="abz-account-types"><legend>نوع الحساب</legend>';
    foreach (abz_account_types() as $key => $type) {
        printf(
            '<label class="abz-account-type"><input type="radio" name="abz_account_type" value="%1$s" %2$s> <span><strong>%3$s</strong><small>%4$s%5$s</small></span></label>',
            esc_attr($key),
            checked($selected, $key, false),
            esc_html($type['title']),
            esc_html($type['body']),
            !empty($type['review']) ? ' <em>يُفعَّل بعد مراجعة الإدارة.</em>' : ''
        );
    }
    echo '</fieldset>';
    printf(
        '<p class="form-row form-row-wide"><label for="abz_account_details">بيانات للتحقّق <small>(اسم المنشأة، رقم القيد بالنقابة، نشاط المورّد… بحسب نوع الحساب)</small></label><textarea name="abz_account_details" id="abz_account_details" rows="3" maxlength="600">%s</textarea></p>',
        esc_textarea(wp_unslash($_POST['abz_account_details'] ?? '')) // phpcs:ignore
    );
});

add_filter('woocommerce_registration_errors', function ($errors) {
    $type = sanitize_key(wp_unslash($_POST['abz_account_type'] ?? '')); // phpcs:ignore -- nonce يتحقّق منه WooCommerce
    $types = abz_account_types();
    if ($types && !isset($types[$type])) {
        $errors->add('abz_account_type', 'اختر نوع الحساب.');
    } elseif (!empty($types[$type]['review']) && trim((string) wp_unslash($_POST['abz_account_details'] ?? '')) === '') { // phpcs:ignore
        $errors->add('abz_account_details', 'اكتب بيانات التحقّق المطلوبة لهذا النوع من الحسابات.');
    }
    return $errors;
});

add_action('woocommerce_created_customer', function ($user_id) {
    $types = abz_account_types();
    $type = sanitize_key(wp_unslash($_POST['abz_account_type'] ?? 'citizen')); // phpcs:ignore
    if (!isset($types[$type])) {
        $type = 'citizen';
    }
    $needs_review = !empty($types[$type]['review']);
    update_user_meta($user_id, 'abz_account_type', $type);
    update_user_meta($user_id, 'abz_account_status', $needs_review ? 'pending' : 'active');
    update_user_meta($user_id, 'abz_account_details', sanitize_textarea_field(mb_substr((string) wp_unslash($_POST['abz_account_details'] ?? ''), 0, 600))); // phpcs:ignore
    if ($needs_review) {
        $user = get_userdata($user_id);
        wp_mail(
            (string) abz_setting('notify_email', get_option('admin_email')),
            'حساب جديد ينتظر الاعتماد: ' . ($types[$type]['title'] ?? $type),
            "سجّل مستخدم جديد بنوع حساب يحتاج مراجعة.\n\nالبريد: {$user->user_email}\nالنوع: " . ($types[$type]['title'] ?? $type) . "\nبيانات التحقّق:\n" . get_user_meta($user_id, 'abz_account_details', true) . "\n\nللاعتماد أو الرفض: " . admin_url('users.php?abz_status=pending')
        );
    }
});

/* ── لوحة التحكم: عمود الحالة وأزرار الاعتماد ── */
add_filter('manage_users_columns', function ($columns) {
    $columns['abz_account'] = 'نوع الحساب';
    return $columns;
});

add_filter('manage_users_custom_column', function ($output, $column, $user_id) {
    if ($column !== 'abz_account') {
        return $output;
    }
    [$type, $status] = abz_account_state((int) $user_id);
    $types = abz_account_types();
    $labels = ['active' => 'مفعّل', 'pending' => 'ينتظر الاعتماد', 'approved' => 'معتمد', 'rejected' => 'مرفوض'];
    $html = esc_html(($types[$type]['title'] ?? $type) . ' — ' . ($labels[$status] ?? $status));
    if ($status === 'pending' && current_user_can('promote_users')) {
        foreach (['approve' => 'اعتماد', 'reject' => 'رفض'] as $action => $label) {
            $url = wp_nonce_url(admin_url('users.php?abz_account_action=' . $action . '&user=' . (int) $user_id), 'abz_account_' . (int) $user_id);
            $html .= ' <a class="button button-small" href="' . esc_url($url) . '">' . esc_html($label) . '</a>';
        }
        $details = (string) get_user_meta((int) $user_id, 'abz_account_details', true);
        if ($details !== '') {
            $html .= '<br><small>' . esc_html($details) . '</small>';
        }
    }
    return $html;
}, 10, 3);

add_action('pre_get_users', function ($query) {
    if (is_admin() && isset($_GET['abz_status']) && current_user_can('list_users')) { // phpcs:ignore -- فلترة عرض
        $query->set('meta_key', 'abz_account_status');
        $query->set('meta_value', sanitize_key(wp_unslash($_GET['abz_status']))); // phpcs:ignore
    }
});

add_action('admin_init', function () {
    if (empty($_GET['abz_account_action']) || empty($_GET['user'])) {
        return;
    }
    $user_id = (int) $_GET['user'];
    if (!current_user_can('promote_users') || !current_user_can('edit_user', $user_id)) {
        wp_die('غير مصرّح.', 403);
    }
    check_admin_referer('abz_account_' . $user_id);
    [$type, $status] = abz_account_state($user_id);
    if ($status !== 'pending') {
        wp_safe_redirect(admin_url('users.php'));
        exit;
    }
    $approve = sanitize_key(wp_unslash($_GET['abz_account_action'])) === 'approve';
    update_user_meta($user_id, 'abz_account_status', $approve ? 'approved' : 'rejected');
    $roles = abz_account_roles();
    $user = get_userdata($user_id);
    if ($approve && $user && isset($roles[$type])) {
        $user->add_role($roles[$type][0]);
    }
    if ($user) {
        wp_mail(
            $user->user_email,
            $approve ? 'تم اعتماد حسابك — ' . get_bloginfo('name') : 'بخصوص طلب حسابك — ' . get_bloginfo('name'),
            $approve
                ? "تم اعتماد حسابك وتفعيل مزاياه. يمكنك الدخول من: " . (function_exists('wc_get_page_permalink') ? wc_get_page_permalink('myaccount') : home_url('/'))
                : "تعذّر اعتماد نوع الحساب المطلوب بالبيانات المرسلة. حسابك يعمل كحساب فرد، ويمكنك مراسلتنا لاستكمال التحقّق: " . home_url('/contact/')
        );
    }
    wp_safe_redirect(admin_url('users.php?abz_status=pending'));
    exit;
});

/* ── العضوية: تُفعَّل عند اكتمال دفع منتج عضوية، وتُحسب مدّتها على الخادم ── */
function abz_activate_memberships($order_id): void
{
    $order = function_exists('wc_get_order') ? wc_get_order($order_id) : null;
    if (!$order || !$order->get_user_id() || $order->get_meta('_abz_membership_applied')) {
        return;
    }
    foreach ($order->get_items() as $item) {
        $product_id = (int) $item->get_product_id();
        $discount = (int) get_post_meta($product_id, '_abz_membership_discount', true);
        if ($discount <= 0) {
            continue;
        }
        $days = (int) get_post_meta($product_id, '_abz_membership_days', true);
        if ($days <= 0) {
            $variation = $item->get_variation_id() ? wc_get_product($item->get_variation_id()) : null;
            $days = $variation && $variation->get_attribute('مدة الاشتراك') === 'سنوي' ? 365 : 30;
        }
        $current = (array) get_user_meta($order->get_user_id(), 'abz_membership', true);
        // لا تُستبدل عضوية أعلى سارية بعضوية أدنى
        if (!empty($current['expires']) && $current['expires'] > time() && (int) ($current['discount'] ?? 0) > $discount) {
            continue;
        }
        update_user_meta($order->get_user_id(), 'abz_membership', [
            'label' => (string) get_post_meta($product_id, '_abz_membership_label', true),
            'discount' => min(50, $discount),
            'expires' => time() + $days * DAY_IN_SECONDS,
            'order' => (int) $order_id,
        ]);
    }
    $order->update_meta_data('_abz_membership_applied', 1);
    $order->save();
}
add_action('woocommerce_payment_complete', 'abz_activate_memberships');
add_action('woocommerce_order_status_completed', 'abz_activate_memberships');

/** عضوية المستخدم السارية أو null */
function abz_active_membership(int $user_id): ?array
{
    $membership = (array) get_user_meta($user_id, 'abz_membership', true);
    if (!empty($membership['expires']) && $membership['expires'] > time() && !empty($membership['discount'])) {
        return $membership;
    }
    [$type, $status] = abz_account_state($user_id);
    if ($type === 'partner' && $status === 'approved') {
        return ['label' => 'شريك المؤسسة', 'discount' => (int) apply_filters('abz_partner_discount', 30), 'expires' => 0];
    }
    return null;
}

add_action('woocommerce_cart_calculate_fees', function ($cart) {
    if (is_admin() && !wp_doing_ajax()) {
        return;
    }
    $user_id = get_current_user_id();
    $membership = $user_id ? abz_active_membership($user_id) : null;
    if (!$membership) {
        return;
    }
    $eligible = 0.0;
    foreach ($cart->get_cart() as $line) {
        // العضويات نفسها لا تُخصم
        if ((int) get_post_meta((int) $line['product_id'], '_abz_membership_discount', true) > 0) {
            continue;
        }
        $eligible += (float) $line['line_total'];
    }
    if ($eligible > 0) {
        $cart->add_fee(sprintf('خصم العضوية (%d%%) — %s', (int) $membership['discount'], $membership['label']), -1 * round($eligible * (int) $membership['discount'] / 100, 2));
    }
});

/* ── «حسابي»: نوع الحساب وحالته والعضوية ── */
add_action('woocommerce_account_dashboard', function () {
    $user_id = get_current_user_id();
    [$type, $status] = abz_account_state($user_id);
    $types = abz_account_types();
    $info = $types[$type] ?? null;
    $labels = ['active' => 'مفعّل', 'pending' => 'ينتظر مراجعة الإدارة', 'approved' => 'معتمد', 'rejected' => 'لم يُعتمد — يعمل كحساب فرد'];
    echo '<div class="abz-account-card"><h3>نوع حسابك: ' . esc_html($info['title'] ?? 'فرد') . ' <small>(' . esc_html($labels[$status] ?? $status) . ')</small></h3>';
    if ($info && in_array($status, ['active', 'approved'], true)) {
        echo '<ul>';
        foreach ($info['perks'] as $perk) {
            echo '<li>' . esc_html($perk) . '</li>';
        }
        echo '</ul>';
    } elseif ($status === 'pending') {
        echo '<p>استلمنا طلبك، وتُفعَّل مزايا هذا النوع بعد التحقّق من بياناتك. حتى ذلك الحين يعمل حسابك كحساب فرد.</p>';
    }
    $membership = abz_active_membership($user_id);
    if ($membership) {
        echo '<p><strong>عضويتك:</strong> ' . esc_html($membership['label']) . ' — خصم ' . (int) $membership['discount'] . '% يُطبَّق تلقائياً في السلة' . ($membership['expires'] ? '، سارية حتى ' . esc_html(wp_date('j F Y', (int) $membership['expires'])) : '') . '.</p>';
    } else {
        echo '<p><a href="' . esc_url(home_url('/memberships/')) . '">تعرّف على العضويات وخصوماتها</a></p>';
    }
    echo '</div>';
}, 5);
