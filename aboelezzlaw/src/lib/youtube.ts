import { site } from '@/content/site';
import { fallbackVideos } from '@/content/videos';

export interface Video {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnail: string;
  url: string;
}

/**
 * يجلب فيديوهات القناة دون أي مفتاح API عبر تغذية RSS الرسمية لليوتيوب.
 * الترتيب الذي نجرّبه:
 *   1) YOUTUBE_CHANNEL_ID مضبوط → RSS مباشرة (الأسرع والأوثق)
 *   2) استخراج معرّف القناة من صفحة الـ handle ثم RSS
 *   3) قائمة احتياطية مكتوبة يدوياً في src/content/videos.ts
 */

const RSS_ENDPOINT = 'https://www.youtube.com/feeds/videos.xml?channel_id=';

/** يستخرج معرّف القناة (UC…) من صفحة الـ handle */
async function resolveChannelId(): Promise<string | null> {
  const configured = process.env.YOUTUBE_CHANNEL_ID;
  if (configured) return configured;

  try {
    const res = await fetch(site.social.youtube, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AboelezzLawBot/1.0)' },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const match = html.match(/"channelId":"(UC[\w-]{22})"/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

/** محلّل XML خفيف — يكفي لبنية تغذية يوتيوب الثابتة، ويتجنّب إضافة تبعية */
function parseFeed(xml: string): Video[] {
  const entries = xml.split('<entry>').slice(1);
  const videos: Video[] = [];

  for (const entry of entries) {
    const pick = (tag: string) =>
      entry.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`))?.[1]?.trim() ?? '';

    const id = pick('yt:videoId');
    if (!id) continue;

    const decode = (value: string) =>
      value
        .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, '&');

    videos.push({
      id,
      title: decode(pick('title')),
      description: decode(pick('media:description')).slice(0, 300),
      publishedAt: pick('published'),
      thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      url: `https://www.youtube.com/watch?v=${id}`,
    });
  }

  return videos;
}

export async function getChannelVideos(): Promise<{ videos: Video[]; source: 'youtube' | 'fallback' }> {
  const channelId = await resolveChannelId();
  if (!channelId) return { videos: fallbackVideos, source: 'fallback' };

  try {
    const res = await fetch(`${RSS_ENDPOINT}${channelId}`, {
      // تُحدَّث القائمة كل ساعة بدل جلبها مع كل زيارة
      next: { revalidate: 3600 },
    });
    if (!res.ok) return { videos: fallbackVideos, source: 'fallback' };

    const videos = parseFeed(await res.text());
    if (videos.length === 0) return { videos: fallbackVideos, source: 'fallback' };
    return { videos, source: 'youtube' };
  } catch {
    return { videos: fallbackVideos, source: 'fallback' };
  }
}
