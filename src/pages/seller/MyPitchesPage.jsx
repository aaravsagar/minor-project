import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { pitchService } from '../../services/pitchService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Send, MessageSquare, Search, Clock, CheckCircle2 } from 'lucide-react';

export const MyPitchesPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'pending' | 'accepted' | 'rejected'

  useEffect(() => {
    const fetchPitches = async () => {
      if (!currentUser?.uid) return;
      try {
        setLoading(true);
        const list = await pitchService.getSellerPitches(currentUser.uid);
        setPitches(list);
      } catch (err) {
        console.error('Error fetching pitches:', err);
        toast.error('Failed to load your pitches.');
      } finally {
        setLoading(false);
      }
    };
    fetchPitches();
  }, [currentUser]);

  const filtered = pitches.filter(p => {
    if (filterStatus === 'all') return true;
    return p.status === filterStatus;
  });

  if (loading) {
    return <LoadingSpinner text="Loading submitted pitches..." />;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Pitches & Offers</h1>
          <p className="page-description">
            Track all offers submitted to buyers. When a buyer accepts your offer, you can start direct communication.
          </p>
        </div>
        <Button
          variant="primary"
          icon={Search}
          onClick={() => navigate('/seller/browse')}
        >
          Browse Open Demands
        </Button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', borderBottom: '1px solid #E2E5E9', paddingBottom: '10px' }}>
        {['all', 'pending', 'accepted', 'rejected'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: filterStatus === st ? 600 : 500,
              backgroundColor: filterStatus === st ? '#EBF2FC' : 'transparent',
              color: filterStatus === st ? '#2457A6' : '#667085',
              border: filterStatus === st ? '1px solid #BCD0EE' : '1px solid transparent',
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {st} ({st === 'all' ? pitches.length : pitches.filter(p => p.status === st).length})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Send}
          title={filterStatus === 'all' ? "You haven't submitted any pitches yet" : `No ${filterStatus} pitches found`}
          description={filterStatus === 'all' ? "Browse open buyer requirements in Ahmedabad and send your competitive quotes." : "Try changing the filter tab."}
          actionText={filterStatus === 'all' ? "Browse Demands" : undefined}
          actionIcon={Search}
          onAction={() => navigate('/seller/browse')}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filtered.map((pitch) => (
            <div
              key={pitch.id}
              style={{
                backgroundColor: '#FFFFFF',
                border: pitch.status === 'accepted' ? '2px solid #287D3C' : '1px solid #E2E5E9',
                borderRadius: '8px',
                padding: '18px 20px',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <Badge variant={pitch.status}>{pitch.status}</Badge>
                    <span style={{ fontSize: '12px', color: '#667085' }}>
                      Submitted {formatDate(pitch.createdAt, true)}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#667085' }}>
                    Offer Price:
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: pitch.status === 'accepted' ? '#287D3C' : '#2457A6' }}>
                    {formatCurrency(pitch.offerPrice)}
                  </div>
                </div>

                <div style={{ textAlign: 'right', fontSize: '12.5px', color: '#4B5563' }}>
                  <div>Condition: <strong>{pitch.condition}</strong></div>
                  <div>Delivery: <strong>{pitch.deliveryTime}</strong></div>
                </div>
              </div>

              <div style={{ fontSize: '13px', color: '#334155', backgroundColor: '#F8FAFC', padding: '10px 14px', borderRadius: '6px' }}>
                <strong>Description pitched:</strong> {pitch.description}
                {pitch.sellerNote && (
                  <div style={{ marginTop: '4px', fontSize: '12px', color: '#667085', fontStyle: 'italic' }}>
                    Note: "{pitch.sellerNote}"
                  </div>
                )}
              </div>

              {pitch.status === 'accepted' && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #E2E5E9', paddingTop: '10px' }}>
                  <Link to="/seller/messages">
                    <Button variant="primary" size="sm" icon={MessageSquare}>
                      Open Chat with Buyer
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
