<?php
if (!defined('ABSPATH')) {
    exit;
}

/**
 * معالجة متن المقال: معرّفات للعناوين (لجدول المحتويات)، ودعوة للحجز في
 * منتصف المقال. لا تُعدّل النصّ المحفوظ — تعمل وقت العرض فقط.
 */

/** يرجع [المتن المعدّل، قائمة العناوين] */
function abz_prepare_article(string $html): array
{
    $toc = [];
    $index = 0;
    $html = preg_replace_callback('/<h2([^>]*)>(.*?)<\/h2>/su', function ($m) use (&$toc, &$index) {
        $index++;
        $id = 'section-' . $index;
        $toc[] = ['id' => $id, 'title' => wp_strip_all_tags($m[2])];
        $attrs = preg_replace('/\sid="[^"]*"/', '', $m[1]);
        return '<h2 id="' . $id . '"' . $attrs . '>' . $m[2] . '</h2>';
    }, $html);

    // الدعوة قبل العنوان الثالث، أو بعد الفقرة الرابعة إن قلّت العناوين
    $cta = abz_inline_cta_html();
    if ($index >= 3) {
        $html = preg_replace('/<h2 id="section-3"/', $cta . '<h2 id="section-3"', $html, 1);
    } else {
        $count = 0;
        $html = preg_replace_callback('/<\/p>/', function ($m) use (&$count, $cta) {
            $count++;
            return $count === 4 ? '</p>' . $cta : '</p>';
        }, $html);
    }
    return [$html, $toc];
}

function abz_inline_cta_html(): string
{
    $wa = abz_wa_link('السلام عليكم، قرأت مقالاً على موقعكم وأودّ استشارة في مسألتي.');
    return '<aside class="abz-inline-cta not-prose" aria-label="طلب استشارة">'
        . '<p class="text-sm font-bold tracking-[0.15em] !text-gold-300">مسألتك تحتاج رأياً مختصاً؟</p>'
        . '<p class="mt-2 text-lg font-extrabold !text-white">المقال يشرح القاعدة العامة، والحلّ يتوقّف على وقائعك ومستنداتك.</p>'
        . '<p class="mt-1.5 leading-8">أرسل تفاصيل مسألتك لدراسة نطاق الخدمة وتحديد الأتعاب، أو احجز موعداً مع مستشار قانوني.</p>'
        . '<div class="mt-4 flex flex-wrap gap-3">'
        . '<a class="inline-flex min-h-[48px] items-center rounded-xl bg-gold-500 px-6 font-bold !text-navy-950" href="' . esc_url(abz_url('booking')) . '">احجز موعداً</a>'
        . '<a class="inline-flex min-h-[48px] items-center rounded-xl bg-whatsapp-600 px-6 font-bold !text-white" href="' . esc_url($wa) . '" target="_blank" rel="noopener">تواصل عبر واتساب</a>'
        . '</div></aside>';
}

/** المصادر المحفوظة مع المقال */
function abz_post_sources(int $post_id): array
{
    $sources = json_decode((string) get_post_meta($post_id, 'abz_sources', true), true);
    return is_array($sources) ? $sources : [];
}

/** مقالات مرتبطة: نفس التصنيف ثم الوسوم، ثم الأحدث */
function abz_related_posts(int $post_id, int $count = 3): array
{
    $categories = wp_get_post_categories($post_id);
    $related = get_posts([
        'post_type' => 'post',
        'numberposts' => $count,
        'post__not_in' => [$post_id],
        'category__in' => $categories,
        'ignore_sticky_posts' => true,
    ]);
    if (count($related) < $count) {
        $more = get_posts([
            'post_type' => 'post',
            'numberposts' => $count - count($related),
            'post__not_in' => array_merge([$post_id], wp_list_pluck($related, 'ID')),
        ]);
        $related = array_merge($related, $more);
    }
    return $related;
}
