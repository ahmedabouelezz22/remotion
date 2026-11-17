<?php
if (!defined('ABSPATH')) {
    exit;
}

/**
 * منتجات الموردين في سوق مستلزمات المحامين.
 *
 * - المورّد المعتمد (role abz_supplier) يضيف منتجه من «حسابي ← منتجاتي».
 * - المنتج يُحفظ «بانتظار المراجعة» ولا يظهر حتى ينشره المالك من «المنتجات».
 * - الطلب يتمّ من المورّد مباشرة (رابط موقعه أو واتساب)، اتساقاً مع تنويه
 *   أن المؤسسة لا تعمل بالتجارة وأن البائع هو المورّد.
 */

add_action('init', function () {
    add_rewrite_endpoint('abz-products', EP_ROOT | EP_PAGES);
});

add_filter('woocommerce_get_query_vars', function ($vars) {
    $vars['abz-products'] = 'abz-products';
    return $vars;
});

add_filter('woocommerce_account_menu_items', function ($items) {
    $new = [];
    foreach ($items as $key => $label) {
        $new[$key] = $label;
        if ($key === 'dashboard') {
            if (function_exists('abz_user_is') && (abz_user_is('lawyer') || abz_user_is('law-firm') || abz_user_is('partner'))) {
                $new['abz-delegate'] = 'النائب الإلكتروني';
            }
            if (function_exists('abz_user_is') && abz_user_is('supplier')) {
                $new['abz-products'] = 'منتجاتي في السوق';
            }
        }
    }
    return $new;
});

add_filter('woocommerce_get_endpoint_url', function ($url, $endpoint) {
    return $endpoint === 'abz-delegate' ? home_url('/e-delegate/') : $url;
}, 10, 2);

/** فئات السوق المتاحة للمورّد: [term_id => الاسم] */
function abz_market_terms(): array
{
    $root = get_term_by('slug', 'lawyers-marketplace', 'product_cat');
    if (!$root) {
        return [];
    }
    $terms = get_terms(['taxonomy' => 'product_cat', 'parent' => $root->term_id, 'hide_empty' => false]);
    $out = [];
    foreach (is_array($terms) ? $terms : [] as $term) {
        $out[(int) $term->term_id] = $term->name;
    }
    return $out;
}

add_action('woocommerce_account_abz-products_endpoint', function () {
    if (!abz_user_is('supplier')) {
        echo '<p class="abz-notice">هذا القسم للموردين المعتمدين. إن سجّلت كمورّد فستظهر لك هذه الصفحة بعد اعتماد حسابك.</p>';
        return;
    }
    $products = get_posts(['post_type' => 'product', 'author' => get_current_user_id(), 'post_status' => ['publish', 'pending', 'draft'], 'numberposts' => 50]);
    $status = ['publish' => 'منشور', 'pending' => 'بانتظار المراجعة', 'draft' => 'مسودّة'];
    $notice = sanitize_key(wp_unslash($_GET['abz_product'] ?? '')); // phpcs:ignore -- رسالة عرض
    if ($notice === 'sent') {
        echo '<div class="abz-notice abz-notice--info">استلمنا منتجك، ويظهر في السوق بعد مراجعته.</div>';
    } elseif ($notice !== '') {
        echo '<div class="abz-notice">' . esc_html(abz_supplier_errors()[$notice] ?? 'تعذّر حفظ المنتج.') . '</div>';
    }
    echo '<h3>منتجاتي</h3>';
    if ($products) {
        echo '<table class="shop_table"><thead><tr><th>المنتج</th><th>السعر</th><th>الحالة</th><th></th></tr></thead><tbody>';
        foreach ($products as $post) {
            $product = wc_get_product($post->ID);
            $withdraw = wp_nonce_url(admin_url('admin-post.php?action=abz_supplier_withdraw&product=' . $post->ID), 'abz_supplier_withdraw_' . $post->ID);
            printf(
                '<tr><td>%s</td><td>%s</td><td>%s</td><td>%s <a href="%s" onclick="return confirm(\'سحب المنتج من السوق؟\')">سحب</a></td></tr>',
                esc_html($post->post_title),
                $product ? wp_kses_post($product->get_price_html()) : '',
                esc_html($status[$post->post_status] ?? $post->post_status),
                $post->post_status === 'publish' ? '<a href="' . esc_url(get_permalink($post)) . '">عرض</a> ·' : '',
                esc_url($withdraw)
            );
        }
        echo '</tbody></table>';
    } else {
        echo '<p>لم تُضف منتجات بعد.</p>';
    }
    $terms = abz_market_terms();
    ?>
    <h3>أضف منتجاً</h3>
    <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>" enctype="multipart/form-data" class="woocommerce-EditAccountForm abz-supplier-form">
      <input type="hidden" name="action" value="abz_supplier_product">
      <?php wp_nonce_field('abz_supplier_product'); ?>
      <p class="form-row form-row-wide"><label>اسم المورّد أو المتجر *</label><input class="input-text" name="store" required maxlength="80" value="<?php echo esc_attr((string) get_user_meta(get_current_user_id(), 'abz_store_name', true)); ?>"></p>
      <p class="form-row form-row-wide"><label>اسم المنتج *</label><input class="input-text" name="name" required maxlength="120"></p>
      <p class="form-row form-row-wide"><label>القسم *</label><select name="cat" required><?php foreach ($terms as $id => $name) : ?><option value="<?php echo (int) $id; ?>"><?php echo esc_html($name); ?></option><?php endforeach; ?></select></p>
      <p class="form-row form-row-first"><label>السعر قبل الخصم (ج.م) *</label><input class="input-text" type="number" name="price" min="1" step="1" required></p>
      <p class="form-row form-row-last"><label>السعر الخاص للمحامين (ج.م)</label><input class="input-text" type="number" name="sale" min="1" step="1"></p>
      <p class="form-row form-row-wide"><label>وصف مختصر *</label><textarea name="short" rows="2" maxlength="300" required></textarea></p>
      <p class="form-row form-row-wide"><label>التفاصيل (المقاسات، الضمان، الشحن…)</label><textarea name="desc" rows="5" maxlength="3000"></textarea></p>
      <p class="form-row form-row-first"><label>رابط الطلب من موقعك</label><input class="input-text" type="url" name="url" dir="ltr" placeholder="https://"></p>
      <p class="form-row form-row-last"><label>أو رقم واتساب للطلب</label><input class="input-text" name="wa" dir="ltr" placeholder="2010xxxxxxxx"></p>
      <p class="form-row form-row-wide"><label>صورة المنتج (JPG أو PNG أو WEBP حتى 3 ميجابايت) *</label><input type="file" name="image" accept="image/jpeg,image/png,image/webp" required></p>
      <p class="form-row form-row-wide"><label><input type="checkbox" name="agree" value="1" required> أقرّ بأني البائع المسؤول عن المنتج وجودته وضمانه وشحنه وفاتورته، وفق تنويه سوق المستلزمات.</label></p>
      <p><button class="button" type="submit">أرسل المنتج للمراجعة</button></p>
    </form>
    <?php
});

function abz_supplier_errors(): array
{
    return [
        'fields' => 'أكمل الحقول المطلوبة: الاسم والقسم والسعر والوصف والصورة.',
        'order' => 'أضف رابط الطلب من موقعك أو رقم واتساب ليطلب منك العملاء.',
        'image' => 'الصورة يجب أن تكون JPG أو PNG أو WEBP بحجم لا يزيد على 3 ميجابايت.',
        'limit' => 'لديك منتجات كثيرة بانتظار المراجعة. انتظر مراجعتها قبل إضافة المزيد.',
    ];
}

add_action('admin_post_abz_supplier_product', function () {
    $back = wc_get_account_endpoint_url('abz-products');
    if (!is_user_logged_in() || !abz_user_is('supplier')) {
        wp_die('هذا الإجراء للموردين المعتمدين.', 403);
    }
    check_admin_referer('abz_supplier_product');
    $fail = function (string $code) use ($back): void {
        wp_safe_redirect(add_query_arg('abz_product', $code, $back));
        exit;
    };
    $user_id = get_current_user_id();
    if (!abz_rate_limit('supplier_product', 10, DAY_IN_SECONDS)) {
        $fail('limit');
    }
    $pending = get_posts(['post_type' => 'product', 'author' => $user_id, 'post_status' => 'pending', 'numberposts' => 21, 'fields' => 'ids']);
    if (count($pending) >= 20) {
        $fail('limit');
    }
    $in = wp_unslash($_POST);
    $name = sanitize_text_field($in['name'] ?? '');
    $store = sanitize_text_field($in['store'] ?? '');
    $cat = (int) ($in['cat'] ?? 0);
    $price = (float) ($in['price'] ?? 0);
    $sale = (float) ($in['sale'] ?? 0);
    $short = sanitize_textarea_field($in['short'] ?? '');
    $desc = sanitize_textarea_field($in['desc'] ?? '');
    $url = esc_url_raw(trim((string) ($in['url'] ?? '')), ['https', 'http']);
    $wa = abz_digits((string) ($in['wa'] ?? ''));
    if ($name === '' || $store === '' || !isset(abz_market_terms()[$cat]) || $price <= 0 || $short === '' || empty($in['agree'])) {
        $fail('fields');
    }
    if ($url === '' && strlen($wa) < 9) {
        $fail('order');
    }
    if (str_starts_with($wa, '0')) {
        $wa = '20' . substr($wa, 1);
    }
    $order_url = $url !== '' ? $url : 'https://wa.me/' . $wa . '?text=' . rawurlencode('أودّ طلب: ' . $name . ' (من سوق مستلزمات المحامين — ' . wp_parse_url(home_url(), PHP_URL_HOST) . ')');

    $file = $_FILES['image'] ?? null; // phpcs:ignore -- يُفحص أدناه
    $type = $file && !empty($file['tmp_name']) ? wp_check_filetype_and_ext($file['tmp_name'], (string) $file['name']) : [];
    if (!$file || !empty($file['error']) || (int) $file['size'] > 3 * MB_IN_BYTES || !in_array($type['type'] ?? '', ['image/jpeg', 'image/png', 'image/webp'], true)) {
        $fail('image');
    }

    update_user_meta($user_id, 'abz_store_name', $store);
    $product = new WC_Product_External();
    $product->set_name($name);
    $product->set_status('pending');
    $product->set_catalog_visibility('visible');
    $product->set_regular_price((string) round($price));
    $product->set_sale_price($sale > 0 && $sale < $price ? (string) round($sale) : '');
    $product->set_short_description('<p>' . esc_html($short) . '</p>');
    $product->set_description(wpautop(esc_html($desc)));
    $product->set_category_ids([$cat]);
    $product->set_product_url($order_url);
    $product->set_button_text('اطلب من المورّد');
    $product->set_reviews_allowed(true);
    $id = $product->save();
    wp_update_post(['ID' => $id, 'post_author' => $user_id]);
    update_post_meta($id, '_abz_supplier', $user_id);
    update_post_meta($id, '_abz_supplier_name', $store);

    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/media.php';
    require_once ABSPATH . 'wp-admin/includes/image.php';
    $attachment = media_handle_upload('image', $id, ['post_title' => $name]);
    if (!is_wp_error($attachment)) {
        set_post_thumbnail($id, $attachment);
    }
    abz_notify('supplier', 'منتج جديد من مورّد بانتظار مراجعتك', ['المورّد' => $store, 'المنتج' => $name, 'السعر' => round($price) . ' ج.م'], admin_url('post.php?post=' . $id . '&action=edit'));
    wp_safe_redirect(add_query_arg('abz_product', 'sent', $back));
    exit;
});

add_action('admin_post_abz_supplier_withdraw', function () {
    $product_id = (int) ($_GET['product'] ?? 0);
    check_admin_referer('abz_supplier_withdraw_' . $product_id);
    $post = get_post($product_id);
    if (!$post || $post->post_type !== 'product' || (int) $post->post_author !== get_current_user_id() || !abz_user_is('supplier')) {
        wp_die('غير مصرّح.', 403);
    }
    wp_trash_post($product_id);
    wp_safe_redirect(wc_get_account_endpoint_url('abz-products'));
    exit;
});

/* اسم المورّد في صفحة منتجه */
add_action('woocommerce_single_product_summary', function () {
    global $product;
    $store = $product ? (string) get_post_meta($product->get_id(), '_abz_supplier_name', true) : '';
    if ($store !== '') {
        echo '<p class="abz-supplier-name">المورّد: <strong>' . esc_html($store) . '</strong></p>';
    }
}, 6);

/* تنبيه في لوحة التحكم بعدد منتجات الموردين بانتظار المراجعة */
add_action('admin_notices', function () {
    if (!current_user_can('edit_others_products')) {
        return;
    }
    $count = (int) (wp_count_posts('product')->pending ?? 0);
    if ($count > 0) {
        printf('<div class="notice notice-info"><p>لديك %d منتج من الموردين بانتظار المراجعة. <a href="%s">راجعها الآن</a> — افتح المنتج واضغط «نشر» لعرضه في السوق.</p></div>', $count, esc_url(admin_url('edit.php?post_status=pending&post_type=product')));
    }
});
