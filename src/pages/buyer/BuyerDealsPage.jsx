import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { dealService } from '../../services/dealService';
import { reviewService } from '../../services/reviewService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { RatingStars } from '../../components/common/RatingStars';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import { Textarea } from '../../components/common/FormControls';
import { 
  Handshake, 
  MessageSquare, 
  Star, 
  CheckCircle2, 
  Calendar, 
  Tag, 
  ShieldCheck 
} from 'lucide-react';

export const BuyerDealsPage = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review modal state
  const [reviewingDeal, setReviewingDeal] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  const fetchDeals = async () => {
    if (!currentUser?.uid) return;
    try {
      setLoading(true);
      const list = await dealService.getBuyerDeals(currentUser.uid);
      setDeals(list);
    } catch (err) {
      console.error('Error fetching deals:', err);
      toast.error('Failed to load deals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, [currentUser]);

  const handleMarkCompleted = async (deal) => {
    try {
      await dealService.markDealCompleted(deal.id);
      toast.success('Deal marked as completed! You can now leave a seller review.');
      setDeals(prev => prev.map(d => d.id === deal.id ? { ...d, status: 'completed' } : d));
    } catch (err) {
      toast.error('Failed to update deal status.');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewingDeal) return;

    try {
      setReviewLoading(true);
      await reviewService.submitReview({
        sellerId: reviewingDeal.sellerId,
        buyerId: currentUser.uid,
        buyerName: userProfile?.name || currentUser.displayName || 'Buyer',
        requirementId: reviewingDeal.requirementId,
        dealId: reviewingDeal.id,
        rating,
        comment
      });

      toast.success('Thank you! Your review and rating have been stored in Firestore.');
      setDeals(prev => prev.map(d => d.id === reviewingDeal.id ? { ...d, reviewed: true } : d));
      setReviewingDeal(null);
      setComment('');
      setRating(5);
    } catch (err) {
      console.error('Error submitting review:', err);
      toast.error(err.message || 'Failed to submit review.');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading accepted deals..." />;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Deals & Orders</h1>
          <p className="page-description">
            All concluded matches and accepted deals. Communicate with sellers and submit verified ratings.
          </p>
        </div>
      </div>

      {deals.length === 0 ? (
        <EmptyState
          icon={Handshake}
          title="No accepted deals yet"
          description="When you accept a seller's pitch from your 'Offers Received' page, the deal will appear here."
          actionText="View My Requirements"
          onAction={() => navigate('/buyer/requirements')}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {deals.map((deal) => (
            <div
              key={deal.id}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E5E9',
                borderRadius: '8px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <Badge variant={deal.status}>{deal.status}</Badge>
                    <span style={{ fontSize: '12.5px', color: '#667085' }}>
                      Deal Date: {formatDate(deal.createdAt, true)}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1F2933', margin: 0 }}>
                    {deal.requirementTitle}
                  </h3>
                  <div style={{ fontSize: '13px', color: '#4B5563', marginTop: '4px' }}>
                    Seller: <strong style={{ color: '#1F2933' }}>{deal.sellerName}</strong>
                    {deal.sellerEmail && <span style={{ color: '#667085' }}> ({deal.sellerEmail})</span>}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11.5px', color: '#667085' }}>Agreed Transaction Price</div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#287D3C' }}>
                    {formatCurrency(deal.dealPrice)}
                  </div>
                  {deal.condition && (
                    <div style={{ fontSize: '12px', color: '#667085' }}>Condition: {deal.condition}</div>
                  )}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid #F1F3F5',
                  paddingTop: '14px',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {deal.reviewed ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12.5px', color: '#287D3C', fontWeight: 600 }}>
                      <CheckCircle2 size={15} /> Review & Rating Submitted
                    </span>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Star}
                      onClick={() => setReviewingDeal(deal)}
                    >
                      Leave Seller Review
                    </Button>
                  )}

                  {deal.status === 'active' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleMarkCompleted(deal)}
                    >
                      Mark as Completed
                    </Button>
                  )}
                </div>

                <Link to="/buyer/messages">
                  <Button variant="primary" size="sm" icon={MessageSquare}>
                    Chat with Seller
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {reviewingDeal && (
        <Modal
          isOpen={!!reviewingDeal}
          onClose={() => setReviewingDeal(null)}
          title={`Rate & Review: ${reviewingDeal.sellerName}`}
          maxWidth="460px"
        >
          <form onSubmit={handleReviewSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label className="form-label">Rating (1 to 5 Stars)</label>
              <div style={{ padding: '8px 0' }}>
                <RatingStars
                  rating={rating}
                  interactive={true}
                  onChange={(val) => setRating(val)}
                  size={24}
                  showNumber={true}
                />
              </div>
            </div>

            <Textarea
              label="Review & Feedback"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Describe product condition upon delivery, timeliness, and transaction experience..."
              required
              rows={3}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
              <Button variant="secondary" onClick={() => setReviewingDeal(null)} disabled={reviewLoading}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" icon={Star} loading={reviewLoading}>
                Submit Review
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
