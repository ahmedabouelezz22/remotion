<?php
if (!defined('ABSPATH')) {
    exit;
}

/**
 * تكامل WooCommerce: الإعدادات الآمنة، المنتجات «القريبة»، تنويه سوق
 * المستلزمات، وتوجيه مشتري الاستشارة إلى حجز موعده بعد الدفع.
 */

function abz_woo_active(): bool
{
    return class_exists('WooCommerce');
}

/** منتج معلن لم يُطرح بعد: يظهر ولا يُشترى، والخادم يرفضه */
add_filter('woocommerce_is_purchasable', function ($purchasable, $product) {
    return get_post_meta($product->get_id(), '_abz_coming_soon', true) ? false : $purchasable;
}, 10, 2);

add_action('woocommerce_single_product_summary', function () {
    global $product;
    if (!$product) {
        return;
    }
    if (get_post_meta($product->get_id(), '_abz_coming_soon', true)) {
        echo '<p class="abz-notice">قريباً — هذا المنتج لم يُطرح بعد. <a href="' . esc_url(home_url('/contact/?topic=' . rawurlencode('إبلاغي عند توفّر: ' . $product->get_name()))) . '">أبلغني عند التوفّر</a></p>';
    }
    if (get_post_meta($product->get_id(), '_abz_requires_booking', true)) {
        echo '<p class="abz-notice abz-notice--info">بعد إتمام الدفع تختار موعد الاستشارة ووسيلتها من صفحة الحجز، ويصلك التأكيد خلال يوم عمل.</p>';
    }
}, 25);

/* تنويه سوق المستلزمات في صفحة الفئة وفي كل منتج منها */
function abz_is_marketplace_term($term): bool
{
    if (!$term || is_wp_error($term)) {
        return false;
    }
    $root = get_term_by('slug', 'lawyers-marketplace', 'product_cat');
    return $root && ((int) $term->term_id === (int) $root->term_id || term_is_ancestor_of($root, $term, 'product_cat'));
}

function abz_marketplace_disclaimer(): string
{
    return '<div class="abz-notice abz-notice--info">' . esc_html(abz_data('firm.marketplace.disclaimer', '')) . '</div>';
}

add_action('woocommerce_archive_description', function () {
    if (is_product_category() && abz_is_marketplace_term(get_queried_object())) {
        echo abz_marketplace_disclaimer(); // phpcs:ignore -- مُهرَّب في الدالة
    }
}, 5);

add_action('woocommerce_single_product_summary', function () {
    global $product;
    if (!$product) {
        return;
    }
    foreach (wp_get_post_terms($product->get_id(), 'product_cat') as $term) {
        if (abz_is_marketplace_term($term)) {
            echo abz_marketplace_disclaimer(); // phpcs:ignore
            return;
        }
    }
}, 26);

/* صفحة الشكر: من اشترى استشارة يُوجَّه إلى حجز الموعد */
add_action('woocommerce_thankyou', function ($order_id) {
    $order = wc_get_order($order_id);
    if (!$order) {
        return;
    }
    foreach ($order->get_items() as $item) {
        if (get_post_meta($item->get_product_id(), '_abz_requires_booking', true)) {
            $url = home_url('/booking/?topic=' . rawurlencode('طلب رقم ' . $order->get_order_number() . ' — ' . $item->get_name()));
            echo '<p class="abz-notice abz-notice--info"><strong>الخطوة التالية:</strong> اختر موعد استشارتك. <a href="' . esc_url($url) . '">احجز الموعد الآن</a></p>';
            return;
        }
    }
}, 5);

/* التقييمات من مشترين فعليين فقط */
add_filter('pre_option_woocommerce_review_rating_verification_required', fn() => 'yes');
add_filter('pre_option_woocommerce_review_rating_verification_label', fn() => 'yes');
