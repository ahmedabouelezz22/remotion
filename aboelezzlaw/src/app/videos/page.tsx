import type { Metadata } from 'next';
import Image from 'next/image';
import { Play, Youtube } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { ButtonLink } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Container, Section } from '@/components/ui/container';
import { site } from '@/content/site';
import { getChannelVideos } from '@/lib/youtube';
import { formatDateAr } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'الفيديوهات',
  description:
    'محتوى قانوني مرئي من قناة أحمد أبو العز على يوتيوب — شروح وتوعية قانونية في العقود والشركات والتقاضي.',
  alternates: { canonical: '/videos' },
};

// تُعاد التوليد كل ساعة حتى تظهر الفيديوهات الجديدة تلقائياً
export const revalidate = 3600;

export default async function VideosPage() {
  const { videos, source } = await getChannelVideos();

  return (
    <>
      <PageHeader
        eyebrow="الفيديوهات"
        title="محتوى قانوني مرئي"
        description="تُجلب هذه القائمة مباشرةً من قناة اليوتيوب وتُحدَّث تلقائياً — كل فيديو جديد تنشره يظهر هنا دون أي تعديل في الموقع."
      />

      <Section>
        <Container size="wide">
          <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-slate-600">
              {videos.length > 0
                ? `أحدث ${videos.length} فيديو من القناة`
                : 'لا توجد فيديوهات معروضة حالياً'}
            </p>
            <ButtonLink href={site.social.youtube} external variant="outline" size="sm">
              <Youtube className="h-4 w-4" />
              زيارة القناة
            </ButtonLink>
          </div>

          {videos.length === 0 ? (
            <Card className="border-gold-400/50 bg-gold-500/8 text-center">
              <Youtube className="mx-auto mb-4 h-12 w-12 text-gold-600" />
              <h2 className="mb-2.5 text-lg text-navy-900">تعذّر جلب الفيديوهات حالياً</h2>
              <p className="mx-auto mb-6 max-w-lg text-sm leading-8 text-slate-600">
                يمكن تسريع الجلب وضمان استقراره بضبط متغيّر البيئة{' '}
                <code className="rounded bg-white px-1.5 py-0.5 font-mono text-xs">
                  YOUTUBE_CHANNEL_ID
                </code>{' '}
                بمعرّف القناة. حتى ذلك الحين يمكنك زيارة القناة مباشرةً.
              </p>
              <ButtonLink href={site.social.youtube} external>
                <Youtube className="h-4 w-4" />
                فتح القناة على يوتيوب
              </ButtonLink>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {videos.map((video) => (
                <a
                  key={video.id}
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                >
                  <Card hover className="flex h-full flex-col overflow-hidden p-0">
                    <div className="relative aspect-video w-full overflow-hidden bg-navy-900">
                      <Image
                        src={video.thumbnail}
                        alt={video.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="absolute inset-0 flex items-center justify-center bg-navy-950/25 transition-colors group-hover:bg-navy-950/40">
                        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 shadow-lg transition-transform group-hover:scale-110">
                          <Play className="h-6 w-6 translate-x-0.5 fill-navy-900 text-navy-900" />
                        </span>
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col p-6">
                      <h2 className="mb-3 line-clamp-2 text-base leading-8 text-navy-900 transition-colors group-hover:text-gold-600">
                        {video.title}
                      </h2>
                      {video.description ? (
                        <p className="mb-5 line-clamp-3 flex-1 text-sm leading-7 text-slate-600">
                          {video.description}
                        </p>
                      ) : (
                        <div className="flex-1" />
                      )}
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        {video.publishedAt ? (
                          <time className="numeric" dateTime={video.publishedAt}>
                            {formatDateAr(video.publishedAt)}
                          </time>
                        ) : (
                          <span />
                        )}
                        <span className="inline-flex items-center gap-1 font-bold text-gold-600">
                          <Youtube className="h-3.5 w-3.5" />
                          يوتيوب
                        </span>
                      </div>
                    </div>
                  </Card>
                </a>
              ))}
            </div>
          )}

          {source === 'fallback' && videos.length > 0 ? (
            <p className="mt-8 text-center text-xs text-slate-400">
              تُعرض قائمة احتياطية — تعذّر الاتصال بتغذية اليوتيوب في هذه اللحظة.
            </p>
          ) : null}
        </Container>
      </Section>
    </>
  );
}
