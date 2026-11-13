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
