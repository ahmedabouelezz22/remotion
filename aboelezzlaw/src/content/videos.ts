import type { Video } from '@/lib/youtube';

/**
 * قائمة احتياطية تُعرض فقط إذا تعذّر جلب تغذية اليوتيوب.
 * أضف هنا معرّفات الفيديوهات المهمة يدوياً (المعرّف هو ما يلي v= في الرابط).
 */
export const fallbackVideos: Video[] = [];
