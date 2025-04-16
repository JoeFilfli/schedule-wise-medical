import { useEffect, useState } from 'react';
import { IconStarFilled, IconTrophy } from '@tabler/icons-react';
import Image from 'next/image';
import { format } from 'date-fns';

interface DoctorRanking {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture: string | null;
  averageRating: number;
  totalReviews: number;
}

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

interface DoctorRankingReviewsProps {
  doctorId: string;
}

export function DoctorRankingReviews({ doctorId }: DoctorRankingReviewsProps) {
  const [rankings, setRankings] = useState<DoctorRanking[]>([]);
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rankingsRes, reviewsRes] = await Promise.all([
          fetch('/api/doctors/rankings'),
          fetch(`/api/doctors/${doctorId}/reviews?limit=5`)
        ]);

        const [rankingsData, reviewsData] = await Promise.all([
          rankingsRes.json(),
          reviewsRes.json()
        ]);

        setRankings(rankingsData);
        setRecentReviews(reviewsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [doctorId]);

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  const currentDoctorRank = rankings.findIndex(doc => doc.id === doctorId) + 1;
  const currentDoctor = rankings.find(doc => doc.id === doctorId);

  if (!currentDoctor) {
    return <div className="text-center p-4">Doctor not found</div>;
  }

  return (
    <div className="container-fluid py-4">
      <div className="row g-4">
        {/* Doctor's Score Card */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm rounded-3 h-100">
            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-4 mb-4">
                {currentDoctor.profilePicture ? (
                  <Image
                    src={currentDoctor.profilePicture}
                    alt={`${currentDoctor.firstName} ${currentDoctor.lastName}`}
                    width={80}
                    height={80}
                    className="rounded-circle"
                  />
                ) : (
                  <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center"
                       style={{ width: '80px', height: '80px' }}>
                    <span className="text-white h3 mb-0">
                      {currentDoctor.firstName[0]}{currentDoctor.lastName[0]}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="mb-1">Dr. {currentDoctor.firstName} {currentDoctor.lastName}</h3>
                  <div className="d-flex align-items-center gap-2">
                    <div className="bg-warning-subtle rounded-pill px-3 py-1">
                      <IconTrophy size={20} className="text-warning me-1" />
                      <span className="fw-semibold">Rank #{currentDoctorRank}</span>
                    </div>
                    <div className="bg-primary-subtle rounded-pill px-3 py-1">
                      <span className="fw-semibold">{currentDoctor.averageRating.toFixed(1)}</span>
                      <IconStarFilled size={16} className="text-warning ms-1" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Doctors Ranking */}
              <h5 className="mb-3">Top Doctors Ranking</h5>
              <div className="d-flex flex-column gap-3">
                {rankings.slice(0, 5).map((doctor, index) => (
                  <div key={doctor.id} 
                       className={`d-flex align-items-center p-3 rounded-3 ${doctor.id === doctorId ? 'bg-light' : ''}`}>
                    <div className="me-3">
                      <span className={`fw-bold ${index < 3 ? 'text-warning' : 'text-muted'}`}>
                        #{index + 1}
                      </span>
                    </div>
                    <div className="d-flex align-items-center gap-2 flex-grow-1">
                      {doctor.profilePicture ? (
                        <Image
                          src={doctor.profilePicture}
                          alt={`${doctor.firstName} ${doctor.lastName}`}
                          width={40}
                          height={40}
                          className="rounded-circle"
                        />
                      ) : (
                        <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center"
                             style={{ width: '40px', height: '40px' }}>
                          <span className="text-white">{doctor.firstName[0]}{doctor.lastName[0]}</span>
                        </div>
                      )}
                      <div>
                        <div className="fw-medium">Dr. {doctor.firstName} {doctor.lastName}</div>
                        <div className="text-muted small">{doctor.totalReviews} reviews</div>
                      </div>
                    </div>
                    <div className="ms-auto">
                      <span className="fw-semibold">{doctor.averageRating.toFixed(1)}</span>
                      <IconStarFilled size={16} className="text-warning ms-1" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm rounded-3 h-100">
            <div className="card-body p-4">
              <h5 className="mb-4">Recent Reviews</h5>
              <div className="d-flex flex-column gap-4">
                {recentReviews.map((review) => (
                  <div key={review.id} className="card bg-light border-0 rounded-3">
                    <div className="card-body">
                      <div className="d-flex gap-3">
                        <div className="flex-shrink-0">
                          {review.patient.profilePicture ? (
                            <Image
                              src={review.patient.profilePicture}
                              alt={`${review.patient.firstName} ${review.patient.lastName}`}
                              width={48}
                              height={48}
                              className="rounded-circle"
                            />
                          ) : (
                            <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center"
                                 style={{ width: '48px', height: '48px' }}>
                              <span className="text-white">
                                {review.patient.firstName[0]}{review.patient.lastName[0]}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <div>
                              <h6 className="mb-0">{review.patient.firstName} {review.patient.lastName}</h6>
                              <small className="text-muted">
                                {format(new Date(review.createdAt), 'MMM d, yyyy')}
                              </small>
                            </div>
                            <div className="d-flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <IconStarFilled
                                  key={star}
                                  size={16}
                                  className={star <= review.rating ? 'text-warning' : 'text-muted'}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="mb-0 text-secondary">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 