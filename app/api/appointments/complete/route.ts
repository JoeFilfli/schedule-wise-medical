import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { id, status, review } = await req.json();

  if (!id || !status) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const updated = await prisma.appointment.update({
    where: { id },
    data: {
      status,
      review,
    },
  });

  return NextResponse.json({ success: true, appointment: updated });
}
