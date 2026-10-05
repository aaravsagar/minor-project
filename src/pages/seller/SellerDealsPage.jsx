import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { dealService } from '../../services/dealService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Handshake, MessageSquare, CheckCircle2, User, Phone } from 'lucide-react';

export const SellerDealsPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeals = async () => {
      if (!currentUser?.uid) return;
      try {
        setLoading(true);
        const list = await dealService.getSellerDeals(currentUser.uid);
        setDeals(list);
      } catch (err) {
        console.error('Error fetching seller deals:', err);
        toast.error('Failed to load accepted deals.');
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
  }, [currentUser]);

  if (loading) {
    return <LoadingSpinner text="Loading accepted deals..." />;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Accepted Deals & Contracts</h1>
          <p className="page-description">
            Deals where buyers chose your pitch over competitors. Fulfill deliveries and coordinate handovers.
          </p>
        </div>
      </div>

      {deals.length === 0 ? (
        <EmptyState
          icon={Handshake}
          title="No accepted deals yet"
          description="Submit competitive pitches on active buyer requirements to win deals."
          actionText="Browse Open Demands"
          onAction={() => navigate('/seller/browse')}
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
                      Concluded on {formatDate(deal.createdAt, true)}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1F2933', margin: 0 }}>
                    {deal.requirementTitle}
                  </h3>
                  <div style={{ fontSize: '13px', color: '#4B5563', marginTop: '4px' }}>
                    Buyer: <strong style={{ color: '#1F2933' }}>{deal.buyerName}</strong>
                    {deal.buyerEmail && <span style={{ color: '#667085' }}> ({deal.buyerEmail})</span>}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11.5px', color: '#667085' }}>Agreed Deal Value</div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#287D3C' }}>
                    {formatCurrency(deal.dealPrice)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#667085' }}>
                    Delivery: {deal.deliveryTime}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid #F1F3F5',
                  paddingTop: '12px',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}
              >
                <div style={{ fontSize: '12.5px', color: deal.reviewed ? '#287D3C' : '#667085', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {deal.reviewed ? <CheckCircle2 size={15} /> : null}
                  {deal.reviewed ? 'Buyer has submitted a review' : 'Awaiting buyer review upon handover'}
                </div>

                <Link to="/seller/messages">
                  <Button variant="primary" size="sm" icon={MessageSquare}>
                    Chat with Buyer
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
