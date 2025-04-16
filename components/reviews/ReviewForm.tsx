'use client';

import { useState } from 'react';
import { IconStar, IconStarFilled, IconPencil } from '@tabler/icons-react';
import toast from 'react-hot-toast';

interface ReviewFormProps {
  doctorId: string;
}

export function ReviewForm({ doctorId }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    try {
      setSubmitting(true);
      
      const response = await fetch(`/api/doctors/${doctorId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating,
          comment: comment.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to submit review');
        return;
      }

      toast.success('Thank you for your review!');
      setRating(0);
      setComment('');
      setError(null);
    } catch (err) {
      setError('Failed to submit review. Please try again.');
      console.error('Error submitting review:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <IconPencil className="h-5 w-5 text-blue-600" />
        <h3 className="font-semibold text-gray-900">Write a Review</h3>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Your Rating
          </label>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1 hover:scale-110 transition-transform focus:outline-none"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => {
                    setRating(star);
                    setError(null);
                  }}
                >
                  {star <= (hoverRating || rating) ? (
                    <IconStarFilled size={32} className="text-yellow-400" />
                  ) : (
                    <IconStar size={32} className="text-gray-300 hover:text-yellow-400" />
                  )}
                </button>
              ))}
            </div>
            {rating > 0 && (
              <span className="text-sm text-gray-500">
                {rating} star{rating !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
            Your Review
          </label>
          <div className="relative">
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                setError(null);
              }}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                error && !comment.trim() ? 'border-red-300' : 'border-gray-300'
              }`}
              rows={4}
              placeholder="Share your experience with this doctor..."
              maxLength={500}
            />
            <div className="absolute bottom-3 right-3 text-sm text-gray-400">
              {comment.length}/500
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {submitting ? (
            <div className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Submitting...</span>
            </div>
          ) : (
            'Submit Review'
          )}
        </button>
      </form>
    </div>
  );
} 