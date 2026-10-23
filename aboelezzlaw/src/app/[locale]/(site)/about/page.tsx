import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Award, BookOpen, Building2, GraduationCap, Globe, Shield } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { ButtonLink } from '@/components/ui/button';
import { Badge, Card } from '@/components/ui/card';
import { Container, Section, SectionHeading } from '@/components/ui/container';
import { dict, isLocale, path, type Locale } from '@/content/i18n';
import { site } from '@/content/site';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const t = dict(raw as Locale);
  return {
    title: t.aboutPage.title,
    description: t.aboutPage.metaDescription,
    alternates: { canonical: `/${raw}/about` },
  };
}

/**
 * ملاحظة للمالك: المحتوى منقول من موقعك الحالي ويُحرَّر من `src/content/i18n`.
 * راجِعه وحدّثه كلما تغيّرت سيرتك المهنية، واحذف أي جهة لا ترغب في ذكرها.
 */

// الأيقونات ترتيبها مطابق لترتيب `aboutPage.credentials` في القاموس
const credentialIcons = [GraduationCap, BookOpen, Award, Globe, Building2, Shield];

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = dict(locale);

  return (
    <>
      <PageHeader
        eyebrow={t.aboutPage.eyebrow}
        title={t.aboutPage.title}
        description={t.aboutPage.description}
      />

      <Section>
        <Container size="wide">
          <div className="grid items-start gap-12 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-sm">
              {site.brand.founderPhoto ? (
                <Image
                  src={site.brand.founderPhoto}
                  alt={t.aboutPage.photoAlt}
                  width={720}
                  height={900}
                  className="h-auto w-full object-cover"
                  priority
                />
              ) : (
                /* لا صورة مضبوطة ⇒ بطاقة نصّية. صورة مكسورة أسوأ من غيابها. */
                <div className="flex aspect-[4/5] flex-col items-center justify-center gap-4 bg-navy-900 p-8 text-center">
                  <span className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-gold-500/50 font-display text-2xl font-black text-gold-400">
                    {t.aboutPage.initials}
                  </span>
                  <span className="font-display text-xl font-extrabold text-white">
                    {t.aboutPage.founderName}
                  </span>
                  <span className="text-sm leading-7 text-navy-100/80">
                    {t.about.founderRole}
                  </span>
                </div>
              )}
            </div>

            <div className="article-body">
              <h2>{t.aboutPage.introHeading}</h2>
              <p>{t.aboutPage.introBody}</p>

              <h2>{t.aboutPage.approachHeading}</h2>
              <p>{t.aboutPage.approachBody1}</p>
              <p>{t.aboutPage.approachBody2}</p>

              <h2>{t.aboutPage.commitmentHeading}</h2>
              <p>{t.aboutPage.commitmentBody1}</p>
              <p>{t.aboutPage.commitmentBody2}</p>
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="sand">
        <Container size="wide">
          <SectionHeading
            eyebrow={t.aboutPage.credentialsEyebrow}
            title={t.aboutPage.credentialsTitle}
          />
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {t.aboutPage.credentials.map((item, index) => {
              const Icon = credentialIcons[index] ?? Award;
              return (
                <Card key={item.title} className="bg-white">
                  <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-navy-900/6 text-navy-900">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mb-2.5 text-lg text-navy-900">{item.title}</h3>
                  <p className="text-sm leading-8 text-slate-600">{item.body}</p>
                </Card>
              );
            })}
          </div>
        </Container>
      </Section>

      <Section>
        <Container size="wide">
          <SectionHeading
            eyebrow={t.aboutPage.clientsEyebrow}
            title={t.aboutPage.clientsTitle}
            description={t.aboutPage.clientsDescription}
          />
          <div className="mx-auto mt-12 flex max-w-3xl flex-wrap justify-center gap-3">
            {t.aboutPage.clients.map((client) => (
              <span
                key={client}
                className="rounded-xl border border-sand-200 bg-white px-6 py-4 text-sm font-bold text-navy-900 shadow-sm"
              >
                {client}
              </span>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="sand">
        <Container size="wide">
          <SectionHeading
            eyebrow={t.aboutPage.expertiseEyebrow}
            title={t.aboutPage.expertiseTitle}
          />
          <div className="mt-12 flex flex-wrap justify-center gap-2.5">
            {t.aboutPage.expertise.map((item) => (
              <Badge key={item} tone="navy">
                {item}
              </Badge>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="navy">
        <Container size="narrow" className="text-center">
          <h2 className="text-2xl text-white sm:text-3xl">{t.aboutPage.ctaTitle}</h2>
          <p className="mx-auto mt-5 max-w-xl leading-9 text-navy-100/80">
            {t.aboutPage.ctaBody}
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <ButtonLink href={path(locale, '/booking')} variant="gold" size="lg">
              {t.aboutPage.ctaPrimary}
            </ButtonLink>
            <ButtonLink
              href={path(locale, '/store')}
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-navy-900"
            >
              {t.aboutPage.ctaSecondary}
            </ButtonLink>
          </div>
        </Container>
      </Section>
    </>
  );
}
