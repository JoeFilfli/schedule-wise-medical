import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user || session.user.role !== 'PATIENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { rating, comment, doctorId } = body;

    if (!doctorId) {
      return NextResponse.json({ error: 'Doctor ID is required' }, { status: 400 });
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Invalid rating. Must be between 1 and 5.' },
        { status: 400 }
      );
    }

    if (!comment || comment.trim().length === 0) {
      return NextResponse.json(
        { error: 'Review comment is required.' },
        { status: 400 }
      );
    }

    // Check if user has already reviewed this doctor
    const existingReview = await prisma.review.findFirst({
      where: {
        doctorId: doctorId,
        patientId: session.user.id
      }
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this doctor.' },
        { status: 400 }
      );
    }

    const review = await prisma.review.create({
      data: {
        rating,
        comment: comment.trim(),
        doctorId: doctorId,
        patientId: session.user.id
      },
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
            profilePicture: true
          }
        }
      }
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
} 