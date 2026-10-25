import { NextResponse } from 'next/server';
import { isDbConfigured } from '@/lib/db';
import { takenSlots } from '@/lib/repository';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** المواعيد المحجوزة في يوم معيّن، ليستبعدها المُنتقي في الواجهة */
export async function GET(request: Request) {
  const date = new URL(request.url).searchParams.get('date');

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ ok: false, taken: [] }, { status: 400 });
  }

  // بلا قاعدة بيانات لا سبيل لمعرفة المحجوز — نعرض كل المواعيد
  // ويبقى القيد الحقيقي هو تأكيد المكتب
  if (!isDbConfigured()) {
    return NextResponse.json({ ok: true, taken: [], tracked: false });
  }

  return NextResponse.json({ ok: true, taken: await takenSlots(date), tracked: true });
}
