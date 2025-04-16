import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DoctorProfile, Review, User } from '@prisma/client';

interface DoctorWithReviews extends DoctorProfile {
  user: User;
  reviews: Review[];
}

export async function GET() {
  try {
    // Get all doctors with their average rating and total reviews
    const doctors = await prisma.doctorProfile.findMany({
      select: {
        id: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            profilePicture: true,
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    });

    // Calculate average ratings and format the response
    const rankings = doctors.map((doctor: DoctorWithReviews) => {
      const totalReviews = doctor.reviews.length;
      const averageRating = totalReviews > 0
        ? doctor.reviews.reduce((sum: number, review: Review) => sum + review.rating, 0) / totalReviews
        : 0;

      return {
        id: doctor.id,
        firstName: doctor.user.firstName,
        lastName: doctor.user.lastName,
        profilePicture: doctor.user.profilePicture,
        averageRating,
        totalReviews,
      };
    });

    // Sort by average rating (descending)
    rankings.sort((a: typeof rankings[0], b: typeof rankings[0]) => b.averageRating - a.averageRating);

    return NextResponse.json(rankings);
  } catch (error) {
    console.error('Error fetching doctor rankings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch doctor rankings' },
      { status: 500 }
    );
  }
} 