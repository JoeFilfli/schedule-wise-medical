import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
  const body = await req.json();
  const { firstName, lastName, email, password, role } = body;

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    return NextResponse.json(
      { error: 'Email already registered. Please login instead.' },
      { status: 400 }
    );
  }

  const hashed = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password: hashed,
      role,
    },
  });

  if (role === 'DOCTOR') {
    await prisma.doctorProfile.create({
      data: {
        userId: newUser.id,
        specialty: '',
        bio: '',
        calendarUrl: '',
      },
    });
  }

  if (role === 'PATIENT') {
    await prisma.patientProfile.create({
      data: {
        userId: newUser.id,
        age: null,
        gender: '',
        history: '',
      },
    });
  }

  return NextResponse.json({ user: newUser });
}
