<?php
/**
 * قالب مؤسسة أبو العز.
 * البيانات (الأرقام، الحسابات، القطاعات، الفريق...) من إضافة Abo Elezz Core.
 * إن عُطّلت الإضافة يبقى القالب يعمل بقيم احتياطية ولا يتعطّل الموقع.
 */
if (!defined('ABSPATH')) {
    exit;
}

define('ABZ_THEME_VERSION', '1.0.0');

require_once get_template_directory() . '/inc/icons.php';
require_once get_template_directory() . '/inc/template-tags.php';
require_once get_template_directory() . '/inc/content.php';

add_action('after_setup_theme', function () {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('html5', ['search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script']);
    add_theme_support('responsive-embeds');
    add_theme_support('woocommerce');
    add_theme_support('wc-product-gallery-lightbox');
    add_image_size('abz-card', 720, 420, true);
    register_nav_menus(['footer' => 'روابط التذييل']);
});

add_action('wp_enqueue_scripts', function () {
    $dir = get_template_directory();
    $uri = get_template_directory_uri();
    $ver = fn(string $file) => file_exists($dir . $file) ? (string) filemtime($dir . $file) : ABZ_THEME_VERSION;
    wp_enqueue_style('abz-fonts', $uri . '/assets/fonts/fonts.css', [], $ver('/assets/fonts/fonts.css'));
    wp_enqueue_style('abz-app', $uri . '/assets/app.css', ['abz-fonts'], $ver('/assets/app.css'));
    wp_enqueue_script('abz-app', $uri . '/assets/app.js', [], $ver('/assets/app.js'), ['strategy' => 'defer', 'in_footer' => true]);
    if (is_singular('post') && comments_open() && get_option('thread_comments')) {
        wp_enqueue_script('comment-reply');
    }
});

/* خطّا الموقع مُحمّلان مسبقاً — يقلّل وميض الخط عند فتح الصفحة */
add_action('wp_head', function () {
    $uri = get_template_directory_uri() . '/assets/fonts/';
    foreach (['cairo-400-arabic.woff2', 'tajawal-800-arabic.woff2'] as $font) {
        printf('<link rel="preload" href="%s" as="font" type="font/woff2" crossorigin>' . "\n", esc_url($uri . $font));
    }
    echo '<meta name="theme-color" content="#11293a">' . "\n";
}, 1);

/* تنظيف رأس الصفحة */
remove_action('wp_head', 'print_emoji_detection_script', 7);
remove_action('wp_print_styles', 'print_emoji_styles');
remove_action('wp_head', 'wp_generator');

add_filter('excerpt_length', fn() => 28);
add_filter('excerpt_more', fn() => '…');

/* WooCommerce: غلاف القالب بدل غلاف الإضافة، وبلا شريط جانبي */
remove_action('woocommerce_before_main_content', 'woocommerce_output_content_wrapper', 10);
remove_action('woocommerce_after_main_content', 'woocommerce_output_content_wrapper_end', 10);
remove_action('woocommerce_sidebar', 'woocommerce_get_sidebar', 10);
add_filter('loop_shop_columns', fn() => 3);
add_filter('loop_shop_per_page', fn() => 24);
add_filter('woocommerce_show_page_title', '__return_false');

/* الصفحات الخاصة لا تُفهرس */
add_filter('wp_robots', function ($robots) {
    if (is_search() || is_404()) {
        $robots['noindex'] = true;
    }
    return $robots;
});

/* ── صور المتجر: منتج بلا صورة يأخذ صورة قسمه بدل المربّع الرمادي ── */
add_filter('woocommerce_placeholder_img', function ($html, $size, $dimensions) {
    global $product;
    $photo = $product instanceof WC_Product ? abz_product_photo($product->get_parent_id() ?: $product->get_id()) : 'lawbooks';
    return '<img src="' . esc_url(abz_img($photo)) . '" alt="' . esc_attr($product instanceof WC_Product ? $product->get_name() : '') . '" width="1200" height="750" loading="lazy" class="abz-product-photo woocommerce-placeholder wp-post-image">';
}, 10, 3);
add_filter('woocommerce_placeholder_img_src', function ($src) {
    global $product;
    return abz_img($product instanceof WC_Product ? abz_product_photo($product->get_parent_id() ?: $product->get_id()) : 'lawbooks');
});

/* ملخّص قصير تحت اسم المنتج في شبكة المتجر */
add_action('woocommerce_after_shop_loop_item_title', function () {
    global $product;
    $summary = $product ? wp_strip_all_tags($product->get_short_description()) : '';
    if ($summary !== '') {
        echo '<p class="abz-loop-summary">' . esc_html(wp_trim_words($summary, 16, '…')) . '</p>';
    }
}, 4);

/* صفحة المنتج: ما يطمئن المشتري بعد زر الشراء */
add_action('woocommerce_single_product_summary', function () {
    global $product;
    if (!$product) {
        return;
    }
    $wa = abz_wa_link('السلام عليكم، لديّ سؤال عن: ' . $product->get_name());
    echo '<div class="abz-buybox"><ul>';
    foreach (['نطاق العمل والسعر معلومان قبل الدفع', $product->is_downloadable() ? 'رابط التحميل يصلك فور تأكيد الدفع' : 'نتواصل معك خلال يوم عمل لبدء التنفيذ', 'سرّية كاملة لبياناتك ومستنداتك', 'الأعضاء يحصلون على خصم حتى 30% تلقائياً'] as $line) {
        echo '<li>' . abz_icon('check', 'h-4 w-4') . '<span>' . esc_html($line) . '</span></li>';
    }
    echo '</ul><p><a class="abz-buybox-wa" target="_blank" rel="noopener" href="' . esc_url($wa) . '">' . abz_icon('message-circle', 'h-4 w-4') . ' لديك سؤال قبل الشراء؟ راسلنا على واتساب</a> · <a href="' . esc_url(abz_url('memberships')) . '">تعرّف على العضويات</a></p></div>';
}, 35);

/* وسم الرابط الأساسي يولّده ووردبريس/إضافة SEO — لا نكرّره. وبيانات منظَّمة للمؤسسة في الرئيسية. */
add_action('wp_head', function () {
    if (!is_front_page()) {
        return;
    }
    $same = array_values(array_filter(array_map(fn($l) => $l['url'], abz_social_links())));
    $data = [
        '@context' => 'https://schema.org',
        '@type' => 'LegalService',
        'name' => get_bloginfo('name'),
        'alternateName' => 'Abo Elezz Law Firm',
        'url' => home_url('/'),
        'logo' => get_template_directory_uri() . '/assets/logo.png',
        'image' => abz_img('lawbooks'),
        'email' => (string) abz_setting('email', ''),
        'telephone' => '+' . preg_replace('/\D+/', '', (string) abz_setting('whatsapp', '201157844664')),
        'address' => ['@type' => 'PostalAddress', 'streetAddress' => (string) abz_setting('address', ''), 'addressLocality' => '6th of October City', 'addressRegion' => 'Giza', 'addressCountry' => 'EG'],
        'areaServed' => 'Worldwide',
        'founder' => ['@type' => 'Person', 'name' => 'أحمد أبو العز', 'alternateName' => 'Ahmed Abo Elezz'],
        'sameAs' => $same,
    ];
    echo '<script type="application/ld+json">' . wp_json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG) . '</script>' . "\n";
    echo '<meta property="og:image" content="' . esc_url(abz_img('lawbooks')) . '">' . "\n";
}, 20);

/* إضافة SEO تولّد وسم الرابط الأساسي: لا يُكرَّر بوسم ووردبريس الافتراضي */
add_action('wp', function () {
    if (function_exists('aioseo') || defined('WPSEO_VERSION') || defined('RANK_MATH_VERSION')) {
        remove_action('wp_head', 'rel_canonical');
    }
});
