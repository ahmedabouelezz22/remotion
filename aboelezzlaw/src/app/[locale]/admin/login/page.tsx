import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AdminLoginForm } from '@/components/admin/admin-login-form';
import { AdminUnconfiguredNotice } from '@/components/admin/admin-gate';
import { Container } from '@/components/ui/container';
import { isAdminConfigured, requireOwner } from '@/lib/admin';

export const metadata: Metadata = {
  title: 'دخول المالك',
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = 'force-dynamic';

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (!isAdminConfigured()) return <AdminUnconfiguredNotice />;

  // من يملك جلسة إدارية صالحة لا يُطلب منه الدخول مرّة أخرى
  const check = await requireOwner();
  if (check.ok) redirect('/ar/admin');

  const { error } = await searchParams;

  return (
    <Container size="narrow" className="py-20">
      <AdminLoginForm initialError={error} />
    </Container>
  );
}
