<?php
if (!defined('ABSPATH')) {
    exit;
}

/* بدائل آمنة إن لم تكن إضافة Abo Elezz Core مفعّلة */
if (!function_exists('abz_setting')) {
    function abz_setting(string $key, $default = '') { return $default; }
}
if (!function_exists('abz_data')) {
    function abz_data(string $path, $default = null) { return $default; }
}
if (!function_exists('abz_wa_link')) {
    function abz_wa_link(string $message = '', string $number = ''): string
    {
        return 'https://wa.me/' . preg_replace('/\D+/', '', $number ?: '201157844664') . ($message ? '?text=' . rawurlencode($message) : '');
    }
}
if (!function_exists('abz_social_links')) {
    function abz_social_links(): array { return []; }
}
if (!function_exists('abz_lines')) {
    function abz_lines(int $post_id, string $key): array
    {
        return array_values(array_filter(array_map('trim', explode("\n", (string) get_post_meta($post_id, $key, true))), 'strlen'));
    }
}

/** أيقونة SVG من مجموعة القالب */
function abz_icon(string $name, string $class = 'h-5 w-5'): string
{
    $paths = abz_icon_paths();
    $inner = $paths[$name] ?? $paths['info'];
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="' . esc_attr($class) . '" aria-hidden="true" focusable="false">' . $inner . '</svg>';
}

/** سهم «إلى الأمام» — يشير يساراً في العربية */
function abz_arrow(string $class = 'h-4 w-4'): string
{
    return abz_icon(is_rtl() ? 'arrow-left' : 'arrow-right', $class);
}

function abz_url(string $slug): string
{
    return home_url('/' . trim($slug, '/') . '/');
}

function abz_shop_url(string $category = ''): string
{
    if ($category !== '' && taxonomy_exists('product_cat')) {
        $term = get_term_by('slug', $category, 'product_cat');
        if ($term) {
            return (string) get_term_link($term);
        }
    }
    return function_exists('wc_get_page_permalink') ? wc_get_page_permalink('shop') : abz_url('shop');
}

/** زرّ رابط بأنماط ثابتة */
function abz_button(string $href, string $label, string $variant = 'primary', string $size = 'md', string $extra = '', bool $external = false): string
{
    $variants = [
        'primary' => 'bg-navy-900 text-white hover:bg-navy-800 shadow-sm',
        'gold' => 'bg-gold-500 text-navy-950 hover:bg-gold-400 shadow-sm',
        'outline' => 'border-2 border-navy-900 text-navy-900 hover:bg-navy-900 hover:text-white',
        'outline-light' => 'border-2 border-white text-white hover:bg-white hover:text-navy-900',
        'ghost' => 'text-navy-900 hover:bg-navy-50',
        'whatsapp' => 'bg-whatsapp-600 text-white hover:bg-whatsapp-700 shadow-sm',
    ];
    $sizes = [
        'sm' => 'min-h-[44px] px-4 py-2 text-sm',
        'md' => 'min-h-[48px] px-6 py-3 text-[0.95rem]',
        'lg' => 'min-h-[56px] px-8 py-4 text-base',
    ];
    $class = 'inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all duration-200 ' . ($variants[$variant] ?? $variants['primary']) . ' ' . ($sizes[$size] ?? $sizes['md']) . ' ' . $extra;
    $rel = $external ? ' target="_blank" rel="noopener"' : '';
    return '<a href="' . esc_url($href) . '" class="' . esc_attr($class) . '"' . $rel . '>' . $label . '</a>';
}

function abz_section_heading(string $eyebrow, string $title, string $description = '', string $align = 'center', bool $inverted = false, string $tag = 'h2'): void
{
    $wrap = $align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl text-start';
    echo '<div class="' . esc_attr($wrap) . '">';
    if ($eyebrow) {
        echo '<p class="mb-3 text-sm font-bold tracking-[0.18em] ' . ($inverted ? 'text-gold-300' : 'text-gold-600') . '">' . esc_html($eyebrow) . '</p>';
    }
    printf('<%1$s class="text-2xl sm:text-3xl lg:text-[2.1rem] %2$s">%3$s</%1$s>', tag_escape($tag), $inverted ? 'text-white' : 'text-navy-900', esc_html($title));
    if ($description) {
        echo '<p class="mt-4 text-[1.02rem] leading-9 ' . ($inverted ? 'text-navy-100' : 'text-slate-600') . '">' . esc_html($description) . '</p>';
    }
    echo '</div>';
}

/** رأس الصفحات الداخلية */
function abz_page_hero(string $eyebrow, string $title, string $lead = '', array $crumbs = [], string $photo = ''): void
{
    ?>
    <section class="relative isolate overflow-hidden bg-navy-950 text-white">
      <div aria-hidden="true" class="pointer-events-none absolute inset-0 -z-10">
        <?php if ($photo) : ?>
          <img src="<?php echo esc_url(abz_img($photo)); ?>" alt="" class="absolute inset-0 h-full w-full object-cover opacity-35" fetchpriority="high">
          <div class="absolute inset-0 bg-gradient-to-l from-navy-950 via-navy-950/85 to-navy-950/55"></div>
        <?php endif; ?>
        <div class="abz-drift absolute top-0 start-[-8%] h-[26rem] w-[26rem] rounded-full bg-forest-600/40 blur-[110px]"></div>
        <div class="abz-grid absolute inset-0"></div>
      </div>
      <div class="mx-auto w-full max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
        <?php if ($crumbs) : ?>
          <nav aria-label="مسار التصفّح" class="mb-5 text-sm text-navy-100">
            <a class="hover:text-gold-300" href="<?php echo esc_url(home_url('/')); ?>">الرئيسية</a>
            <?php foreach ($crumbs as [$label, $href]) : ?>
              <span class="mx-1.5 opacity-60">/</span>
              <?php if ($href) : ?><a class="hover:text-gold-300" href="<?php echo esc_url($href); ?>"><?php echo esc_html($label); ?></a><?php else : ?><span aria-current="page"><?php echo esc_html($label); ?></span><?php endif; ?>
            <?php endforeach; ?>
          </nav>
        <?php endif; ?>
        <?php if ($eyebrow) : ?><p class="mb-3 text-sm font-bold tracking-[0.18em] text-gold-300"><?php echo esc_html($eyebrow); ?></p><?php endif; ?>
        <h1 class="max-w-4xl text-3xl leading-[1.35] sm:text-4xl lg:text-[2.9rem]"><?php echo esc_html($title); ?></h1>
        <?php if ($lead) : ?><p class="mt-5 max-w-3xl text-[1.05rem] leading-9 text-navy-100"><?php echo esc_html($lead); ?></p><?php endif; ?>
      </div>
    </section>
    <?php
}

/** رابط صورة من مجموعة صور القالب */
function abz_img(string $key): string
{
    return get_template_directory_uri() . '/assets/img/' . $key . '.webp';
}

/** صورة بغلاف متدرّج وأيقونة — تُستخدم في بطاقات الخدمات والقطاعات والمتجر */
function abz_cover(string $photo, string $icon = '', string $ratio = 'aspect-[16/10]', string $extra = ''): string
{
    $html = '<span class="abz-cover relative block overflow-hidden ' . esc_attr($ratio . ' ' . $extra) . '">';
    $html .= '<img src="' . esc_url(abz_img($photo ?: 'lawbooks')) . '" alt="" loading="lazy" decoding="async" width="1200" height="750" class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105">';
    $html .= '<span class="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-navy-950/20 to-transparent"></span>';
    if ($icon) {
        $html .= '<span class="absolute bottom-3 start-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gold-500 text-navy-950 shadow-lg">' . abz_icon($icon, 'h-5 w-5') . '</span>';
    }
    return $html . '</span>';
}

function abz_sector_photo(string $slug): string
{
    return (string) (abz_data('platform.sectorPhotos', [])[$slug] ?? 'meeting');
}

function abz_service_photo(string $slug): string
{
    return (string) (abz_data('platform.servicePhotos', [])[$slug] ?? 'lawbooks');
}

function abz_category_photo(string $slug): string
{
    $slug = preg_replace('/^market-/', '', $slug);
    return (string) (abz_data('platform.categoryPhotos', [])[$slug] ?? 'lawbooks');
}

/** صورة المنتج: من فئته */
function abz_product_photo(int $product_id): string
{
    $terms = function_exists('wc_get_product') ? wp_get_post_terms($product_id, 'product_cat') : [];
    return $terms && !is_wp_error($terms) ? abz_category_photo($terms[0]->slug) : 'lawbooks';
}

/** القطاعات مرتّبة في مجموعاتها: [ [title, photo, WP_Post[]], ... ] */
function abz_sector_groups(): array
{
    $posts = [];
    foreach (get_posts(['post_type' => 'abz_sector', 'numberposts' => 60, 'orderby' => 'menu_order', 'order' => 'ASC']) as $sector) {
        $posts[$sector->post_name] = $sector;
    }
    $groups = [];
    foreach ((array) abz_data('platform.sectorGroups', []) as $group) {
        $items = [];
        foreach ($group['slugs'] as $slug) {
            if (isset($posts[$slug])) {
                $items[] = $posts[$slug];
                unset($posts[$slug]);
            }
        }
        if ($items) {
            $groups[] = ['title' => $group['title'], 'photo' => $group['photo'], 'key' => $group['key'], 'items' => $items];
        }
    }
    if ($posts) {
        $groups[] = ['title' => 'قطاعات أخرى', 'photo' => 'meeting', 'key' => 'other', 'items' => array_values($posts)];
    }
    return $groups;
}

function abz_account_url(string $type = ''): string
{
    $url = function_exists('wc_get_page_permalink') ? wc_get_page_permalink('myaccount') : wp_registration_url();
    return $type ? add_query_arg('type', $type, $url) : $url;
}

/** هيكل القائمة الرئيسية بقوائمها المنسدلة */
function abz_nav(): array
{
    $services = get_posts(['post_type' => 'abz_service', 'numberposts' => 12, 'orderby' => 'menu_order', 'order' => 'ASC']);
    $store = [['المتجر كله', abz_shop_url()]];
    foreach (['consultations' => 'الاستشارات', 'legal-services' => 'الخدمات القانونية', 'templates' => 'نماذج ووثائق — تحميل فوري', 'digital-compliance' => 'الامتثال الرقمي', 'books' => 'كتب وأبحاث', 'retainers' => 'باقات الشركات', 'tourist-plans' => 'باقات السياح'] as $slug => $label) {
        $store[] = [$label, abz_shop_url($slug)];
    }
    $store[] = ['سوق مستلزمات المحامين', abz_url('marketplace')];
    $store[] = ['سيارات للمحامين', abz_url('marketplace') . '#cars'];

    return [
        ['label' => 'من نحن', 'items' => [
            ['عن المؤسسة', abz_url('about')],
            ['رسالتنا وقيمنا وأهدافنا', abz_url('mission-values')],
            ['فريقنا', abz_url('team')],
            ['عملاؤنا', abz_url('clients')],
            ['الانضمام إلى الفريق والشبكة', abz_url('careers')],
            ['ادعم المنصّة', abz_url('support')],
        ]],
        ['label' => 'الخدمات', 'wide' => true, 'columns' => [
            ['title' => 'خدماتنا الأساسية', 'items' => array_merge(array_map(fn($p) => [$p->post_title, get_permalink($p)], $services), [['كل الخدمات', get_post_type_archive_link('abz_service') ?: abz_url('services')]])],
            ['title' => 'حلول بحسب العميل', 'items' => [
                ['للأفراد — استشارة بموعد', abz_url('booking')],
                ['للشركات — إدارة قانونية خارجية', abz_shop_url('retainers')],
                ['لمكاتب وشركات المحاماة — إسناد الأعمال', abz_url('law-firms')],
                ['للسياح والزائرين — باقات الحماية القانونية', abz_url('memberships') . '#tourists'],
                ['للموردين — انضم إلى سوق المستلزمات', abz_url('register') . '#supplier'],
                ['فروع القانون التي نعمل فيها', abz_url('practice-areas')],
            ]],
        ]],
        ['label' => 'القطاعات', 'wide' => true, 'groups' => abz_sector_groups()],
        ['label' => 'المتجر', 'items' => $store],
        ['label' => 'العضويات', 'href' => abz_url('memberships')],
        ['label' => 'المعرفة', 'items' => [
            ['المدونة', abz_url('blog')],
            ['المكتبة القانونية', abz_url('library')],
            ['ألعاب وألغاز قانونية', abz_url('games')],
            ['قاعدة الأحكام القضائية', '', 'قريباً'],
            ['قاعدة التشريعات', '', 'قريباً'],
            ['الأكاديمية', '', 'قريباً'],
        ]],
        ['label' => 'اتصل بنا', 'href' => abz_url('contact')],
    ];
}

/** أيقونات حسابات التواصل */
function abz_social_icons(string $variant = 'dark', string $size = 'h-10 w-10'): void
{
    $icons = ['facebook' => 'facebook', 'instagram' => 'instagram', 'tiktok' => 'tiktok', 'x' => 'x-brand', 'youtube' => 'youtube', 'telegram' => 'telegram', 'whatsapp_channel' => 'message-circle', 'linkedin' => 'linkedin', 'snapchat' => 'ghost', 'threads' => 'at-sign'];
    $links = abz_social_links();
    if (!$links) {
        return;
    }
    $class = $variant === 'dark'
        ? 'border-white/15 text-navy-100 hover:border-gold-400 hover:text-gold-300'
        : 'border-sand-200 bg-white text-navy-900 hover:border-gold-500 hover:text-gold-600';
    echo '<ul class="flex flex-wrap gap-2">';
    foreach ($links as $link) {
        printf(
            '<li><a href="%1$s" target="_blank" rel="noopener me" class="inline-flex %2$s items-center justify-center rounded-full border transition-colors %3$s" aria-label="%4$s" title="%4$s">%5$s</a></li>',
            esc_url($link['url']),
            esc_attr($size),
            esc_attr($class),
            esc_attr($link['label']),
            abz_icon($icons[$link['key']] ?? 'link', 'h-[18px] w-[18px]') // phpcs:ignore
        );
    }
    echo '</ul>';
}

function abz_phone_link(string $local, string $class = ''): string
{
    $digits = preg_replace('/\D+/', '', $local);
    $intl = str_starts_with($digits, '0') ? '+20' . substr($digits, 1) : '+' . $digits;
    return '<a class="numeric ' . esc_attr($class) . '" dir="ltr" href="tel:' . esc_attr($intl) . '">' . esc_html($intl) . '</a>';
}

/** صورة رمزية بالأحرف الأولى حين لا صورة */
function abz_initials(string $name): string
{
    $parts = preg_split('/\s+/u', trim($name));
    $first = mb_substr($parts[0] ?? '', 0, 1);
    $last = count($parts) > 1 ? mb_substr(end($parts), 0, 1) : '';
    return $first . ($last ? ' ' . $last : '');
}

/** تاريخ قراءة تقديري بالدقائق */
function abz_reading_minutes(string $content): int
{
    $words = count(preg_split('/\s+/u', trim(wp_strip_all_tags($content))) ?: []);
    return max(1, (int) round($words / 180));
}
