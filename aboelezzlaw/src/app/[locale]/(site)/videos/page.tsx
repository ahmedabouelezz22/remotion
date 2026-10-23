import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Play, Youtube } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { ButtonLink } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Container, Section } from '@/components/ui/container';
import { dict, isLocale, type Locale } from '@/content/i18n';
import { site } from '@/content/site';
import { formatDate } from '@/lib/utils';
import { getChannelVideos } from '@/lib/youtube';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const t = dict(raw as Locale);
  return {
    title: t.videosPage.eyebrow,
    description: t.videosPage.metaDescription,
    alternates: { canonical: `/${raw}/videos` },
  };
}

// تُعاد التوليد كل ساعة حتى تظهر الفيديوهات الجديدة تلقائياً
export const revalidate = 3600;

export default async function VideosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = dict(locale);

  const { videos, source } = await getChannelVideos();

  return (
    <>
      <PageHeader
        eyebrow={t.videosPage.eyebrow}
        title={t.videosPage.title}
        description={t.videosPage.description}
      />

      <Section>
        <Container size="wide">
          <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-slate-600">
              {videos.length > 0 ? t.videosPage.latestCount(videos.length) : t.videosPage.none}
            </p>
            <ButtonLink href={site.social.youtube} external variant="outline" size="sm">
              <Youtube className="h-4 w-4" />
              {t.videos.visitChannel}
            </ButtonLink>
          </div>

          {videos.length === 0 ? (
            <Card className="border-gold-400/50 bg-gold-50 text-center">
              <Youtube className="mx-auto mb-4 h-12 w-12 text-gold-600" />
              <h2 className="mb-2.5 text-lg text-navy-900">{t.videosPage.fetchFailedTitle}</h2>
              <p className="mx-auto mb-6 max-w-lg text-sm leading-8 text-slate-600">
                {t.videosPage.fetchFailedBody}
              </p>
              <ButtonLink href={site.social.youtube} external>
                <Youtube className="h-4 w-4" />
                {t.videosPage.openChannel}
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
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        {video.publishedAt ? (
                          <time className="numeric" dateTime={video.publishedAt}>
                            {formatDate(video.publishedAt, locale)}
                          </time>
                        ) : (
                          <span />
                        )}
                        <span className="inline-flex items-center gap-1 font-bold text-gold-600">
                          <Youtube className="h-3.5 w-3.5" />
                          {t.videosPage.youtube}
                        </span>
                      </div>
                    </div>
                  </Card>
                </a>
              ))}
            </div>
          )}

          {source === 'fallback' && videos.length > 0 ? (
            <p className="mt-8 text-center text-xs text-slate-500">{t.videosPage.fallbackNote}</p>
          ) : null}
        </Container>
      </Section>
    </>
  );
}
