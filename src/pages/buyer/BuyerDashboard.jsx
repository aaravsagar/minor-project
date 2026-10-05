import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { requirementService } from '../../services/requirementService';
import { dealService } from '../../services/dealService';
import { pitchService } from '../../services/pitchService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { 
  Layers, 
  Inbox, 
  Handshake, 
  PlusCircle, 
  ArrowRight, 
  Clock, 
  MapPin, 
  CheckCircle2 
} from 'lucide-react';

export const BuyerDashboard = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [requirements, setRequirements] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!currentUser?.uid) return;
      try {
        setLoading(true);
        const [reqs, userDeals] = await Promise.all([
          requirementService.getBuyerRequirements(currentUser.uid),
          dealService.getBuyerDeals(currentUser.uid)
        ]);
        setRequirements(reqs);
        setDeals(userDeals);
      } catch (err) {
        console.error('Error loading buyer dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [currentUser]);

  if (loading) {
    return <LoadingSpinner text="Loading your buyer dashboard..." />;
  }

  const activeReqs = requirements.filter(r => r.status === 'active');
  const fulfilledReqs = requirements.filter(r => r.status === 'fulfilled');
  const totalOffersReceived = requirements.reduce((sum, r) => sum + (r.offerCount || 0), 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Buyer Dashboard</h1>
          <p className="page-description">
            Welcome back, {userProfile?.name || currentUser?.displayName || 'Buyer'}. Here is an overview of your active needs and received offers.
          </p>
        </div>
        <Button
          variant="primary"
          icon={PlusCircle}
          onClick={() => navigate('/buyer/requirements/new')}
        >
          Post a Requirement
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div>
            <div className="stat-label">Active Requirements</div>
            <div className="stat-value">{activeReqs.length}</div>
          </div>
          <div className="stat-icon-wrapper">
            <Layers size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Total Offers Received</div>
            <div className="stat-value">{totalOffersReceived}</div>
          </div>
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#FEF6EC', color: '#A15C00' }}>
            <Inbox size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Accepted Deals / Matches</div>
            <div className="stat-value">{deals.length}</div>
          </div>
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#EBF6EE', color: '#287D3C' }}>
            <Handshake size={22} />
          </div>
        </div>
      </div>

      {/* Active Requirements List */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">My Recent Requirements</h2>
            <p className="card-subtitle">Manage your posted needs and evaluate incoming seller pitches</p>
          </div>
          <Link to="/buyer/requirements">
            <Button variant="ghost" size="sm">
              View All ({requirements.length})
            </Button>
          </Link>
        </div>

        {requirements.length === 0 ? (
          <EmptyState
            title="You haven't posted any requirements yet"
            description="Post your first requirement to let verified local sellers send you competitive offers."
            actionText="Post Your First Requirement"
            actionIcon={PlusCircle}
            onAction={() => navigate('/buyer/requirements/new')}
          />
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Requirement</th>
                  <th>Category</th>
                  <th>Max Budget</th>
                  <th>Location</th>
                  <th>Urgency</th>
                  <th>Status</th>
                  <th>Offers</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {requirements.slice(0, 5).map((req) => (
                  <tr key={req.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#1F2933' }}>{req.title}</div>
                      <div style={{ fontSize: '12px', color: '#667085' }}>Posted {formatDate(req.createdAt)}</div>
                    </td>
                    <td>{req.categoryName}</td>
                    <td style={{ fontWeight: 600, color: '#2457A6' }}>{formatCurrency(req.budget)}</td>
                    <td>{req.location}</td>
                    <td>{req.urgency}</td>
                    <td>
                      <Badge variant={req.status}>{req.status}</Badge>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: req.offerCount > 0 ? '#287D3C' : '#667085' }}>
                        {req.offerCount || 0} offers
                      </span>
                    </td>
                    <td>
                      <Link to={`/buyer/offers/${req.id}`}>
                        <Button variant={req.offerCount > 0 ? 'primary' : 'outline'} size="sm">
                          View Offers
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

      {/* Active Deals / Next Steps */}
      {deals.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Accepted Deals & Active Orders</h2>
              <p className="card-subtitle">Connect with your accepted sellers to conclude deliveries</p>
            </div>
            <Link to="/buyer/deals">
              <Button variant="ghost" size="sm">
                View All Deals
              </Button>
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            {deals.slice(0, 3).map((deal) => (
              <div
                key={deal.id}
                style={{
                  border: '1px solid #E2E5E9',
                  borderRadius: '6px',
                  padding: '16px',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <Badge variant={deal.status}>{deal.status}</Badge>
                    <span style={{ fontSize: '12px', color: '#667085' }}>{formatDate(deal.createdAt)}</span>
                  </div>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#1F2933', marginBottom: '4px' }}>
                    {deal.requirementTitle}
                  </h4>
                  <div style={{ fontSize: '12.5px', color: '#4B5563', marginBottom: '8px' }}>
                    Accepted Seller: <strong>{deal.sellerName}</strong>
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#287D3C', marginBottom: '12px' }}>
                    Agreed Price: {formatCurrency(deal.dealPrice)}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <Link to={`/buyer/messages`} style={{ flex: 1 }}>
                    <Button variant="outline" size="sm" style={{ width: '100%' }}>
                      Open Chat
                    </Button>
                  </Link>
                  <Link to={`/buyer/deals`}>
                    <Button variant="secondary" size="sm">
                      Details
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
