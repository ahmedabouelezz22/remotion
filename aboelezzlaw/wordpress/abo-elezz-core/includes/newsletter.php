<?php
if (!defined('ABSPATH')) {
    exit;
}

/**
 * النشرة البريدية بتأكيد مزدوج: يُحفظ البريد «بانتظار التأكيد» ويُرسل إليه
 * رابط تأكيد؛ لا يُعدّ مشتركاً حتى يضغطه. كل رسالة تحمل رابط إلغاء.
 * المشتركون في «مشتركو النشرة» مع تصدير CSV.
 */

add_shortcode('abz_newsletter', function ($atts) {
    $atts = shortcode_atts(['variant' => 'light'], $atts);
    $state = sanitize_key((string) ($_GET['abz_nl'] ?? ''));
    $dark = $atts['variant'] === 'dark';
    $messages = [
        'check' => 'أرسلنا إليك رابط تأكيد. افتح بريدك واضغط الرابط لإتمام الاشتراك.',
        'confirmed' => 'تمّ تأكيد اشتراكك في النشرة. شكراً لك.',
        'unsubscribed' => 'ألغينا اشتراكك ولن تصلك النشرة بعد الآن.',
        'invalid' => 'البريد غير صحيح، أو أن الرابط منتهي الصلاحية.',
        'rate' => 'محاولات كثيرة. حاول لاحقاً.',
    ];
    ob_start(); ?>
    <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>" class="abz-newsletter flex w-full flex-col gap-3 sm:flex-row" id="abz-newsletter">
      <input type="hidden" name="action" value="abz_newsletter">
      <?php wp_nonce_field('abz_newsletter', '_abz_nl'); ?>
      <div class="hidden" aria-hidden="true"><input type="text" name="website" tabindex="-1" autocomplete="off"></div>
      <label class="sr-only" for="abz-nl-email">بريدك الإلكتروني</label>
      <input id="abz-nl-email" type="email" name="email" required dir="ltr" placeholder="name@example.com" class="min-h-[52px] flex-1 rounded-xl border <?php echo $dark ? 'border-white/20 bg-white/10 text-white placeholder:text-navy-100' : 'border-sand-200 bg-white text-navy-900 placeholder:text-slate-500'; ?> px-4 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/30">
      <button type="submit" class="min-h-[52px] rounded-xl bg-gold-500 px-6 font-bold text-navy-950 hover:bg-gold-400">اشترك في النشرة</button>
    </form>
    <?php if (isset($messages[$state])) : ?>
      <p class="mt-3 text-sm font-semibold <?php echo $dark ? 'text-gold-300' : 'text-forest-600'; ?>" role="status"><?php echo esc_html($messages[$state]); ?></p>
    <?php endif; ?>
    <p class="mt-2 text-xs <?php echo $dark ? 'text-navy-100' : 'text-slate-600'; ?>">تحليلات وتحديثات تشريعية مختارة. يمكنك إلغاء الاشتراك في أي وقت.</p>
    <?php
    return (string) ob_get_clean();
});

function abz_subscriber_by(string $key, string $value): ?WP_Post
{
    $found = get_posts([
        'post_type' => 'abz_subscriber',
        'post_status' => 'any',
        'numberposts' => 1,
        'meta_key' => $key,
        'meta_value' => $value,
    ]);
    return $found[0] ?? null;
}

add_action('admin_post_nopriv_abz_newsletter', 'abz_handle_newsletter');
add_action('admin_post_abz_newsletter', 'abz_handle_newsletter');

function abz_handle_newsletter(): void
{
    $back = remove_query_arg('abz_nl', wp_get_referer() ?: home_url('/'));
    $go = fn(string $state) => wp_safe_redirect(add_query_arg('abz_nl', $state, $back) . '#abz-newsletter') && exit;

    if (!wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['_abz_nl'] ?? '')), 'abz_newsletter')) {
        $go('invalid');
    }
    if (!empty($_POST['website'])) {
        $go('check');
    }
    $email = strtolower(sanitize_email(wp_unslash($_POST['email'] ?? '')));
    if (!is_email($email)) {
        $go('invalid');
    }
    if (!abz_rate_limit('newsletter', 5, HOUR_IN_SECONDS)) {
        $go('rate');
    }

    $existing = abz_subscriber_by('abz_email', $email);
    if ($existing && get_post_meta($existing->ID, 'abz_status', true) === 'confirmed') {
        $go('check'); // لا نكشف إن كان البريد مشتركاً أصلاً
    }
    $token = wp_generate_password(32, false);
    if ($existing) {
        $post_id = $existing->ID;
    } else {
        $post_id = wp_insert_post(['post_type' => 'abz_subscriber', 'post_status' => 'private', 'post_title' => $email], true);
        if (is_wp_error($post_id)) {
            $go('invalid');
        }
        update_post_meta($post_id, 'abz_email', $email);
    }
    update_post_meta($post_id, 'abz_status', 'pending');
    update_post_meta($post_id, 'abz_token', hash('sha256', $token));

    $confirm = add_query_arg(['abz_confirm' => $token], home_url('/'));
    wp_mail(
        $email,
        'أكّد اشتراكك في نشرة ' . get_bloginfo('name'),
        "شكراً لاهتمامك بنشرة " . get_bloginfo('name') . ".\n\nلتأكيد الاشتراك اضغط الرابط التالي:\n" . $confirm . "\n\nإن لم تطلب الاشتراك فتجاهل هذه الرسالة ولن يُسجَّل بريدك.",
        ['Content-Type: text/plain; charset=UTF-8']
    );
    $go('check');
}

/* التأكيد والإلغاء عبر روابط البريد */
add_action('template_redirect', function () {
    foreach (['abz_confirm' => 'confirmed', 'abz_unsub' => 'unsubscribed'] as $param => $state) {
        if (empty($_GET[$param])) {
            continue;
        }
        $token = sanitize_text_field(wp_unslash($_GET[$param]));
        $subscriber = abz_subscriber_by('abz_token', hash('sha256', $token));
        if (!$subscriber) {
            wp_safe_redirect(add_query_arg('abz_nl', 'invalid', home_url('/')) . '#abz-newsletter');
            exit;
        }
        update_post_meta($subscriber->ID, 'abz_status', $state);
        if ($state === 'confirmed') {
            update_post_meta($subscriber->ID, 'abz_confirmed_at', current_time('mysql'));
        }
        wp_safe_redirect(add_query_arg('abz_nl', $state, home_url('/')) . '#abz-newsletter');
        exit;
    }
});

/* أعمدة اللوحة وتصدير CSV للمشتركين المؤكَّدين فقط */
add_filter('manage_abz_subscriber_posts_columns', fn($c) => ['cb' => $c['cb'], 'title' => 'البريد', 'abz_status' => 'الحالة', 'date' => 'التاريخ']);
add_action('manage_abz_subscriber_posts_custom_column', function ($column, $post_id) {
    $labels = ['pending' => 'بانتظار التأكيد', 'confirmed' => 'مؤكَّد', 'unsubscribed' => 'ألغى الاشتراك'];
    $status = (string) get_post_meta($post_id, 'abz_status', true);
    echo esc_html($labels[$status] ?? $status);
}, 10, 2);

add_action('admin_menu', function () {
    add_submenu_page('edit.php?post_type=abz_subscriber', 'تصدير المشتركين', 'تصدير CSV', 'manage_options', 'abz-export', function () {
        $url = wp_nonce_url(admin_url('admin-post.php?action=abz_export_subscribers'), 'abz_export');
        echo '<div class="wrap"><h1>تصدير المشتركين</h1><p>ملف CSV بالمشتركين الذين أكّدوا بريدهم فقط.</p><p><a class="button button-primary" href="' . esc_url($url) . '">تنزيل الملف</a></p></div>';
    });
});
add_action('admin_post_abz_export_subscribers', function () {
    if (!current_user_can('manage_options') || !check_admin_referer('abz_export')) {
        wp_die('غير مسموح');
    }
    header('Content-Type: text/csv; charset=UTF-8');
    header('Content-Disposition: attachment; filename="subscribers.csv"');
    $out = fopen('php://output', 'w');
    fwrite($out, "\xEF\xBB\xBF");
    fputcsv($out, ['email', 'confirmed_at']);
    foreach (get_posts(['post_type' => 'abz_subscriber', 'post_status' => 'any', 'numberposts' => -1, 'meta_key' => 'abz_status', 'meta_value' => 'confirmed']) as $post) {
        fputcsv($out, [get_post_meta($post->ID, 'abz_email', true), get_post_meta($post->ID, 'abz_confirmed_at', true)]);
    }
    exit;
});
