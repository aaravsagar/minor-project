import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { reportService } from '../../services/reportService';
import { formatDate } from '../../utils/formatters';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/FormControls';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import { Flag, CheckCircle, AlertTriangle, Eye } from 'lucide-react';

export const AdminReportsPage = () => {
  const toast = useToast();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewingReport, setViewingReport] = useState(null);
  const [updating, setUpdating] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const list = await reportService.getAllReports();
      setReports(list);
    } catch (err) {
      console.error('Error loading reports:', err);
      toast.error('Failed to load reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleUpdateStatus = async (reportId, newStatus) => {
    try {
      setUpdating(true);
      await reportService.updateReportStatus(reportId, newStatus);
      toast.success(`Report marked as ${newStatus.toUpperCase()}`);
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: newStatus } : r));
      if (viewingReport?.id === reportId) {
        setViewingReport(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      toast.error('Failed to update report status.');
    } finally {
      setUpdating(false);
    }
  };

  const filtered = reports.filter(r => {
    if (statusFilter === 'all') return true;
    return r.status === statusFilter;
  });

  if (loading) {
    return <LoadingSpinner text="Loading user reports & flags..." />;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports & Moderation Flags</h1>
          <p className="page-description">
            Review user-submitted reports regarding inappropriate requirements, pitches, or accounts.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', borderBottom: '1px solid #E2E5E9', paddingBottom: '10px' }}>
        {['all', 'open', 'reviewed', 'resolved'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: statusFilter === st ? 600 : 500,
              backgroundColor: statusFilter === st ? '#EBF2FC' : 'transparent',
              color: statusFilter === st ? '#2457A6' : '#667085',
              border: statusFilter === st ? '1px solid #BCD0EE' : '1px solid transparent',
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {st} ({st === 'all' ? reports.length : reports.filter(r => r.status === st).length})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Flag}
          title="No reports found"
          description="There are currently no moderation flags in this category."
        />
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Target Type</th>
                  <th>Target Item / Name</th>
                  <th>Report Reason</th>
                  <th>Reported By</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((rep) => (
                  <tr key={rep.id}>
                    <td>
                      <Badge variant="info">{rep.targetType}</Badge>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#1F2933' }}>
                        {rep.targetTitleOrName || rep.targetId}
                      </div>
                    </td>
                    <td style={{ color: '#B42318', fontWeight: 500 }}>{rep.reason}</td>
                    <td>{rep.reporterName}</td>
                    <td>{formatDate(rep.createdAt, true)}</td>
                    <td>
                      <Badge variant={rep.status}>{rep.status}</Badge>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={Eye}
                          onClick={() => setViewingReport(rep)}
                        >
                          Review
                        </Button>
                        {rep.status !== 'resolved' && (
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleUpdateStatus(rep.id, 'resolved')}
                          >
                            Resolve
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
      )}

      {/* View Report Modal */}
      {viewingReport && (
        <Modal
          isOpen={!!viewingReport}
          onClose={() => setViewingReport(null)}
          title={`Report Details: ${viewingReport.reason}`}
          maxWidth="480px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13.5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Badge variant={viewingReport.status}>{viewingReport.status}</Badge>
              <span style={{ fontSize: '12px', color: '#667085' }}>
                {formatDate(viewingReport.createdAt, true)}
              </span>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: '#667085' }}>Reported Target ({viewingReport.targetType})</div>
              <div style={{ fontWeight: 600, fontSize: '14.5px', color: '#1F2933', marginTop: '2px' }}>
                {viewingReport.targetTitleOrName}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: '#667085' }}>Reason Category</div>
              <div style={{ color: '#B42318', fontWeight: 600, marginTop: '2px' }}>
                {viewingReport.reason}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: '#667085' }}>User Explanation</div>
              <div style={{ backgroundColor: '#F8FAFC', padding: '10px 12px', borderRadius: '6px', marginTop: '4px', color: '#334155' }}>
                {viewingReport.description || 'No detailed explanation provided.'}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', borderTop: '1px solid #E2E5E9', paddingTop: '14px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleUpdateStatus(viewingReport.id, 'reviewed')}
                  disabled={updating || viewingReport.status === 'reviewed'}
                >
                  Mark Reviewed
                </Button>
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => handleUpdateStatus(viewingReport.id, 'resolved')}
                  disabled={updating || viewingReport.status === 'resolved'}
                >
                  Mark Resolved
                </Button>
              </div>

              <Button variant="secondary" onClick={() => setViewingReport(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
