<?php
if (!defined('ABSPATH')) {
    exit;
}

/**
 * فيديوهات قناة يوتيوب في المكتبة: تُجلب من تغذية RSS الرسمية للقناة (بلا مفتاح API)،
 * وتُحفظ مؤقتاً 6 ساعات، وتبقى آخر قائمة ناجحة احتياطاً إن تعذّر الاتصال.
 * التغذية الرسمية تعرض أحدث 15 فيديو؛ وزر «القناة كاملة» يفتح القناة على يوتيوب.
 */

/**
 * القنوات المعروضة: قناة المؤسسة كاملة، وقناة أحمد أبو العز الشخصية من 25 نوفمبر 2026 فقط
 * (بقرار المالك). since = '' يعني كل الفيديوهات.
 */
function abz_youtube_channels(): array
{
    return [
        ['id' => 'UCal6bk0cnOF6mQ4zlQjWmjg', 'name' => 'قناة المؤسسة', 'url' => 'https://www.youtube.com/@aboelezzlawfirm', 'since' => ''],
        ['id' => 'UCMi7JWYe_2FEBehdNTtO7DA', 'name' => 'قناة أحمد أبو العز', 'url' => 'https://www.youtube.com/@-ahmedaboelezz', 'since' => '2026-11-25'],
    ];
}

function abz_youtube_channel_url(): string
{
    return abz_youtube_channels()[0]['url'];
}

/** فيديوهات قناة واحدة من تغذيتها الرسمية، مع ذاكرة مؤقتة وقائمة احتياطية */
function abz_youtube_channel_videos(array $channel): array
{
    $key = 'abz_yt_' . md5($channel['id']);
    $videos = get_transient($key);
    if (!is_array($videos)) {
        $fresh = [];
        $response = wp_remote_get('https://www.youtube.com/feeds/videos.xml?channel_id=' . rawurlencode($channel['id']), ['timeout' => 10]);
        if (!is_wp_error($response) && (int) wp_remote_retrieve_response_code($response) === 200) {
            $previous = libxml_use_internal_errors(true);
            $xml = simplexml_load_string((string) wp_remote_retrieve_body($response), 'SimpleXMLElement', LIBXML_NONET);
            libxml_use_internal_errors($previous);
            foreach ($xml ? $xml->entry : [] as $entry) {
                $yt = $entry->children('http://www.youtube.com/xml/schemas/2015');
                $id = (string) $yt->videoId;
                if (!preg_match('/^[A-Za-z0-9_-]{11}$/', $id)) {
                    continue;
                }
                $fresh[] = [
                    'id' => $id,
                    'title' => sanitize_text_field((string) $entry->title),
                    'date' => substr((string) $entry->published, 0, 10),
                    'published' => (string) $entry->published,
                    'channel' => $channel['name'],
                ];
            }
        }
        if ($fresh) {
            update_option($key . '_last', $fresh, false);
            set_transient($key, $fresh, 3 * HOUR_IN_SECONDS);
            $videos = $fresh;
        } else {
            $videos = (array) get_option($key . '_last', []);
            set_transient($key, $videos, 30 * MINUTE_IN_SECONDS);
        }
    }
    if ($channel['since'] !== '') {
        $videos = array_values(array_filter($videos, fn($v) => ($v['date'] ?? '') >= $channel['since']));
    }
    return $videos;
}

/** كل الفيديوهات من القنوات معاً، الأحدث أولاً */
function abz_youtube_videos(int $limit = 30): array
{
    $all = [];
    foreach (abz_youtube_channels() as $channel) {
        foreach (abz_youtube_channel_videos($channel) as $video) {
            $all[$video['id']] = $video;
        }
    }
    usort($all, fn($a, $b) => strcmp($b['published'] ?? $b['date'], $a['published'] ?? $a['date']));
    return array_slice(array_values($all), 0, $limit);
}

/** شبكة الفيديوهات: صورة مصغّرة، وعند الضغط يُشغَّل الفيديو من youtube-nocookie داخل الصفحة */
function abz_render_videos(int $limit = 30): void
{
    $videos = abz_youtube_videos($limit);
    if (!$videos) {
        echo '<p class="rounded-2xl border border-sand-200 bg-white p-6 text-slate-600">لا فيديوهات معروضة الآن. شاهدها مباشرة على <a class="font-bold underline" href="' . esc_url(abz_youtube_channel_url()) . '" target="_blank" rel="noopener">قناتنا على يوتيوب</a>.</p>';
        return;
    }
    echo '<div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">';
    foreach ($videos as $video) {
        $watch = 'https://www.youtube.com/watch?v=' . $video['id'];
        echo '<article class="abz-reveal flex flex-col overflow-hidden rounded-3xl border border-sand-200 bg-white">';
        echo '<a href="' . esc_url($watch) . '" target="_blank" rel="noopener" data-abz-yt="' . esc_attr($video['id']) . '" class="group relative block aspect-video overflow-hidden bg-navy-950" aria-label="' . esc_attr('تشغيل: ' . $video['title']) . '">';
        echo '<img src="' . esc_url('https://i.ytimg.com/vi/' . $video['id'] . '/hqdefault.jpg') . '" alt="" loading="lazy" decoding="async" width="480" height="360" class="h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-105">';
        echo '<span class="absolute inset-0 flex items-center justify-center"><span class="flex h-14 w-14 items-center justify-center rounded-full bg-gold-500 text-navy-950 shadow-lg transition group-hover:scale-110"><svg viewBox="0 0 24 24" class="ms-1 h-6 w-6" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg></span></span></a>';
        echo '<div class="flex flex-1 flex-col p-5"><h3 class="text-base leading-7 text-navy-900">' . esc_html($video['title']) . '</h3>';
        echo '<p class="mt-1 text-xs text-slate-500">' . esc_html(trim(($video['channel'] ?? '') . ' · ' . ($video['date'] ? mysql2date('j F Y', $video['date'] . ' 00:00:00') : ''), ' ·')) . '</p>';
        echo '</div></article>';
    }
    echo '</div>';
}
