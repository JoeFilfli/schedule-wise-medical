'use client';

import { useState } from 'react';
import { DoctorList } from '@/components/reviews/DoctorList';
import { DoctorReviews } from '@/components/reviews/DoctorReviews';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { Toaster } from 'react-hot-toast';

export default function ReviewsPage() {
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Page Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <h1 className="text-4xl font-bold text-gray-900">Doctor Reviews</h1>
            </div>
            <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
              Share your experience and help others make informed decisions about their healthcare journey
            </p>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Sidebar - Doctor Selection */}
            <div className="lg:col-span-4">
              <div className="sticky top-8 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <h2 className="text-lg font-semibold text-gray-900">Select a Doctor</h2>
                    </div>
                    <DoctorList 
                      selectedDoctorId={selectedDoctorId}
                      onDoctorSelect={setSelectedDoctorId}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-8">
              {selectedDoctorId ? (
                <div className="space-y-8">
                  <DoctorReviews doctorId={selectedDoctorId} />
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-gray-50 px-3 text-sm text-gray-500">Write a Review</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6">
                      <ReviewForm doctorId={selectedDoctorId} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select a Doctor to View Reviews
                  </h3>
                  <p className="text-gray-500">
                    Choose a doctor from the list to see their reviews and ratings
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
