import { Container } from '@/components/ui/container';

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="border-b border-sand-200 bg-navy-900 py-16 text-white sm:py-20">
      <Container size="wide">
        {eyebrow ? (
          <p className="mb-3 text-sm font-bold tracking-[0.18em] text-gold-400">{eyebrow}</p>
        ) : null}
        <h1 className="max-w-3xl text-3xl leading-snug sm:text-4xl">{title}</h1>
        {description ? (
          <p className="mt-5 max-w-2xl text-[1.02rem] leading-9 text-navy-100/80">{description}</p>
        ) : null}
      </Container>
    </div>
  );
}
