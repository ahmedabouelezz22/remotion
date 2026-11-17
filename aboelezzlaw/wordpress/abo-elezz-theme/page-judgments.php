<?php
/* قاعدة الأحكام القضائية: ملفات PDF يرفعها المالك */
if (!defined('ABSPATH')) {
    exit;
}
get_header();
the_post();
abz_page_hero('المعرفة', 'قاعدة الأحكام القضائية', 'أحكام ومبادئ قضائية بصيغة PDF مع بيانات المحكمة ورقم الطعن والسنة. العرض والتحميل بحسب إعدادات كل ملف.', [['الأحكام القضائية', '']], 'justice');
get_template_part('template-parts/doc-library', null, ['section' => 'judgments']);
get_footer();
