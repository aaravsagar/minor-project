import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { requirementService } from '../../services/requirementService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input, Select } from '../../components/common/FormControls';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal, ConfirmDialog } from '../../components/common/Modal';
import { Search, Layers, XCircle, CheckCircle, Eye } from 'lucide-react';

export const AdminRequirementsPage = () => {
  const toast = useToast();

  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // View modal
  const [viewingReq, setViewingReq] = useState(null);

  // Close / Status change dialog
  const [targetReq, setTargetReq] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReqs = async () => {
    try {
      setLoading(true);
      const list = await requirementService.getAllRequirementsForAdmin();
      setRequirements(list);
    } catch (err) {
      console.error('Error loading requirements for admin:', err);
      toast.error('Failed to load requirements from Firestore.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReqs();
  }, []);

  const handleUpdateStatus = async () => {
    if (!targetReq || !newStatus) return;
    try {
      setActionLoading(true);
      await requirementService.updateRequirementStatus(targetReq.id, newStatus);
      toast.success(`Requirement status updated to ${newStatus.toUpperCase()}`);
      setRequirements(prev => prev.map(r => r.id === targetReq.id ? { ...r, status: newStatus } : r));
      setTargetReq(null);
    } catch (err) {
      toast.error('Failed to update requirement status.');
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = requirements.filter(r => {
    const matchesSearch = 
      (r.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.buyerName || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.categoryName || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.location || '').toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <LoadingSpinner text="Loading requirements directory..." />;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Buyer Requirements Moderation</h1>
          <p className="page-description">
            Review all postings across the marketplace and manage operational statuses.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          <Input
            placeholder="Search requirement, buyer, category, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            prefix={<Search size={15} />}
          />

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'active', label: 'Active Only' },
              { value: 'fulfilled', label: 'Fulfilled Only' },
              { value: 'closed', label: 'Closed Only' }
            ]}
            placeholder=""
          />
        </div>
      </div>

      {/* Requirements Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Requirement Title</th>
                <th>Buyer</th>
                <th>Category</th>
                <th>Budget Limit</th>
                <th>Location</th>
                <th>Urgency</th>
                <th>Status</th>
                <th>Offers</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((req) => (
                <tr key={req.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#1F2933' }}>{req.title}</div>
                  </td>
                  <td>{req.buyerName}</td>
                  <td>{req.categoryName}</td>
                  <td style={{ fontWeight: 600, color: '#2457A6' }}>{formatCurrency(req.budget)}</td>
                  <td>{req.location}</td>
                  <td>{req.urgency}</td>
                  <td>
                    <Badge variant={req.status}>{req.status}</Badge>
                  </td>
                  <td>{req.offerCount || 0}</td>
                  <td>{formatDate(req.createdAt)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Eye}
                        onClick={() => setViewingReq(req)}
                      >
                        View
                      </Button>
                      {req.status === 'active' ? (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            setTargetReq(req);
                            setNewStatus('closed');
                          }}
                        >
                          Close
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setTargetReq(req);
                            setNewStatus('active');
                          }}
                        >
                          Reopen
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Requirement Modal */}
      {viewingReq && (
        <Modal
          isOpen={!!viewingReq}
          onClose={() => setViewingReq(null)}
          title={`Requirement Details: ${viewingReq.title}`}
          maxWidth="520px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13.5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Badge variant={viewingReq.status}>{viewingReq.status}</Badge>
              <span style={{ fontSize: '12px', color: '#667085' }}>
                Posted {formatDate(viewingReq.createdAt, true)}
              </span>
            </div>

            <div className="grid-2">
              <div>
                <div style={{ fontSize: '11px', color: '#667085' }}>Buyer Name</div>
                <div style={{ fontWeight: 600 }}>{viewingReq.buyerName}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#667085' }}>Budget Target</div>
                <div style={{ fontWeight: 700, color: '#2457A6' }}>{formatCurrency(viewingReq.budget)}</div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: '#667085' }}>Description</div>
              <div style={{ color: '#334155', backgroundColor: '#F8FAFC', padding: '10px 12px', borderRadius: '6px', marginTop: '4px' }}>
                {viewingReq.description}
              </div>
            </div>

            <div className="grid-2">
              <div>
                <div style={{ fontSize: '11px', color: '#667085' }}>Location</div>
                <div>{viewingReq.location}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#667085' }}>Urgency</div>
                <div>{viewingReq.urgency}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
              <Button variant="secondary" onClick={() => setViewingReq(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!targetReq}
        onClose={() => setTargetReq(null)}
        onConfirm={handleUpdateStatus}
        title={`Change Status to ${newStatus.toUpperCase()}`}
        message={`Are you sure you want to change the status of "${targetReq?.title}" to ${newStatus}?`}
        confirmText="Confirm Status Change"
        variant={newStatus === 'closed' ? 'danger' : 'primary'}
        loading={actionLoading}
      />
    </div>
  );
};
