import { ownerOrRedirect } from '@/components/admin/admin-gate';
import { AdminShell } from '@/components/admin/admin-shell';
import { Card } from '@/components/ui/card';
import { clientWaLink } from '@/lib/notifications/templates';
import { adminListMessages } from '@/lib/repository';

export const dynamic = 'force-dynamic';

export default async function AdminMessagesPage() {
  const owner = await ownerOrRedirect();
  const messages = await adminListMessages(100);

  return (
    <AdminShell
      owner={owner}
      title="رسائل نموذج الاتصال"
      description="نسخة محفوظة من كل رسالة وردت عبر الموقع — تبقى هنا حتى لو ضاع الإشعار في البريد."
    >
      {messages.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-600">لا رسائل بعد.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <Card key={message.id}>
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-3">
                <div>
                  <p className="font-semibold text-navy-900">{message.subject}</p>
                  <p className="text-xs text-slate-500">
                    {message.name} —{' '}
                    <a href={`mailto:${message.email}`} className="underline" dir="ltr">
                      {message.email}
                    </a>
                    {message.phone ? (
                      <>
                        {' — '}
                        <a
                          href={clientWaLink(message.phone, message.name) ?? `tel:${message.phone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-[#128C7E] underline"
                          dir="ltr"
                        >
                          {message.phone}
                        </a>
                      </>
                    ) : null}
                  </p>
                </div>
                <p className="numeric text-xs text-slate-400">
                  {message.created_at.toLocaleString('ar-EG')}
                </p>
              </div>
              <p className="whitespace-pre-line text-sm leading-8 text-slate-700">
                {message.body}
              </p>
            </Card>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
