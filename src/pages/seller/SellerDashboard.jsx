import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { requirementService } from '../../services/requirementService';
import { pitchService } from '../../services/pitchService';
import { dealService } from '../../services/dealService';
import { reviewService } from '../../services/reviewService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { RatingStars } from '../../components/common/RatingStars';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { 
  Search, 
  Send, 
  Handshake, 
  Star, 
  Tag, 
  Clock, 
  MapPin, 
  TrendingUp, 
  CheckCircle2 
} from 'lucide-react';

export const SellerDashboard = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  const [availableReqs, setAvailableReqs] = useState([]);
  const [myPitches, setMyPitches] = useState([]);
  const [deals, setDeals] = useState([]);
  const [trustStats, setTrustStats] = useState({ trustScore: 5.0, reviewCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!currentUser?.uid) return;
      try {
        setLoading(true);
        const [reqs, pitches, sellerDeals, stats] = await Promise.all([
          requirementService.getActiveRequirements({ sortBy: 'newest' }),
          pitchService.getSellerPitches(currentUser.uid),
          dealService.getSellerDeals(currentUser.uid),
          reviewService.getSellerTrustScore(currentUser.uid)
        ]);
        setAvailableReqs(reqs);
        setMyPitches(pitches);
        setDeals(sellerDeals);
        setTrustStats(stats);
      } catch (err) {
        console.error('Error loading seller dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, [currentUser]);

  if (loading) {
    return <LoadingSpinner text="Loading your seller dashboard..." />;
  }

  const acceptedPitches = myPitches.filter(p => p.status === 'accepted');
  const acceptanceRate = myPitches.length > 0 
    ? Math.round((acceptedPitches.length / myPitches.length) * 100) 
    : 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Seller Dashboard</h1>
          <p className="page-description">
            Welcome back, {userProfile?.name || currentUser?.displayName || 'Seller'}. Browse buyer demands in Ahmedabad and pitch competitive offers.
          </p>
        </div>
        <Button
          variant="primary"
          icon={Search}
          onClick={() => navigate('/seller/browse')}
        >
          Browse Open Requirements
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div>
            <div className="stat-label">Available Demands</div>
            <div className="stat-value">{availableReqs.length}</div>
          </div>
          <div className="stat-icon-wrapper">
            <Search size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">My Pitches</div>
            <div className="stat-value">{myPitches.length}</div>
          </div>
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#FEF6EC', color: '#A15C00' }}>
            <Send size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Accepted Deals</div>
            <div className="stat-value">{deals.length}</div>
          </div>
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#EBF6EE', color: '#287D3C' }}>
            <Handshake size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Trust Score</div>
            <div className="stat-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {trustStats.trustScore ? Number(trustStats.trustScore).toFixed(1) : '5.0'}
              <Star size={18} fill="#F59E0B" stroke="none" />
            </div>
          </div>
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#FFFBEB', color: '#B45309' }}>
            <TrendingUp size={22} />
          </div>
        </div>
      </div>

      {/* Active Buyer Requirements Section */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Latest Buyer Demands (Ahmedabad)</h2>
            <p className="card-subtitle">Direct requirements posted by buyers seeking quotes</p>
          </div>
          <Link to="/seller/browse">
            <Button variant="ghost" size="sm">
              View All Demands ({availableReqs.length})
            </Button>
          </Link>
        </div>

        {availableReqs.length === 0 ? (
          <EmptyState
            title="No active requirements available"
            description="All posted buyer requirements have either been fulfilled or closed. Check back soon for new demands."
          />
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Buyer Requirement</th>
                  <th>Category</th>
                  <th>Budget Limit</th>
                  <th>Location</th>
                  <th>Urgency</th>
                  <th>Competitors</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {availableReqs.slice(0, 5).map((req) => (
                  <tr key={req.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#1F2933' }}>{req.title}</div>
                      <div style={{ fontSize: '12px', color: '#667085' }}>Posted by {req.buyerName}</div>
                    </td>
                    <td>{req.categoryName}</td>
                    <td style={{ fontWeight: 600, color: '#2457A6' }}>{formatCurrency(req.budget)}</td>
                    <td>{req.location}</td>
                    <td>{req.urgency}</td>
                    <td>
                      <span style={{ fontSize: '12.5px', color: '#667085' }}>
                        {req.offerCount || 0} pitches
                      </span>
                    </td>
                    <td>
                      <Link to={`/seller/browse?req=${req.id}`}>
                        <Button variant="primary" size="sm">
                          Submit Offer
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* My Submitted Pitches */}
      {myPitches.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">My Recent Pitches</h2>
              <p className="card-subtitle">Track buyer decisions on your submitted offers</p>
            </div>
            <Link to="/seller/pitches">
              <Button variant="ghost" size="sm">
                View All Pitches ({myPitches.length})
              </Button>
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            {myPitches.slice(0, 3).map((pitch) => (
              <div
                key={pitch.id}
                style={{
                  border: pitch.status === 'accepted' ? '2px solid #287D3C' : '1px solid #E2E5E9',
                  borderRadius: '6px',
                  padding: '16px',
                  backgroundColor: pitch.status === 'accepted' ? '#F9FDF9' : '#FFFFFF',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <Badge variant={pitch.status}>{pitch.status}</Badge>
                    <span style={{ fontSize: '12px', color: '#667085' }}>{formatDate(pitch.createdAt)}</span>
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: pitch.status === 'accepted' ? '#287D3C' : '#2457A6', marginBottom: '4px' }}>
                    {formatCurrency(pitch.offerPrice)}
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#4B5563', marginBottom: '6px' }}>
                    Condition: <strong>{pitch.condition}</strong> • Delivery: {pitch.deliveryTime}
                  </div>
                  <p style={{ fontSize: '12.5px', color: '#667085', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    "{pitch.description}"
                  </p>
                </div>

                {pitch.status === 'accepted' && (
                  <div style={{ marginTop: '12px' }}>
                    <Link to="/seller/messages">
                      <Button variant="primary" size="sm" style={{ width: '100%' }}>
                        Open Chat with Buyer
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
