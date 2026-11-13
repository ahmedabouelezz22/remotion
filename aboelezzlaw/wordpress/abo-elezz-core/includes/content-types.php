<?php
if (!defined('ABSPATH')) {
    exit;
}

/**
 * أنواع المحتوى:
 *   abz_sector     القطاعات (عامّ)            /sectors/{slug}
 *   abz_service    الخدمات الأساسية (عامّ)      /services/{slug}
 *   abz_team       أعضاء الفريق (يُعرض في صفحة الفريق فقط)
 *   abz_request    طلبات التواصل والحجز (خاصّ — للوحة فقط)
 *   abz_subscriber مشتركو النشرة (خاصّ — للوحة فقط)
 */
function abz_register_content_types(): void
{
    register_post_type('abz_sector', [
        'labels' => [
            'name' => 'القطاعات',
            'singular_name' => 'قطاع',
            'add_new_item' => 'إضافة قطاع',
            'edit_item' => 'تعديل القطاع',
            'all_items' => 'كل القطاعات',
        ],
        'public' => true,
        'has_archive' => 'sectors',
        'rewrite' => ['slug' => 'sectors', 'with_front' => false],
        'menu_icon' => 'dashicons-building',
        'menu_position' => 21,
        'supports' => ['title', 'excerpt', 'editor', 'page-attributes', 'revisions'],
        'show_in_rest' => true,
    ]);

    register_post_type('abz_service', [
        'labels' => [
            'name' => 'الخدمات',
            'singular_name' => 'خدمة',
            'add_new_item' => 'إضافة خدمة',
            'edit_item' => 'تعديل الخدمة',
            'all_items' => 'كل الخدمات',
        ],
        'public' => true,
        'has_archive' => 'services',
        'rewrite' => ['slug' => 'services', 'with_front' => false],
        'menu_icon' => 'dashicons-portfolio',
        'menu_position' => 22,
        'supports' => ['title', 'excerpt', 'editor', 'page-attributes', 'revisions'],
        'show_in_rest' => true,
    ]);

    register_post_type('abz_team', [
        'labels' => [
            'name' => 'الفريق',
            'singular_name' => 'عضو الفريق',
            'add_new_item' => 'إضافة عضو',
            'edit_item' => 'تعديل العضو',
            'all_items' => 'كل الأعضاء',
        ],
        'public' => false,
        'show_ui' => true,
        'menu_icon' => 'dashicons-groups',
        'menu_position' => 23,
        'supports' => ['title', 'excerpt', 'editor', 'thumbnail', 'page-attributes'],
        'show_in_rest' => true,
    ]);

    $private = [
        'public' => false,
        'show_ui' => true,
        'show_in_rest' => false,
        'exclude_from_search' => true,
        'publicly_queryable' => false,
        'supports' => ['title', 'editor'],
        'capability_type' => 'post',
        'capabilities' => ['create_posts' => 'do_not_allow'],
        'map_meta_cap' => true,
    ];
    register_post_type('abz_request', $private + [
        'labels' => [
            'name' => 'طلبات العملاء',
            'singular_name' => 'طلب',
            'all_items' => 'كل الطلبات',
            'edit_item' => 'عرض الطلب',
        ],
        'menu_icon' => 'dashicons-email-alt',
        'menu_position' => 3,
    ]);
    register_post_type('abz_subscriber', $private + [
        'labels' => [
            'name' => 'مشتركو النشرة',
            'singular_name' => 'مشترك',
            'all_items' => 'كل المشتركين',
            'edit_item' => 'عرض المشترك',
        ],
        'menu_icon' => 'dashicons-megaphone',
        'menu_position' => 4,
    ]);

    // حقول القطاع والخدمة والفريق تظهر في REST ليستطيع الوكلاء إنشاء مسودات كاملة
    foreach (['abz_sector' => ['abz_icon', 'abz_featured', 'abz_services', 'abz_en_name'], 'abz_service' => ['abz_icon', 'abz_deliverables', 'abz_audience'], 'abz_team' => ['abz_role', 'abz_highlights', 'abz_specialties', 'abz_pending']] as $type => $keys) {
        foreach ($keys as $key) {
            register_post_meta($type, $key, [
                'show_in_rest' => true,
                'single' => true,
                'type' => 'string',
                'auth_callback' => fn() => current_user_can('edit_posts'),
            ]);
        }
    }
}
add_action('init', 'abz_register_content_types', 5);

/** القائمة كأسطر — الحقول متعددة القيم تُحفظ نصاً، سطراً لكل عنصر، ليسهل تعديلها */
function abz_lines(int $post_id, string $key): array
{
    $raw = (string) get_post_meta($post_id, $key, true);
    return array_values(array_filter(array_map('trim', explode("\n", $raw)), 'strlen'));
}

/* صندوق حقول بسيط في محرّر القطاع والخدمة والعضو — بلا إضافة حقول خارجية */
add_action('add_meta_boxes', function () {
    $boxes = [
        'abz_sector' => ['abz_services' => 'الخدمات في هذا القطاع (سطر لكل خدمة)', 'abz_icon' => 'اسم الأيقونة', 'abz_en_name' => 'الاسم بالإنجليزية', 'abz_featured' => 'قطاع بارز؟ (1 = نعم)'],
        'abz_service' => ['abz_deliverables' => 'المخرجات (سطر لكل مخرج)', 'abz_audience' => 'لمن هذه الخدمة', 'abz_icon' => 'اسم الأيقونة'],
        'abz_team' => ['abz_role' => 'المسمّى الوظيفي', 'abz_highlights' => 'أبرز المؤهلات والخبرات (سطر لكل بند)', 'abz_specialties' => 'مجالات التخصّص (سطر لكل مجال)', 'abz_pending' => 'بانتظار اعتماد صاحب الملف لنصّ ملفه؟ (1 = نعم — تذكير للمالك فقط)'],
    ];
    foreach ($boxes as $type => $fields) {
        add_meta_box('abz_fields', 'بيانات إضافية', function ($post) use ($fields) {
            wp_nonce_field('abz_fields', 'abz_fields_nonce');
            foreach ($fields as $key => $label) {
                $value = (string) get_post_meta($post->ID, $key, true);
                printf('<p><label for="%1$s"><strong>%2$s</strong></label><br>', esc_attr($key), esc_html($label));
                if (str_contains($label, 'سطر')) {
                    printf('<textarea id="%1$s" name="%1$s" rows="6" style="width:100%%">%2$s</textarea></p>', esc_attr($key), esc_textarea($value));
                } else {
                    printf('<input id="%1$s" name="%1$s" value="%2$s" style="width:100%%"></p>', esc_attr($key), esc_attr($value));
                }
            }
        }, $type, 'normal', 'high');
    }
});

add_action('save_post', function ($post_id) {
    if (!isset($_POST['abz_fields_nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['abz_fields_nonce'])), 'abz_fields')) {
        return;
    }
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE || !current_user_can('edit_post', $post_id)) {
        return;
    }
    foreach (['abz_services', 'abz_icon', 'abz_en_name', 'abz_featured', 'abz_deliverables', 'abz_audience', 'abz_role', 'abz_highlights', 'abz_specialties', 'abz_pending'] as $key) {
        if (isset($_POST[$key])) {
            update_post_meta($post_id, $key, sanitize_textarea_field(wp_unslash($_POST[$key])));
        }
    }
});
