import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  context: { params: Promise<{ doctorId: string }> }
) {
  try {
    const { doctorId } = await context.params;

    if (!doctorId) {
      return NextResponse.json(
        { error: 'Doctor ID is required' },
        { status: 400 }
      );
    }

    const reviews = await prisma.review.findMany({
      where: {
        doctorId,
      },
      select: {
        rating: true,
      },
    });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      : 0;

    // Calculate rating distribution
    const ratingDistribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    reviews.forEach((review) => {
      ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
    });

    return NextResponse.json({
      totalReviews,
      averageRating,
      ratingDistribution,
    });
  } catch (error) {
    console.error('Error fetching review summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch review summary' },
      { status: 500 }
    );
  }
} 