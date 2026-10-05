import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { pitchService } from '../../services/pitchService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input, Select } from '../../components/common/FormControls';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import { Search, Send, Eye } from 'lucide-react';

export const AdminPitchesPage = () => {
  const toast = useToast();

  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewingPitch, setViewingPitch] = useState(null);

  useEffect(() => {
    const fetchPitches = async () => {
      try {
        setLoading(true);
        const list = await pitchService.getAllPitchesForAdmin();
        setPitches(list);
      } catch (err) {
        console.error('Error fetching admin pitches:', err);
        toast.error('Failed to load pitches from Firestore.');
      } finally {
        setLoading(false);
      }
    };
    fetchPitches();
  }, []);

  const filtered = pitches.filter(p => {
    const matchesSearch = 
      (p.sellerName || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.requirementId || '').toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <LoadingSpinner text="Loading pitches database..." />;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Seller Pitches & Quotes</h1>
          <p className="page-description">
            Complete log of seller offers submitted across all buyer requirements.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          <Input
            placeholder="Search by seller, condition, keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            prefix={<Search size={15} />}
          />

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'pending', label: 'Pending Only' },
              { value: 'accepted', label: 'Accepted Only' },
              { value: 'rejected', label: 'Rejected Only' }
            ]}
            placeholder=""
          />
        </div>
      </div>

      {/* Pitches Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Seller</th>
                <th>Requirement ID</th>
                <th>Offer Price</th>
                <th>Condition</th>
                <th>Delivery Time</th>
                <th>Status</th>
                <th>Submitted Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((pitch) => (
                <tr key={pitch.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#1F2933' }}>{pitch.sellerName}</div>
                    <div style={{ fontSize: '11.5px', color: '#667085' }}>{pitch.sellerEmail || pitch.sellerLocation}</div>
                  </td>
                  <td>
                    <code style={{ fontSize: '11px', backgroundColor: '#F3F4F6', padding: '2px 4px', borderRadius: '3px' }}>
                      {pitch.requirementId}
                    </code>
                  </td>
                  <td style={{ fontWeight: 700, color: '#2457A6' }}>
                    {formatCurrency(pitch.offerPrice)}
                  </td>
                  <td>{pitch.condition}</td>
                  <td>{pitch.deliveryTime}</td>
                  <td>
                    <Badge variant={pitch.status}>{pitch.status}</Badge>
                  </td>
                  <td>{formatDate(pitch.createdAt, true)}</td>
                  <td>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={Eye}
                      onClick={() => setViewingPitch(pitch)}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pitch Detail Modal */}
      {viewingPitch && (
        <Modal
          isOpen={!!viewingPitch}
          onClose={() => setViewingPitch(null)}
          title={`Pitch Details: ${viewingPitch.sellerName}`}
          maxWidth="480px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13.5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Badge variant={viewingPitch.status}>{viewingPitch.status}</Badge>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#2457A6' }}>
                {formatCurrency(viewingPitch.offerPrice)}
              </div>
            </div>

            <div className="grid-2">
              <div>
                <div style={{ fontSize: '11px', color: '#667085' }}>Condition</div>
                <div style={{ fontWeight: 600 }}>{viewingPitch.condition}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#667085' }}>Delivery Timeline</div>
                <div>{viewingPitch.deliveryTime}</div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: '#667085' }}>Pitch Description</div>
              <div style={{ color: '#334155', backgroundColor: '#F8FAFC', padding: '10px 12px', borderRadius: '6px', marginTop: '4px' }}>
                {viewingPitch.description}
              </div>
            </div>

            {viewingPitch.sellerNote && (
              <div>
                <div style={{ fontSize: '11px', color: '#667085' }}>Seller Note</div>
                <div style={{ fontStyle: 'italic', color: '#667085', marginTop: '2px' }}>
                  "{viewingPitch.sellerNote}"
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
              <Button variant="secondary" onClick={() => setViewingPitch(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
