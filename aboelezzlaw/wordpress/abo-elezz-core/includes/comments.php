<?php
if (!defined('ABSPATH')) {
    exit;
}

/**
 * «أسئلة القرّاء وردود المكتب»: تعليقات المقالات تُراجع قبل نشرها دائماً،
 * ولا تُقبل روابط في التعليق، ويُطلب الاسم والبريد. هذه الإعدادات تُفرض
 * هنا لا في لوحة الإعدادات، فلا يُفتح النشر التلقائي سهواً.
 */
add_filter('pre_option_comment_moderation', fn() => '1');
add_filter('pre_option_require_name_email', fn() => '1');
add_filter('pre_option_comment_registration', fn() => '0');
add_filter('pre_option_comments_notify', fn() => '1');
add_filter('pre_option_moderation_notify', fn() => '1');
add_filter('pre_option_comment_max_links', fn() => '0');

/* التعليقات على المقالات فقط — لا على الصفحات والقطاعات */
add_filter('comments_open', function ($open, $post_id) {
    return get_post_type($post_id) === 'post' ? $open : false;
}, 10, 2);

/* إشعار التعليقات الجديدة يصل إلى بريد المؤسسة */
add_filter('comment_moderation_recipients', function ($emails) {
    $notify = (string) abz_setting('notify_email', '');
    return $notify !== '' ? array_unique(array_merge($emails, [$notify])) : $emails;
});

/* حقول النموذج بالعربية وحقل «الموقع» محذوف */
add_filter('comment_form_default_fields', function ($fields) {
    unset($fields['url'], $fields['cookies']);
    return $fields;
});
