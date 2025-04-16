'use client';

import { useEffect, useState } from 'react';
import { IconStarFilled } from '@tabler/icons-react';
import Image from 'next/image';
import { format } from 'date-fns';
import {
  ChartBarIcon,
  FireIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  patient: {
    firstName: string;
    lastName: string;
    profilePicture: string | null;
  };
}

interface DoctorReviewsProps {
  doctorId: string;
}

interface RatingSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialty: string;
  profilePicture: string | null;
}

export function DoctorReviews({ doctorId }: DoctorReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<RatingSummary | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [reviewsResponse, summaryResponse, doctorResponse] = await Promise.all([
          fetch(`/api/doctors/${doctorId}/reviews`),
          fetch(`/api/doctors/${doctorId}/reviews/summary`),
          fetch(`/api/doctors/${doctorId}/profile`)
        ]);

        if (!reviewsResponse.ok || !summaryResponse.ok || !doctorResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const [reviewsData, summaryData, doctorData] = await Promise.all([
          reviewsResponse.json(),
          summaryResponse.json(),
          doctorResponse.json()
        ]);

        setReviews(reviewsData);
        setSummary(summaryData);
        setDoctor(doctorData);
      } catch (err) {
        setError('Failed to load reviews');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (doctorId) {
      fetchData();
    }
  }, [doctorId]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="h-32 bg-gray-200 rounded-lg mb-4" />
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  if (!summary || !doctor) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
        <p className="text-gray-500">No reviews available</p>
      </div>
    );
  }

  // Calculate performance categories
  const totalReviews = summary.totalReviews;
  const highPerforming = Math.round((summary.ratingDistribution[5] || 0) + (summary.ratingDistribution[4] || 0));
  const avgPerforming = Math.round(summary.ratingDistribution[3] || 0);
  const lowPerforming = Math.round((summary.ratingDistribution[2] || 0) + (summary.ratingDistribution[1] || 0));

  const renderStars = (rating: number, size: number = 20) => (
    <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <IconStarFilled
                key={star}
          size={size}
          className={star <= rating ? 'text-yellow-400' : 'text-gray-200'}
              />
            ))}
          </div>
  );

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

            return (
    <div className="space-y-8">
      {/* Doctor Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              {doctor.profilePicture ? (
                <Image
                  src={doctor.profilePicture}
                  alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
                  width={64}
                  height={64}
                  className="rounded-full"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 text-xl font-medium">
                    {getInitials(doctor.firstName, doctor.lastName)}
                  </span>
                </div>
              )}
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Dr. {doctor.firstName} {doctor.lastName}
                </h2>
                <p className="text-gray-500">{doctor.specialty}</p>
                <div className="mt-2 flex items-center gap-2">
                  {renderStars(summary.averageRating)}
                  <span className="text-sm text-gray-500">
                    ({summary.totalReviews} reviews)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-green-600 font-medium">High</span>
            </div>
            <h3 className="font-medium text-gray-900">High Performing</h3>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-900">{highPerforming}</span>
            <span className="text-sm text-gray-500">reviews</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-blue-600 font-medium">Avg</span>
            </div>
            <h3 className="font-medium text-gray-900">Average</h3>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-900">{avgPerforming}</span>
            <span className="text-sm text-gray-500">reviews</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <span className="text-red-600 font-medium">Low</span>
            </div>
            <h3 className="font-medium text-gray-900">Low Performing</h3>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-900">{lowPerforming}</span>
            <span className="text-sm text-gray-500">reviews</span>
          </div>
        </div>
      </div>

      {/* Recent Reviews */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">Recent Reviews</h3>
            </div>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
              View all reviews
            </button>
          </div>
          
      <div className="space-y-6">
        {reviews.map((review) => (
              <div key={review.id} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="flex-shrink-0">
                {review.patient.profilePicture ? (
                  <Image
                    src={review.patient.profilePicture}
                    alt={`${review.patient.firstName} ${review.patient.lastName}`}
                      width={40}
                      height={40}
                      className="rounded-full"
                  />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-600 text-sm font-medium">
                        {getInitials(review.patient.firstName, review.patient.lastName)}
                    </span>
                  </div>
                )}
              </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                  <div>
                      <h4 className="font-medium text-gray-900">
                      {review.patient.firstName} {review.patient.lastName}
                      </h4>
                      <p className="text-sm text-gray-500">
                      {format(new Date(review.createdAt), 'MMM d, yyyy')}
                      </p>
                  </div>
                    {renderStars(review.rating, 16)}
                  </div>
                  <p className="text-gray-600 line-clamp-2">{review.comment}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 