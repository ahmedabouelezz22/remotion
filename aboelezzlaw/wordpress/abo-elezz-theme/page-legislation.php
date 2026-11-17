<?php
/* قاعدة التشريعات: ملفات PDF يرفعها المالك */
if (!defined('ABSPATH')) {
    exit;
}
get_header();
the_post();
abz_page_hero('المعرفة', 'قاعدة التشريعات', 'قوانين ولوائح وقرارات بصيغة PDF مع الجهة المُصدِرة والرقم والسنة. العرض والتحميل بحسب إعدادات كل ملف.', [['التشريعات', '']], 'books');
get_template_part('template-parts/doc-library', null, ['section' => 'legislation']);
get_footer();
