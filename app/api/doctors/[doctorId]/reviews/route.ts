import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  context: { params: Promise<{ doctorId: string }> }
) {
  try {
    console.log('GET reviews - Starting request');
    const { doctorId } = await context.params;
    console.log('GET reviews - DoctorId:', doctorId);

    if (!doctorId) {
      console.log('GET reviews - Missing doctorId');
      return NextResponse.json(
        { error: 'Doctor ID is required' },
        { status: 400 }
      );
    }

    console.log('GET reviews - Fetching from database');
    const reviews = await prisma.review.findMany({
      where: {
        doctorId,
      },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        patient: {
          select: {
            firstName: true,
            lastName: true,
            profilePicture: true
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    console.log('GET reviews - Found reviews:', reviews.length);

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ doctorId: string }> }
) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user || session.user.role !== 'PATIENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { doctorId } = await context.params;

    if (!doctorId) {
      return NextResponse.json({ error: 'Doctor ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { rating, comment } = body;

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
        doctorId,
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
        doctorId,
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