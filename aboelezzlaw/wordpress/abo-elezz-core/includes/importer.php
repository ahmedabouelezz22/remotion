<?php
if (!defined('ABSPATH')) {
    exit;
}

/**
 * يستورد المحتوى الأولي من seed/seed.json.
 *
 * قاعدة عدم الكتابة فوق عمل المالك: كل عنصر يُستورد يحمل بصمة لما كتبه
 * المستورد (_abz_seed_hash). عند إعادة الاستيراد يُحدَّث العنصر فقط إن بقي
 * كما تركه المستورد؛ فإن عدّله المالك من اللوحة تُرك على حاله.
 * العناصر التي حذفها المالك لا تُعاد (تُسجَّل في abz_seed_deleted).
 */

function abz_import_log(string $line): void
{
    $log = get_option('abz_import_log', []);
    $log[] = '[' . current_time('mysql') . '] ' . $line;
    update_option('abz_import_log', array_slice($log, -200), false);
}

/** يجد عنصراً بمفتاح الاستيراد */
function abz_find_seeded(string $post_type, string $key): ?WP_Post
{
    $found = get_posts([
        'post_type' => $post_type,
        'post_status' => 'any',
        'numberposts' => 1,
        'meta_key' => '_abz_seed_key',
        'meta_value' => $key,
        'suppress_filters' => true,
    ]);
    return $found[0] ?? null;
}

function abz_seed_fingerprint(array $post, array $meta): string
{
    return md5(wp_json_encode([$post['post_title'] ?? '', $post['post_content'] ?? '', $post['post_excerpt'] ?? '', $meta]));
}

function abz_current_fingerprint(WP_Post $post, array $meta_keys): string
{
    $meta = [];
    foreach ($meta_keys as $key) {
        $meta[$key] = get_post_meta($post->ID, $key, true);
    }
    return md5(wp_json_encode([$post->post_title, $post->post_content, $post->post_excerpt, $meta]));
}

/**
 * ينشئ العنصر أو يحدّثه إن لم يعدّله المالك. يرجع رقمه أو 0.
 * $meta: حقول تُكتب وتدخل في البصمة.
 */
function abz_upsert(string $key, array $post, array $meta = []): int
{
    $deleted = get_option('abz_seed_deleted', []);
    if (in_array($key, $deleted, true)) {
        return 0;
    }
    $post += ['post_status' => 'publish', 'post_excerpt' => '', 'post_content' => ''];
    // تطبيع المحتوى كما سيحفظه ووردبريس، فتتطابق البصمة بعد الحفظ
    $post['post_content'] = wp_unslash(wp_kses_post(wp_slash($post['post_content'])));
    $fingerprint = abz_seed_fingerprint($post, $meta);
    $existing = abz_find_seeded($post['post_type'], $key);

    if ($existing) {
        $stored = (string) get_post_meta($existing->ID, '_abz_seed_hash', true);
        if ($stored === $fingerprint) {
            return $existing->ID; // لا جديد
        }
        if ($stored !== abz_current_fingerprint($existing, array_keys($meta))) {
            abz_import_log("تُرك {$key}: عدّله المالك");
            return $existing->ID;
        }
        $post['ID'] = $existing->ID;
        unset($post['post_status'], $post['post_date']);
        $id = wp_update_post(wp_slash($post), true);
    } else {
        $id = wp_insert_post(wp_slash($post), true);
    }
    if (is_wp_error($id)) {
        abz_import_log("فشل {$key}: " . $id->get_error_message());
        return 0;
    }
    foreach ($meta as $meta_key => $value) {
        update_post_meta($id, $meta_key, wp_slash($value));
    }
    update_post_meta($id, '_abz_seed_key', $key);
    update_post_meta($id, '_abz_seed_hash', abz_current_fingerprint(get_post($id), array_keys($meta)));
    return (int) $id;
}

/* حذف المالك لعنصر مستورد يُحترم: لا يُعاد في الاستيراد التالي */
add_action('before_delete_post', function ($post_id) {
    $key = get_post_meta($post_id, '_abz_seed_key', true);
    if ($key) {
        $deleted = get_option('abz_seed_deleted', []);
        $deleted[] = $key;
        update_option('abz_seed_deleted', array_values(array_unique($deleted)), false);
    }
});
add_action('wp_trash_post', function ($post_id) {
    $key = get_post_meta($post_id, '_abz_seed_key', true);
    if ($key) {
        $deleted = get_option('abz_seed_deleted', []);
        $deleted[] = $key;
        update_option('abz_seed_deleted', array_values(array_unique($deleted)), false);
    }
});

function abz_list_html(array $items, string $class = ''): string
{
    if (!$items) {
        return '';
    }
    $html = '<ul' . ($class ? ' class="' . esc_attr($class) . '"' : '') . '>';
    foreach ($items as $item) {
        $html .= '<li>' . esc_html($item) . '</li>';
    }
    return $html . '</ul>';
}

function abz_import_seed(bool $force = false): void
{
    $seed = abz_seed();
    if (!$seed) {
        return;
    }
    $owner = get_users(['role' => 'administrator', 'number' => 1, 'orderby' => 'ID']);
    $author = $owner ? $owner[0]->ID : 1;

    // 1) بيانات المؤسسة — تُكتب أول مرة فقط
    if (!get_option('abz_settings')) {
        add_option('abz_settings', abz_default_settings());
    }

    // 2) إعدادات ووردبريس العامة
    update_option('blogname', $seed['site']['name'] ?? get_bloginfo('name'));
    update_option('blogdescription', $seed['site']['tagline'] ?? '');
    update_option('timezone_string', 'Africa/Cairo');
    update_option('date_format', 'j F Y');
    update_option('start_of_week', 6);
    if (!get_option('permalink_structure')) {
        update_option('permalink_structure', '/%postname%/');
    }
    update_option('default_comment_status', 'open');
    // النطاق التجريبي لا يُفهرس في محرّكات البحث حتى يُعتمد الإطلاق
    if (str_contains((string) wp_parse_url(home_url(), PHP_URL_HOST), 'hostingersite.com')) {
        update_option('blog_public', '0');
    }

    // مقال ووردبريس التجريبي («Hello world!») يُسحب إلى المسودات إن بقي على حاله
    $sample = get_page_by_path('hello-world', OBJECT, 'post');
    if ($sample && $sample->post_status === 'publish' && $sample->post_date === $sample->post_modified) {
        wp_update_post(['ID' => $sample->ID, 'post_status' => 'draft']);
        abz_import_log('سُحب المقال التجريبي «Hello world!» إلى المسودات');
    }
    // التصنيف الافتراضي باسم عربي واضح
    $default = get_term((int) get_option('default_category'), 'category');
    if ($default && !is_wp_error($default) && in_array($default->slug, ['uncategorized', 'غير-مصنف'], true)) {
        wp_update_term($default->term_id, 'category', ['name' => 'مقالات عامة', 'slug' => 'general']);
    }

    // 3) الصفحات
    $firm = $seed['firm'];
    $mv = $firm['missionValues'];
    $values_html = '';
    foreach ($mv['values'] as $value) {
        $values_html .= '<h3>' . esc_html($value['title']) . '</h3><p>' . esc_html($value['body']) . '</p>';
    }
    $careers_areas = '';
    foreach ($firm['careers']['areas'] as $area) {
        $careers_areas .= '<h3>' . esc_html($area['title']) . '</h3><p>' . esc_html($area['body']) . '</p>';
    }
    $pages = [
        'home' => ['الرئيسية', ''],
        'about' => [$firm['about']['title'], '<p class="lead">' . esc_html($firm['about']['lead']) . '</p>' . implode('', array_map(fn($p) => '<p>' . esc_html($p) . '</p>', $firm['about']['paragraphs']))],
        'mission-values' => [$mv['title'], '<h2>' . esc_html($mv['mission']['title']) . '</h2><p>' . esc_html($mv['mission']['body']) . '</p><h2>' . esc_html($mv['vision']['title']) . '</h2><p>' . esc_html($mv['vision']['body']) . '</p><h2>قيمنا</h2>' . $values_html . '<h2>أهدافنا</h2>' . abz_list_html($mv['goals'])],
        'team' => ['فريقنا', '<p class="lead">فريق يجمع الخبرة القانونية والتكوين الأكاديمي، ويعمل مع شبكة من المختصّين المرخَّصين في كل ولاية قضائية حيث يلزم.</p>'],
        'clients' => [$firm['clients']['title'], '<p class="lead">' . esc_html($firm['clients']['lead']) . '</p>'],
        'careers' => [$firm['careers']['title'], '<p class="lead">' . esc_html($firm['careers']['lead']) . '</p>' . $careers_areas . '<h2>كيف تتقدّم</h2><p>' . esc_html($firm['careers']['howToApply']) . '</p><p>' . esc_html($firm['careers']['note']) . '</p>'],
        'contact' => ['اتصل بنا', ''],
        'booking' => ['حجز استشارة', ''],
        'memberships' => ['العضويات', ''],
        'practice-areas' => ['مجالات الممارسة', ''],
        'marketplace' => [$firm['marketplace']['title'], '<p>' . esc_html($firm['marketplace']['disclaimer']) . '</p>'],
        'library' => ['المكتبة القانونية', ''],
        'privacy' => [$seed['legal']['privacy']['title'], $seed['legal']['privacy']['html']],
        'terms' => [$seed['legal']['terms']['title'], $seed['legal']['terms']['html']],
        'blog' => ['المدونة', ''],
    ];
    $page_ids = [];
    $order = 0;
    foreach ($pages as $slug => [$title, $content]) {
        $page_ids[$slug] = abz_upsert('page:' . $slug, [
            'post_type' => 'page',
            'post_name' => $slug,
            'post_title' => $title,
            'post_content' => $content,
            'post_author' => $author,
            'menu_order' => $order++,
            'comment_status' => 'closed',
        ]);
    }
    if ($page_ids['home'] && $page_ids['blog']) {
        update_option('show_on_front', 'page');
        update_option('page_on_front', $page_ids['home']);
        update_option('page_for_posts', $page_ids['blog']);
    }
    if ($page_ids['privacy']) {
        update_option('wp_page_for_privacy_policy', $page_ids['privacy']);
    }

    // 4) القطاعات
    foreach ($seed['sectors'] as $i => $sector) {
        abz_upsert('sector:' . $sector['slug'], [
            'post_type' => 'abz_sector',
            'post_name' => $sector['slug'],
            'post_title' => $sector['name'],
            'post_excerpt' => $sector['summary'],
            'menu_order' => $i,
        ], [
            'abz_services' => implode("\n", $sector['services']),
            'abz_icon' => $sector['icon'],
            'abz_featured' => !empty($sector['featured']) ? '1' : '',
            'abz_en_name' => $sector['en']['name'] ?? '',
        ]);
    }

    // 5) الخدمات الأساسية
    foreach ($seed['services'] as $i => $service) {
        abz_upsert('service:' . $service['slug'], [
            'post_type' => 'abz_service',
            'post_name' => $service['slug'],
            'post_title' => $service['title'],
            'post_excerpt' => $service['short'],
            'post_content' => '<p>' . esc_html($service['description']) . '</p>',
            'menu_order' => $i,
        ], [
            'abz_deliverables' => implode("\n", $service['deliverables']),
            'abz_audience' => $service['audience'],
            'abz_icon' => $service['icon'],
        ]);
    }

    // 6) الفريق
    foreach ($firm['team'] as $i => $member) {
        $id = abz_upsert('team:' . $member['slug'], [
            'post_type' => 'abz_team',
            'post_name' => $member['slug'],
            'post_title' => $member['name'],
            'post_excerpt' => $member['summary'],
            'menu_order' => $i,
        ], [
            'abz_role' => $member['role'],
            'abz_highlights' => implode("\n", $member['highlights']),
            'abz_specialties' => implode("\n", $member['specialties'] ?? []),
            'abz_pending' => !empty($member['pendingApproval']) ? '1' : '',
        ]);
        if ($id && !empty($member['photo']) && !has_post_thumbnail($id)) {
            $attachment = abz_import_media(basename($member['photo']), $member['name']);
            if ($attachment) {
                set_post_thumbnail($id, $attachment);
            }
        }
    }

    // 7) المقالات
    foreach ($seed['articles'] as $article) {
        $category = term_exists($article['category'], 'category') ?: wp_insert_term($article['category'], 'category');
        $category_id = is_array($category) ? (int) $category['term_id'] : 0;
        $id = abz_upsert('post:' . $article['slug'], [
            'post_type' => 'post',
            'post_name' => $article['slug'],
            'post_title' => $article['title'],
            'post_excerpt' => $article['excerpt'],
            'post_content' => $article['html'],
            'post_author' => $author,
            'post_date' => $article['publishedAt'] . ' 09:00:00',
            'post_category' => $category_id ? [$category_id] : [],
            'comment_status' => 'open',
        ], [
            'abz_sources' => wp_json_encode($article['sources'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            'abz_featured' => !empty($article['featured']) ? '1' : '',
        ]);
        if ($id) {
            wp_set_post_tags($id, $article['tags'], false);
        }
    }

    // 8) المتجر — بعد أن يكتمل تحميل WooCommerce، وإلا يُعاد الاستيراد في الطلب التالي
    if (abz_woo_active()) {
        if (!did_action('woocommerce_after_register_post_type')) {
            abz_import_log('تأجيل المتجر: WooCommerce لم يكتمل تحميله بعد');
            return;
        }
        abz_import_store($seed);
    }

    update_option('abz_seed_version', $seed['version'] ?? '');
    abz_import_log('اكتمل استيراد النسخة ' . ($seed['version'] ?? ''));
}

/** يرفع صورة من seed/media إلى المكتبة مرة واحدة */
function abz_import_media(string $file, string $title): int
{
    $existing = get_posts(['post_type' => 'attachment', 'numberposts' => 1, 'meta_key' => '_abz_media', 'meta_value' => $file]);
    if ($existing) {
        return $existing[0]->ID;
    }
    $source = ABZ_CORE_DIR . 'seed/media/' . $file;
    if (!is_readable($source)) {
        return 0;
    }
    $upload = wp_upload_bits($file, null, (string) file_get_contents($source));
    if (!empty($upload['error'])) {
        abz_import_log('فشل رفع الصورة ' . $file . ': ' . $upload['error']);
        return 0;
    }
    $id = wp_insert_attachment(['post_mime_type' => 'image/jpeg', 'post_title' => $title, 'post_status' => 'inherit'], $upload['file']);
    require_once ABSPATH . 'wp-admin/includes/image.php';
    wp_update_attachment_metadata($id, wp_generate_attachment_metadata($id, $upload['file']));
    update_post_meta($id, '_abz_media', $file);
    update_post_meta($id, '_wp_attachment_image_alt', $title);
    return (int) $id;
}

function abz_product_term(string $name, string $slug, int $parent = 0, string $description = ''): int
{
    $term = get_term_by('slug', $slug, 'product_cat');
    if ($term) {
        return (int) $term->term_id;
    }
    $created = wp_insert_term($name, 'product_cat', ['slug' => $slug, 'parent' => $parent, 'description' => $description]);
    return is_wp_error($created) ? 0 : (int) $created['term_id'];
}

/** ينسخ ملف التحميل إلى مجلّد WooCommerce المحمي ويرجع رابطه */
function abz_download_url(string $file): string
{
    $source = ABZ_CORE_DIR . 'seed/downloads/' . $file;
    if (!is_readable($source)) {
        return '';
    }
    $uploads = wp_upload_dir();
    $dir = trailingslashit($uploads['basedir']) . 'woocommerce_uploads/abz';
    wp_mkdir_p($dir);
    if (!file_exists($dir . '/.htaccess')) {
        file_put_contents($dir . '/.htaccess', "deny from all\n");
    }
    $target = $dir . '/' . $file;
    if (!file_exists($target) || md5_file($target) !== md5_file($source)) {
        copy($source, $target);
    }
    return trailingslashit($uploads['baseurl']) . 'woocommerce_uploads/abz/' . $file;
}

function abz_import_store(array $seed): void
{
    update_option('woocommerce_currency', 'EGP');
    update_option('woocommerce_default_country', 'EG');
    update_option('woocommerce_enable_reviews', 'yes');
    update_option('woocommerce_file_download_method', 'force');
    update_option('woocommerce_downloads_grant_access_after_payment', 'yes');
    update_option('woocommerce_price_num_decimals', '0');
    update_option('woocommerce_currency_pos', 'right_space');

    $category_slugs = array_flip($seed['site']['categoryKeys'] ?? []);
    $keys = [
        'الاستشارات' => 'consultations', 'الخدمات القانونية' => 'legal-services', 'الامتثال الرقمي' => 'digital-compliance',
        'نماذج ووثائق' => 'templates', 'كتب وأبحاث' => 'books', 'باقات الشركات' => 'retainers',
    ];
    $annual = (int) ($seed['memberships']['annualMonthsCharged'] ?? 10);

    foreach ($seed['products'] as $i => $p) {
        $cat = abz_product_term($p['category'], $keys[$p['category']] ?? sanitize_title($p['slug']));
        $is_subscription = $p['kind'] === 'subscription';
        $existing = abz_find_seeded('product', 'product:' . $p['slug']);
        $edited = $existing && (string) get_post_meta($existing->ID, '_abz_seed_hash', true) !== md5((string) $existing->post_modified_gmt);
        if ($existing && $edited) {
            continue; // عدّله المالك من المتجر
        }
        $product = $existing ? wc_get_product($existing->ID) : ($is_subscription ? new WC_Product_Variable() : new WC_Product_Simple());
        if (!$product) {
            continue;
        }
        $product->set_name($p['name']);
        $product->set_slug($p['slug']);
        $product->set_status('publish');
        $product->set_menu_order($i);
        $product->set_short_description('<p>' . esc_html($p['summary']) . '</p>');
        $product->set_description('<p>' . esc_html($p['description']) . '</p>' . abz_list_html($p['highlights']));
        $product->set_category_ids($cat ? [$cat] : []);
        $product->set_featured(!empty($p['featured']));
        $product->set_reviews_allowed(true);
        $product->set_virtual($p['kind'] !== 'physical');
        if ($p['kind'] === 'physical') {
            $product->set_virtual(false);
        }
        if (!$is_subscription) {
            $regular = !empty($p['compareAtPrice']) ? $p['compareAtPrice'] : $p['price'];
            $product->set_regular_price((string) $regular);
            $product->set_sale_price(!empty($p['compareAtPrice']) ? (string) $p['price'] : '');
        }
        if ($p['kind'] === 'digital' && !empty($p['file'])) {
            $url = abz_download_url($p['file']);
            if ($url) {
                $download = new WC_Product_Download();
                $download->set_id(md5($p['file']));
                $download->set_name($p['name']);
                $download->set_file($url);
                $product->set_downloadable(true);
                $product->set_downloads([$download]);
                $product->set_download_limit(5);
                $product->set_download_expiry(30);
            }
        }
        $id = $product->save();

        if ($is_subscription) {
            // اشتراك شهري أو سنوي (السنوي بـ $annual أشهر) — دفع مقدَّم بلا خصم تلقائي من البطاقة
            $attribute = new WC_Product_Attribute();
            $attribute->set_name('مدة الاشتراك');
            $attribute->set_options(['شهري', 'سنوي']);
            $attribute->set_visible(true);
            $attribute->set_variation(true);
            $product->set_attributes([$attribute]);
            $product->save();
            $existing_variations = $product->get_children();
            foreach (['شهري' => (float) $p['price'], 'سنوي' => (float) $p['price'] * $annual] as $period => $price) {
                $variation = null;
                foreach ($existing_variations as $child) {
                    $candidate = wc_get_product($child);
                    if ($candidate && $candidate->get_attribute('مدة الاشتراك') === $period) {
                        $variation = $candidate;
                    }
                }
                $variation = $variation ?: new WC_Product_Variation();
                $variation->set_parent_id($id);
                $variation->set_attributes([sanitize_title('مدة الاشتراك') => $period]);
                $variation->set_regular_price((string) $price);
                $variation->set_virtual(true);
                $variation->set_status('publish');
                $variation->save();
            }
            WC_Product_Variable::sync($id);
        }

        update_post_meta($id, '_abz_seed_key', 'product:' . $p['slug']);
        update_post_meta($id, '_abz_coming_soon', !empty($p['comingSoon']) ? '1' : '');
        update_post_meta($id, '_abz_requires_booking', !empty($p['requiresBooking']) ? '1' : '');
        update_post_meta($id, '_abz_badge', $p['badge'] ?? '');
        clean_post_cache($id);
        update_post_meta($id, '_abz_seed_hash', md5((string) get_post($id)->post_modified_gmt));
    }

    // سوق مستلزمات المحامين: فئات بلا منتجات حتى يُتعاقد مع موردين
    $market = $seed['firm']['marketplace'];
    $root = abz_product_term($market['title'], 'lawyers-marketplace', 0, $market['disclaimer']);
    foreach ($market['categories'] as $category) {
        abz_product_term($category['title'], 'market-' . $category['slug'], $root, $category['body']);
    }
}
