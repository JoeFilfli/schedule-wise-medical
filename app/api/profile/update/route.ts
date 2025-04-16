import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authConfig);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const form = await req.formData();

  const firstName = form.get('firstName') as string;
  const lastName = form.get('lastName') as string;
  const phoneNumber = form.get('phoneNumber') as string;
  const specialty = form.get('specialty') as string;
  const bio = form.get('bio') as string;
  const file = form.get('profilePicture') as File;

  const profilePicture = file && file.size > 0
    ? Buffer.from(await file.arrayBuffer())
    : undefined;

  const updateUser = await prisma.user.update({
    where: { email: session.user.email },
    data: {
      firstName,
      lastName,
      phoneNumber,
      ...(profilePicture ? { profilePicture } : {}),
    },
  });

  if (session.user.role === 'DOCTOR') {
    await prisma.doctorProfile.upsert({
      where: { userId: updateUser.id },
      create: {
        userId: updateUser.id,
        specialty,
        bio,
      },
      update: {
        specialty,
        bio,
      },
    });
  }

  return NextResponse.json({ success: true });
}
