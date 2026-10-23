import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'لوحة الإدارة',
  // لا فهرسة ولا أرشفة — ومعها `robots.ts` الذي يمنع المسار بالكامل
  robots: { index: false, follow: false, nocache: true },
};

/** تخطيط اللوحة — بلا سلّة ولا زرّ واتساب ولا روابط عامة */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-dvh flex-1 flex-col bg-sand-100">{children}</div>;
}
