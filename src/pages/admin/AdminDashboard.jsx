import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { statsService } from '../../services/statsService';
import { requirementService } from '../../services/requirementService';
import { reportService } from '../../services/reportService';
import { seedDemoData } from '../../firebase/seedDemoData';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { 
  Users, 
  Layers, 
  Send, 
  Handshake, 
  Flag, 
  Database, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

export const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [stats, setStats] = useState(null);
  const [latestReqs, setLatestReqs] = useState([]);
  const [openReports, setOpenReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [platformStats, reqs, reports] = await Promise.all([
        statsService.getAdminPlatformStats(),
        requirementService.getAllRequirementsForAdmin(),
        reportService.getAllReports()
      ]);
      setStats(platformStats);
      setLatestReqs(reqs.slice(0, 5));
      setOpenReports(reports.filter(r => r.status === 'open'));
    } catch (err) {
      console.error('Error loading admin dashboard:', err);
      toast.error('Failed to load admin metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleSeedData = async () => {
    try {
      setSeeding(true);
      const res = await seedDemoData(true);
      if (res.success) {
        toast.success(res.message);
        await loadAdminData();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error('Error seeding data: ' + err.message);
    } finally {
      setSeeding(false);
    }
  };

  if (loading || !stats) {
    return <LoadingSpinner text="Computing Firestore administrative metrics..." />;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Platform Administration Overview</h1>
          <p className="page-description">
            Live overview of platform users, demand postings, seller proposals, and active contracts.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            variant="secondary"
            icon={RefreshCw}
            size="sm"
            onClick={loadAdminData}
          >
            Refresh Counts
          </Button>
          <Button
            variant="primary"
            icon={Database}
            size="sm"
            onClick={handleSeedData}
            loading={seeding}
          >
            Seed / Reset Demo Data
          </Button>
        </div>
      </div>

      {/* Primary Statistics Grid */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div>
            <div className="stat-label">Total Registered Users</div>
            <div className="stat-value">{stats.totalUsers}</div>
            <div style={{ fontSize: '11.5px', color: '#667085', marginTop: '4px' }}>
              {stats.totalBuyers} Buyers • {stats.totalSellers} Sellers
            </div>
          </div>
          <div className="stat-icon-wrapper">
            <Users size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Active Requirements</div>
            <div className="stat-value">{stats.activeRequirements}</div>
            <div style={{ fontSize: '11.5px', color: '#667085', marginTop: '4px' }}>
              {stats.fulfilledRequirements} Fulfilled / Concluded
            </div>
          </div>
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#EBF6EE', color: '#287D3C' }}>
            <Layers size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Total Pitches / Offers</div>
            <div className="stat-value">{stats.totalPitches}</div>
            <div style={{ fontSize: '11.5px', color: '#667085', marginTop: '4px' }}>
              {stats.acceptedPitches} Accepted Pitches
            </div>
          </div>
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#FEF6EC', color: '#A15C00' }}>
            <Send size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Concluded Deals</div>
            <div className="stat-value">{stats.totalDeals}</div>
            <div style={{ fontSize: '11.5px', color: '#667085', marginTop: '4px' }}>
              {stats.openReports} Pending Flags / Reports
            </div>
          </div>
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#F4EBFF', color: '#6927DA' }}>
            <Handshake size={22} />
          </div>
        </div>
      </div>

      {/* Open Reports Alert if any */}
      {openReports.length > 0 && (
        <div
          style={{
            backgroundColor: '#FEF3F2',
            border: '1px solid #FECDCA',
            borderRadius: '8px',
            padding: '14px 18px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={20} color="#B42318" />
            <div>
              <strong style={{ color: '#B42318', fontSize: '13.5px' }}>
                {openReports.length} Open User Report(s) require review
              </strong>
              <div style={{ fontSize: '12.5px', color: '#4B5563' }}>
                Flags submitted by buyers or sellers regarding inappropriate requirements or pitches.
              </div>
            </div>
          </div>
          <Link to="/admin/reports">
            <Button variant="danger" size="sm">
              Review Reports
            </Button>
          </Link>
        </div>
      )}

      {/* Latest Requirements Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Recent Buyer Demands (Platform-Wide)</h2>
            <p className="card-subtitle">All postings recorded across the application</p>
          </div>
          <Link to="/admin/requirements">
            <Button variant="ghost" size="sm">
              View All Requirements
            </Button>
          </Link>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Requirement</th>
                <th>Buyer</th>
                <th>Category</th>
                <th>Budget</th>
                <th>Location</th>
                <th>Status</th>
                <th>Offers</th>
                <th>Posted Date</th>
              </tr>
            </thead>
            <tbody>
              {latestReqs.map((req) => (
                <tr key={req.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#1F2933' }}>{req.title}</div>
                  </td>
                  <td>{req.buyerName}</td>
                  <td>{req.categoryName}</td>
                  <td style={{ fontWeight: 600, color: '#2457A6' }}>{formatCurrency(req.budget)}</td>
                  <td>{req.location}</td>
                  <td>
                    <Badge variant={req.status}>{req.status}</Badge>
                  </td>
                  <td>{req.offerCount || 0}</td>
                  <td>{formatDate(req.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
