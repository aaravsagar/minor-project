import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { requirementService } from '../../services/requirementService';
import { pitchService } from '../../services/pitchService';
import { dealService } from '../../services/dealService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { RatingStars } from '../../components/common/RatingStars';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ConfirmDialog, Modal } from '../../components/common/Modal';
import { ReportModal } from '../../components/common/ReportModal';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  MessageSquare, 
  TrendingDown, 
  Flag,
  User,
  Info,
  Phone
} from 'lucide-react';

export const BuyerOffersPage = () => {
  const { requirementId } = useParams();
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [myRequirements, setMyRequirements] = useState([]);
  const [selectedReqId, setSelectedReqId] = useState(requirementId || '');
  const [requirement, setRequirement] = useState(null);
  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(true);

  const [offerSortBy, setOfferSortBy] = useState('mcdm');

  // Multi-Criteria sorted pitches
  const sortedPitches = [...pitches].sort((a, b) => {
    if (offerSortBy === 'mcdm') {
      return (b.mcdm?.score ?? 0) - (a.mcdm?.score ?? 0);
    }
    if (offerSortBy === 'price-low') {
      return Number(a.offerPrice) - Number(b.offerPrice);
    }
    if (offerSortBy === 'rating-high') {
      return (Number(b.sellerTrustScore) || 5) - (Number(a.sellerTrustScore) || 5);
    }
    if (offerSortBy === 'delivery-fast') {
      return (a.mcdm?.criteria?.deliveryDays ?? 99) - (b.mcdm?.criteria?.deliveryDays ?? 99);
    }
    return 0;
  });

  // Acceptance confirmation state
  const [acceptingPitch, setAcceptingPitch] = useState(null);
  const [acceptLoading, setAcceptLoading] = useState(false);
  const [acceptedResult, setAcceptedResult] = useState(null);

  // Seller Details Modal
  const [viewingSeller, setViewingSeller] = useState(null);

  // Report Modal
  const [reportingPitch, setReportingPitch] = useState(null);

  // Load all buyer requirements for selector
  useEffect(() => {
    const loadAllReqs = async () => {
      if (!currentUser?.uid) return;
      try {
        const reqs = await requirementService.getBuyerRequirements(currentUser.uid);
        setMyRequirements(reqs);
        if (!selectedReqId && reqs.length > 0) {
          setSelectedReqId(reqs[0].id);
        }
      } catch (err) {
        console.error('Error loading requirements list:', err);
      }
    };
    loadAllReqs();
  }, [currentUser]);

  // Load active requirement and its pitches
  useEffect(() => {
    if (!selectedReqId) {
      setLoading(false);
      return;
    }

    const loadOffers = async () => {
      try {
        setLoading(true);
        const [req, pitchList] = await Promise.all([
          requirementService.getRequirementById(selectedReqId),
          pitchService.getPitchesByRequirement(selectedReqId)
        ]);
        setRequirement(req);
        setPitches(pitchList);
      } catch (err) {
        console.error('Error loading offers:', err);
        toast.error('Failed to load seller pitches.');
      } finally {
        setLoading(false);
      }
    };
    loadOffers();
  }, [selectedReqId]);

  const handleAcceptOffer = async () => {
    if (!acceptingPitch || !requirement) return;

    try {
      setAcceptLoading(true);
      const result = await dealService.acceptOffer({
        requirement,
        pitch: acceptingPitch,
        buyer: currentUser
      });

      toast.success('Offer accepted! Requirement marked as fulfilled.');

      // Update local state
      setRequirement(prev => ({ ...prev, status: 'fulfilled', acceptedPitchId: acceptingPitch.id }));
      setPitches(prev => prev.map(p => {
        if (p.id === acceptingPitch.id) return { ...p, status: 'accepted' };
        if (p.status === 'pending') return { ...p, status: 'rejected' };
        return p;
      }));

      setAcceptedResult(result);
      setAcceptingPitch(null);
    } catch (err) {
      console.error('Error accepting offer:', err);
      toast.error('Failed to accept offer: ' + err.message);
    } finally {
      setAcceptLoading(false);
    }
  };

  if (loading && !requirement) {
    return <LoadingSpinner text="Loading offer comparison matrix..." />;
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Button
            variant="secondary"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate('/buyer/requirements')}
          >
            Back to Requirements
          </Button>
          <div>
            <h1 className="page-title">Offers Received & Pitch Comparison</h1>
            <p className="page-description">
              Compare seller offers side-by-side on price, product condition, delivery timeline, and seller trust score.
            </p>
          </div>
        </div>

        {/* Dropdown to switch requirements */}
        {myRequirements.length > 1 && (
          <div style={{ minWidth: '240px' }}>
            <select
              value={selectedReqId}
              onChange={(e) => {
                setSelectedReqId(e.target.value);
                navigate(`/buyer/offers/${e.target.value}`);
              }}
              className="form-control"
            >
              {myRequirements.map(r => (
                <option key={r.id} value={r.id}>
                  {r.title} ({r.offerCount || 0} offers)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Selected Requirement Summary Card */}
      {requirement ? (
        <div className="card" style={{ borderLeft: '4px solid #2457A6', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Badge variant={requirement.status}>{requirement.status}</Badge>
                <span style={{ fontSize: '13px', color: '#667085' }}>{requirement.categoryName}</span>
                <span style={{ fontSize: '13px', color: '#667085' }}>•</span>
                <span style={{ fontSize: '13px', color: '#667085' }}>Posted {formatDate(requirement.createdAt)}</span>
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1F2933', margin: '0 0 6px 0' }}>
                {requirement.title}
              </h2>
              <p style={{ fontSize: '13.5px', color: '#4B5563', margin: 0, maxWidth: '720px' }}>
                {requirement.description}
              </p>
            </div>

            <div style={{ textAlign: 'right', backgroundColor: '#F8FAFC', padding: '12px 18px', borderRadius: '6px', border: '1px solid #E2E5E9' }}>
              <div style={{ fontSize: '12px', color: '#667085' }}>Your Target Budget</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#2457A6' }}>
                {formatCurrency(requirement.budget)}
              </div>
              <div style={{ fontSize: '11.5px', color: '#667085', marginTop: '2px' }}>
                {requirement.location} • {requirement.urgency}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No Requirement Selected"
          description="Please post or select a requirement to view received offers."
          actionText="My Requirements"
          onAction={() => navigate('/buyer/requirements')}
        />
      )}

      {/* Offers Comparison Section */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 className="card-title">
              Seller Pitches ({pitches.length})
            </h3>
            <p className="card-subtitle">
              Sellers competing to fulfill your requirement. Evaluated via Multi-Criteria Decision-Making (MCDM) model.
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {pitches.length > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12.5px', color: '#667085', fontWeight: 500 }}>Rank by:</span>
                <select
                  value={offerSortBy}
                  onChange={(e) => setOfferSortBy(e.target.value)}
                  className="form-control"
                  style={{ width: 'auto', padding: '6px 10px', fontSize: '13px' }}
                >
                  <option value="mcdm">★ MCDM Best Match (Rating + Price + Delivery)</option>
                  <option value="price-low">Lowest Offer Price</option>
                  <option value="rating-high">Highest Seller Trust Score</option>
                  <option value="delivery-fast">Fastest Delivery Timeline</option>
                </select>
              </div>
            )}

            {requirement?.status === 'fulfilled' && (
              <Badge variant="fulfilled">Offer Accepted / Deal Concluded</Badge>
            )}
          </div>
        </div>

        {pitches.length === 0 ? (
          <EmptyState
            title="No offers received yet"
            description="Active sellers in Ahmedabad are reviewing your requirement. Offers will appear here as soon as they are submitted."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {sortedPitches.map((pitch) => {
              const savings = (requirement?.budget || 0) - Number(pitch.offerPrice);
              const isAccepted = pitch.status === 'accepted';
              const isRejected = pitch.status === 'rejected';

              return (
                <div
                  key={pitch.id}
                  style={{
                    border: isAccepted ? '2px solid #287D3C' : (pitch.mcdm?.isTopRecommendation ? '2px solid #2457A6' : '1px solid #E2E5E9'),
                    borderRadius: '8px',
                    padding: '20px',
                    backgroundColor: isAccepted ? '#F9FDF9' : '#FFFFFF',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {/* MCDM Recommended Ribbon / Indicator */}
                  {pitch.mcdm && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px solid #F1F3F5', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {pitch.mcdm.isTopRecommendation && (
                          <span style={{ backgroundColor: '#2457A6', color: '#FFFFFF', padding: '3px 8px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            ★ Top Recommendation • Rank #{pitch.mcdm.rank}
                          </span>
                        )}
                        {!pitch.mcdm.isTopRecommendation && (
                          <span style={{ backgroundColor: '#F1F5F9', color: '#475569', padding: '3px 8px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 600 }}>
                            Rank #{pitch.mcdm.rank} of {pitches.length}
                          </span>
                        )}
                        <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#1E40AF' }}>
                          MCDM Match Score: {pitch.mcdm.scorePercentage}/100
                        </span>
                      </div>

                      <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                        Normalized Factors: Rating {(pitch.mcdm.normalized.rating * 100).toFixed(0)}% • Price {(pitch.mcdm.normalized.price * 100).toFixed(0)}% • Speed {(pitch.mcdm.normalized.deliveryTime * 100).toFixed(0)}%
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '14px' }}>
                    {/* Seller Profile Summary */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '6px',
                          backgroundColor: '#EBF2FC',
                          color: '#2457A6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '16px',
                          flexShrink: 0
                        }}
                      >
                        {pitch.sellerName[0]?.toUpperCase() || 'S'}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '15px', fontWeight: 600, color: '#1F2933' }}>
                            {pitch.sellerName}
                          </span>
                          <Badge variant={pitch.status}>{pitch.status}</Badge>
                        </div>

                        {/* Rating & Trust Score from Firestore */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                          <RatingStars rating={pitch.sellerAverageRating || 5} size={14} />
                          <span style={{ fontSize: '12.5px', color: '#4B5563', fontWeight: 600 }}>
                            Trust Score: {pitch.sellerTrustScore ? Number(pitch.sellerTrustScore).toFixed(1) : '5.0'} / 5.0
                          </span>
                          {pitch.sellerLocation && (
                            <span style={{ fontSize: '12px', color: '#667085' }}>
                              • {pitch.sellerLocation}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Price & Savings */}
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '11px', color: '#667085' }}>Offered Price</div>
                      <div style={{ fontSize: '22px', fontWeight: 700, color: isAccepted ? '#287D3C' : '#2457A6' }}>
                        {formatCurrency(pitch.offerPrice)}
                      </div>
                      {savings > 0 && (
                        <div style={{ fontSize: '12px', color: '#287D3C', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '3px' }}>
                          <TrendingDown size={14} /> Saves {formatCurrency(savings)} under budget
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pitch Specifications Matrix */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: '12px',
                      backgroundColor: '#F8FAFC',
                      padding: '12px 16px',
                      borderRadius: '6px',
                      marginBottom: '12px',
                      fontSize: '13px'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '11px', color: '#667085', fontWeight: 500 }}>Condition Offered</div>
                      <div style={{ fontWeight: 600, color: '#1F2933' }}>{pitch.condition || 'Good'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: '#667085', fontWeight: 500 }}>Estimated Delivery / Handover</div>
                      <div style={{ fontWeight: 600, color: '#1F2933' }}>{pitch.deliveryTime}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: '#667085', fontWeight: 500 }}>Pitch Submitted On</div>
                      <div style={{ color: '#4B5563' }}>{formatDate(pitch.createdAt, true)}</div>
                    </div>
                  </div>

                  {/* Description & Note */}
                  <div style={{ marginBottom: '14px', fontSize: '13.5px', color: '#334155', lineHeight: 1.5 }}>
                    <strong>Seller Details:</strong> {pitch.description}
                    {pitch.sellerNote && (
                      <div style={{ marginTop: '4px', fontSize: '12.5px', color: '#667085', fontStyle: 'italic' }}>
                        Note: "{pitch.sellerNote}"
                      </div>
                    )}
                  </div>

                  {/* Action Bar */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid #E2E5E9',
                      paddingTop: '12px',
                      flexWrap: 'wrap',
                      gap: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={User}
                        onClick={() => setViewingSeller(pitch)}
                      >
                        Seller Info
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Flag}
                        onClick={() => setReportingPitch(pitch)}
                      >
                        Report Offer
                      </Button>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      {isAccepted ? (
                        <>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#287D3C', fontWeight: 600, fontSize: '13px', marginRight: '8px' }}>
                            <CheckCircle2 size={16} /> Deal Locked
                          </span>
                          <Link to="/buyer/messages">
                            <Button variant="primary" size="sm" icon={MessageSquare}>
                              Open Real-time Chat
                            </Button>
                          </Link>
                        </>
                      ) : requirement?.status === 'active' && pitch.status === 'pending' ? (
                        <Button
                          variant="primary"
                          size="md"
                          icon={CheckCircle2}
                          onClick={() => setAcceptingPitch(pitch)}
                        >
                          Accept This Offer
                        </Button>
                      ) : isRejected ? (
                        <span style={{ fontSize: '12.5px', color: '#667085', fontStyle: 'italic' }}>
                          Another offer was selected
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Dialog on Accept Offer */}
      <ConfirmDialog
        isOpen={!!acceptingPitch}
        onClose={() => setAcceptingPitch(null)}
        onConfirm={handleAcceptOffer}
        title="Accept Seller Offer"
        message={`Are you sure you want to accept ${acceptingPitch?.sellerName}'s offer of ${formatCurrency(acceptingPitch?.offerPrice)}? This will mark your requirement as FULFILLED and initialize a 1-to-1 conversation with the seller.`}
        confirmText="Confirm & Accept Offer"
        variant="primary"
        loading={acceptLoading}
      />

      {/* Success Modal after Offer Acceptance */}
      <Modal
        isOpen={!!acceptedResult}
        onClose={() => setAcceptedResult(null)}
        title="Offer Accepted Successfully!"
        maxWidth="460px"
      >
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#EBF6EE',
              color: '#287D3C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}
          >
            <CheckCircle2 size={32} />
          </div>
          <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#1F2933', marginBottom: '8px' }}>
            Requirement Fulfilled
          </h3>
          <p style={{ fontSize: '13.5px', color: '#667085', marginBottom: '20px', lineHeight: 1.45 }}>
            A formal deal record has been created in Firebase Firestore. You can now communicate directly with the seller in real-time to organize delivery and handover.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <Button variant="secondary" onClick={() => setAcceptedResult(null)}>
              Stay on Comparison Page
            </Button>
            <Button
              variant="primary"
              icon={MessageSquare}
              onClick={() => {
                setAcceptedResult(null);
                navigate('/buyer/messages');
              }}
            >
              Start Conversation
            </Button>
          </div>
        </div>
      </Modal>

      {/* Seller Details Modal */}
      {viewingSeller && (
        <Modal
          isOpen={!!viewingSeller}
          onClose={() => setViewingSeller(null)}
          title={`Seller Details: ${viewingSeller.sellerName}`}
          maxWidth="460px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13.5px' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#667085', textTransform: 'uppercase' }}>Seller Business / Name</div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#1F2933' }}>{viewingSeller.sellerName}</div>
            </div>

            <div className="grid-2">
              <div>
                <div style={{ fontSize: '11px', color: '#667085', textTransform: 'uppercase' }}>Location</div>
                <div style={{ fontWeight: 500 }}>{viewingSeller.sellerLocation || 'Ahmedabad'}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#667085', textTransform: 'uppercase' }}>Contact Phone</div>
                <div style={{ fontWeight: 500 }}>{viewingSeller.sellerPhone || 'Available upon acceptance'}</div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: '#667085', textTransform: 'uppercase' }}>Trust Score & Verification</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <RatingStars rating={viewingSeller.sellerAverageRating || 5} size={16} />
                <strong style={{ color: '#1F2933' }}>{viewingSeller.sellerTrustScore ? Number(viewingSeller.sellerTrustScore).toFixed(1) : '5.0'} / 5.0</strong>
                <span style={{ color: '#667085', fontSize: '12px' }}>({viewingSeller.sellerReviewCount || 0} reviews)</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <Button variant="secondary" onClick={() => setViewingSeller(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Report Offer Modal */}
      {reportingPitch && (
        <ReportModal
          isOpen={!!reportingPitch}
          onClose={() => setReportingPitch(null)}
          targetId={reportingPitch.id}
          targetType="pitch"
          targetTitleOrName={`Offer by ${reportingPitch.sellerName} (${formatCurrency(reportingPitch.offerPrice)})`}
        />
      )}
    </div>
  );
};
