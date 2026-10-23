import type { Fragment as FragmentType } from 'react';
import { Fragment } from 'react';
import { PageHeader } from '@/components/page-header';
import { Container, Section } from '@/components/ui/container';
import { htmlLang, type Locale } from '@/content/i18n';
import type { Block, LegalDoc } from '@/content/legal';
import { site } from '@/content/site';

/**
 * عارض وثيقة قانونية.
 *
 * النصّ يأتي بنيةً من `content/legal.ts` لا JSX، فيُكتب مرّة ويُعرض بلغتين.
 * يفهم العارض علامتين فقط: `**تأكيد**` و`{email}` / `{phone}` — ولا يفسّر
 * HTML من النصّ، فلا باب لحقن وسوم عبر المحتوى.
 */

const EMAIL = '{email}';
const PHONE = '{phone}';

function renderInline(text: string, keyPrefix: string) {
  // نقسم على العلامات المعروفة فقط؛ ما بينها نصّ يُعرض كما هو
  const parts = text.split(/(\*\*[^*]+\*\*|\{email\}|\{phone\})/g).filter(Boolean);

  return parts.map((part, index) => {
    const key = `${keyPrefix}-${index}`;

    if (part === EMAIL) {
      return (
        <a key={key} href={`mailto:${site.contact.email}`} dir="ltr">
          {site.contact.email}
        </a>
      );
    }
    if (part === PHONE) {
      return (
        <span key={key} className="numeric" dir="ltr">
          {site.contact.phoneLocal}
        </span>
      );
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    }
    return <Fragment key={key}>{part}</Fragment>;
  });
}

function renderBlock(block: Block, key: string) {
  if (block.kind === 'ul') {
    return (
      <ul key={key}>
        {block.items.map((item, index) => (
          <li key={`${key}-${index}`}>{renderInline(item, `${key}-${index}`)}</li>
        ))}
      </ul>
    );
  }
  return <p key={key}>{renderInline(block.text, key)}</p>;
}

export function LegalDocument({ doc, locale }: { doc: LegalDoc; locale: Locale }) {
  const updated = new Date().toLocaleDateString(htmlLang(locale), {
    year: 'numeric',
    month: 'long',
  });

  return (
    <>
      <PageHeader eyebrow={doc.eyebrow} title={doc.title} description={doc.description} />

      <Section>
        <Container size="narrow">
          <div className="article-body">
            <p>
              {doc.updatedLabel}: {updated}
            </p>

            {doc.sections.map((section, sectionIndex) => (
              <Fragment key={section.heading}>
                <h2>{section.heading}</h2>
                {section.blocks.map((block, blockIndex) =>
                  renderBlock(block, `s${sectionIndex}-b${blockIndex}`),
                )}
              </Fragment>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}

export type { FragmentType };
