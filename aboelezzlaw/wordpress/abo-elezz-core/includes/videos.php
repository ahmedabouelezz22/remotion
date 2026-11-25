<?php
if (!defined('ABSPATH')) {
    exit;
}

/**
 * فيديوهات قناة يوتيوب في المكتبة: تُجلب من تغذية RSS الرسمية للقناة (بلا مفتاح API)،
 * وتُحفظ مؤقتاً 6 ساعات، وتبقى آخر قائمة ناجحة احتياطاً إن تعذّر الاتصال.
 * التغذية الرسمية تعرض أحدث 15 فيديو؛ وزر «القناة كاملة» يفتح القناة على يوتيوب.
 */

const ABZ_YT_CHANNEL_ID = 'UCMi7JWYe_2FEBehdNTtO7DA'; // قناة ‎@-ahmedaboelezz

function abz_youtube_channel_url(): string
{
    return 'https://www.youtube.com/channel/' . ABZ_YT_CHANNEL_ID;
}

function abz_youtube_videos(int $limit = 15): array
{
    $videos = get_transient('abz_yt_videos');
    if (!is_array($videos)) {
        $fresh = [];
        $response = wp_remote_get('https://www.youtube.com/feeds/videos.xml?channel_id=' . ABZ_YT_CHANNEL_ID, ['timeout' => 10]);
        if (!is_wp_error($response) && (int) wp_remote_retrieve_response_code($response) === 200) {
            $previous = libxml_use_internal_errors(true);
            $xml = simplexml_load_string((string) wp_remote_retrieve_body($response), 'SimpleXMLElement', LIBXML_NONET);
            libxml_use_internal_errors($previous);
            if ($xml) {
                foreach ($xml->entry as $entry) {
                    $yt = $entry->children('http://www.youtube.com/xml/schemas/2015');
                    $media = $entry->children('http://search.yahoo.com/mrss/');
                    $id = (string) $yt->videoId;
                    if (!preg_match('/^[A-Za-z0-9_-]{11}$/', $id)) {
                        continue;
                    }
                    $fresh[] = [
                        'id' => $id,
                        'title' => sanitize_text_field((string) $entry->title),
                        'date' => substr((string) $entry->published, 0, 10),
                        'description' => wp_trim_words(sanitize_textarea_field((string) $media->group->description), 30),
                    ];
                }
            }
        }
        if ($fresh) {
            update_option('abz_yt_videos_last', $fresh, false);
            set_transient('abz_yt_videos', $fresh, 6 * HOUR_IN_SECONDS);
            $videos = $fresh;
        } else {
            $videos = (array) get_option('abz_yt_videos_last', []);
            set_transient('abz_yt_videos', $videos, 30 * MINUTE_IN_SECONDS);
        }
    }
    return array_slice($videos, 0, $limit);
}

/** شبكة الفيديوهات: صورة مصغّرة، وعند الضغط يُشغَّل الفيديو من youtube-nocookie داخل الصفحة */
function abz_render_videos(int $limit = 15): void
{
    $videos = abz_youtube_videos($limit);
    if (!$videos) {
        echo '<p class="rounded-2xl border border-sand-200 bg-white p-6 text-slate-600">تعذّر تحميل الفيديوهات الآن. شاهدها مباشرة على <a class="font-bold underline" href="' . esc_url(abz_youtube_channel_url()) . '" target="_blank" rel="noopener">قناتنا على يوتيوب</a>.</p>';
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
        if ($video['date']) {
            echo '<p class="mt-1 text-xs text-slate-500">' . esc_html(mysql2date('j F Y', $video['date'] . ' 00:00:00')) . '</p>';
        }
        echo '</div></article>';
    }
    echo '</div>';
}
