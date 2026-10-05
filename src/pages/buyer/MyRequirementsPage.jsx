import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { requirementService } from '../../services/requirementService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ConfirmDialog } from '../../components/common/Modal';
import { 
  PlusCircle, 
  Inbox, 
  XCircle, 
  Clock, 
  MapPin, 
  Tag,
  CheckCircle2,
  Filter
} from 'lucide-react';

export const MyRequirementsPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'active' | 'fulfilled' | 'closed'

  // Dialog state
  const [closingReq, setClosingReq] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRequirements = async () => {
    if (!currentUser?.uid) return;
    try {
      setLoading(true);
      const list = await requirementService.getBuyerRequirements(currentUser.uid);
      setRequirements(list);
    } catch (err) {
      console.error('Error fetching requirements:', err);
      toast.error('Failed to load your requirements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequirements();
  }, [currentUser]);

  const handleCloseRequirement = async () => {
    if (!closingReq) return;
    try {
      setActionLoading(true);
      await requirementService.updateRequirementStatus(closingReq.id, 'closed');
      toast.success('Requirement closed successfully.');
      setRequirements(prev => prev.map(r => r.id === closingReq.id ? { ...r, status: 'closed' } : r));
      setClosingReq(null);
    } catch (err) {
      toast.error('Failed to close requirement.');
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = requirements.filter(r => {
    if (filterStatus === 'all') return true;
    return r.status === filterStatus;
  });

  if (loading) {
    return <LoadingSpinner text="Loading your requirements..." />;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Requirements</h1>
          <p className="page-description">
            All requirement listings posted by your account. Monitor offers and track fulfillment status.
          </p>
        </div>
        <Button
          variant="primary"
          icon={PlusCircle}
          onClick={() => navigate('/buyer/requirements/new')}
        >
          Post New Requirement
        </Button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', borderBottom: '1px solid #E2E5E9', paddingBottom: '10px' }}>
        {['all', 'active', 'fulfilled', 'closed'].map((st) => (
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
            {st} ({st === 'all' ? requirements.length : requirements.filter(r => r.status === st).length})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={filterStatus === 'all' ? "You haven't posted any requirements yet" : `No ${filterStatus} requirements found`}
          description={filterStatus === 'all' ? "Create a requirement post and local sellers will send you competitive offers." : `Try switching your filter or create a new requirement.`}
          actionText={filterStatus === 'all' ? "Post a Requirement" : undefined}
          actionIcon={PlusCircle}
          onAction={() => navigate('/buyer/requirements/new')}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filtered.map((req) => (
            <div
              key={req.id}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E5E9',
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <Badge variant={req.status}>{req.status}</Badge>
                    <span style={{ fontSize: '12px', color: '#667085', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Tag size={12} /> {req.categoryName}
                    </span>
                    <span style={{ fontSize: '12px', color: '#667085' }}>•</span>
                    <span style={{ fontSize: '12px', color: '#667085' }}>Posted {formatDate(req.createdAt)}</span>
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1F2933', margin: 0 }}>
                    {req.title}
                  </h3>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: '#667085' }}>Max Budget</div>
                  <div style={{ fontSize: '17px', fontWeight: 700, color: '#2457A6' }}>
                    {formatCurrency(req.budget)}
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '13px', color: '#4B5563', margin: 0, lineHeight: 1.45 }}>
                {req.description}
              </p>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                borderTop: '1px solid #F1F3F5',
                paddingTop: '12px'
              }}>
                <div style={{ display: 'flex', gap: '16px', fontSize: '12.5px', color: '#667085' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={14} /> {req.location}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={14} /> {req.urgency}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, color: req.offerCount > 0 ? '#287D3C' : '#667085' }}>
                    <Inbox size={14} /> {req.offerCount || 0} Offers Received
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {req.status === 'active' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setClosingReq(req)}
                      title="Mark as closed if no longer needed"
                    >
                      Close Post
                    </Button>
                  )}
                  <Link to={`/buyer/offers/${req.id}`}>
                    <Button
                      variant={req.offerCount > 0 ? 'primary' : 'outline'}
                      size="sm"
                      icon={Inbox}
                    >
                      {req.status === 'fulfilled' ? 'View Accepted Deal' : `Compare Offers (${req.offerCount || 0})`}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Dialog for Closing Requirement */}
      <ConfirmDialog
        isOpen={!!closingReq}
        onClose={() => setClosingReq(null)}
        onConfirm={handleCloseRequirement}
        title="Close Requirement"
        message={`Are you sure you want to close "${closingReq?.title}"? Sellers will no longer be able to submit pitches.`}
        confirmText="Yes, Close Requirement"
        variant="danger"
        loading={actionLoading}
      />
    </div>
  );
};
