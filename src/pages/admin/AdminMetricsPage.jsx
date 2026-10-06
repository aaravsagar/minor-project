import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { statsService } from '../../services/statsService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { 
  Users, 
  Layers, 
  Send, 
  Handshake, 
  TrendingUp, 
  DollarSign, 
  ShieldCheck, 
  AlertTriangle, 
  RefreshCw, 
  PieChart, 
  Activity, 
  Tag, 
  CheckCircle2, 
  ArrowUpRight,
  Printer,
  Calendar,
  UserCheck,
  UserX,
  Clock
} from 'lucide-react';

export const AdminMetricsPage = () => {
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('all'); // 'all', 'month', 'week'

  const loadMetrics = async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true);
      else setLoading(true);

      const data = await statsService.getAdminPlatformStats();
      setStats(data);
      if (showToast) {
        toast.success('Live administrative metrics refreshed.');
      }
    } catch (err) {
      console.error('Error fetching admin metrics:', err);
      toast.error('Failed to calculate platform metrics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading || !stats) {
    return <LoadingSpinner text="Aggregating platform metrics & transaction analytics..." />;
  }

  // Derived Calculations
  const buyerSellerRatio = stats.totalSellers > 0 
    ? (stats.totalBuyers / stats.totalSellers).toFixed(1) 
    : stats.totalBuyers;

  const fulfillmentRate = stats.totalRequirements > 0
    ? Math.round((stats.fulfilledRequirements / stats.totalRequirements) * 100)
    : 0;

  return (
    <div className="admin-metrics-container">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h1 className="page-title">Platform Intelligence & Metrics</h1>
            <Badge variant="success" size="sm">Live Firestore Sync</Badge>
          </div>
          <p className="page-description">
            Executive transaction flow, buyer demand fulfillment, seller conversion funnel, and moderation statistics.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {/* Time range switcher */}
          <div style={{ display: 'inline-flex', backgroundColor: '#FFFFFF', border: '1px solid #E2E5E9', borderRadius: '6px', padding: '2px' }}>
            <button
              onClick={() => setTimeRange('all')}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12.5px',
                fontWeight: timeRange === 'all' ? 600 : 500,
                backgroundColor: timeRange === 'all' ? '#EBF2FC' : 'transparent',
                color: timeRange === 'all' ? '#2457A6' : '#667085',
                cursor: 'pointer'
              }}
            >
              All Time
            </button>
            <button
              onClick={() => setTimeRange('month')}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12.5px',
                fontWeight: timeRange === 'month' ? 600 : 500,
                backgroundColor: timeRange === 'month' ? '#EBF2FC' : 'transparent',
                color: timeRange === 'month' ? '#2457A6' : '#667085',
                cursor: 'pointer'
              }}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setTimeRange('week')}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12.5px',
                fontWeight: timeRange === 'week' ? 600 : 500,
                backgroundColor: timeRange === 'week' ? '#EBF2FC' : 'transparent',
                color: timeRange === 'week' ? '#2457A6' : '#667085',
                cursor: 'pointer'
              }}
            >
              Last 7 Days
            </button>
          </div>

          <Button
            variant="secondary"
            icon={RefreshCw}
            size="sm"
            onClick={() => loadMetrics(true)}
            loading={refreshing}
          >
            Refresh
          </Button>

          <Button
            variant="ghost"
            icon={Printer}
            size="sm"
            onClick={handlePrint}
            title="Print or Export Summary"
          >
            Export
          </Button>
        </div>
      </div>

      {/* Top Level Key Metric Cards */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        {/* Gross Volume */}
        <div className="stat-card" style={{ borderLeft: '4px solid #2457A6' }}>
          <div>
            <div className="stat-label">Gross Transaction Volume</div>
            <div className="stat-value" style={{ color: '#2457A6' }}>
              {formatCurrency(stats.totalGrossVolume || 0)}
            </div>
            <div style={{ fontSize: '11.5px', color: '#667085', marginTop: '4px' }}>
              Avg Deal Value: <strong>{formatCurrency(stats.avgDealValue || 0)}</strong>
            </div>
          </div>
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#EBF2FC', color: '#2457A6' }}>
            <DollarSign size={22} />
          </div>
        </div>

        {/* User Ecosystem */}
        <div className="stat-card" style={{ borderLeft: '4px solid #0284C7' }}>
          <div>
            <div className="stat-label">Total Platform Users</div>
            <div className="stat-value">{stats.totalUsers}</div>
            <div style={{ fontSize: '11.5px', color: '#667085', marginTop: '4px' }}>
              {stats.totalBuyers} Buyers • {stats.totalSellers} Sellers ({buyerSellerRatio}:1 ratio)
            </div>
          </div>
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#E0F2FE', color: '#0284C7' }}>
            <Users size={22} />
          </div>
        </div>

        {/* Requirements & Demands */}
        <div className="stat-card" style={{ borderLeft: '4px solid #16A34A' }}>
          <div>
            <div className="stat-label">Buyer Demands Posted</div>
            <div className="stat-value">{stats.totalRequirements}</div>
            <div style={{ fontSize: '11.5px', color: '#667085', marginTop: '4px' }}>
              {stats.activeRequirements} Active • {fulfillmentRate}% Fulfilled
            </div>
          </div>
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#EBF6EE', color: '#16A34A' }}>
            <Layers size={22} />
          </div>
        </div>

        {/* Offers & Acceptance Rate */}
        <div className="stat-card" style={{ borderLeft: '4px solid #D97706' }}>
          <div>
            <div className="stat-label">Seller Pitches Submitted</div>
            <div className="stat-value">{stats.totalPitches}</div>
            <div style={{ fontSize: '11.5px', color: '#667085', marginTop: '4px' }}>
              {stats.pitchAcceptanceRate}% Pitch Acceptance Rate
            </div>
          </div>
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#FEF6EC', color: '#D97706' }}>
            <TrendingUp size={22} />
          </div>
        </div>
      </div>

      {/* Row 2: Visual Distribution & Conversion Funnel */}
      <div className="grid-2" style={{ marginBottom: '24px' }}>
        {/* Demand & Pitch Conversion Funnel */}
        <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <div>
              <h2 className="card-title">Marketplace Conversion Funnel</h2>
              <p className="card-subtitle">From demand posting to concluded deal transaction</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, justifyContent: 'center', padding: '10px 0' }}>
            {/* Step 1: Requirements */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600, color: '#1F2933' }}>1. Requirements Posted</span>
                <span style={{ fontWeight: 700, color: '#2457A6' }}>{stats.totalRequirements} (100%)</span>
              </div>
              <div style={{ height: '10px', backgroundColor: '#F1F5F9', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ width: '100%', height: '100%', backgroundColor: '#2457A6', borderRadius: '5px' }} />
              </div>
            </div>

            {/* Step 2: Demands with Offers */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600, color: '#1F2933' }}>2. Demands With Seller Offers</span>
                <span style={{ fontWeight: 700, color: '#0284C7' }}>
                  {stats.reqsWithOffers} ({stats.totalRequirements > 0 ? Math.round((stats.reqsWithOffers / stats.totalRequirements) * 100) : 0}%)
                </span>
              </div>
              <div style={{ height: '10px', backgroundColor: '#F1F5F9', borderRadius: '5px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    width: `${stats.totalRequirements > 0 ? Math.round((stats.reqsWithOffers / stats.totalRequirements) * 100) : 0}%`, 
                    height: '100%', 
                    backgroundColor: '#0284C7', 
                    borderRadius: '5px' 
                  }} 
                />
              </div>
            </div>

            {/* Step 3: Accepted Offers */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600, color: '#1F2933' }}>3. Accepted Seller Pitches</span>
                <span style={{ fontWeight: 700, color: '#16A34A' }}>
                  {stats.acceptedPitches} ({stats.totalPitches > 0 ? stats.pitchAcceptanceRate : 0}%)
                </span>
              </div>
              <div style={{ height: '10px', backgroundColor: '#F1F5F9', borderRadius: '5px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    width: `${stats.totalPitches > 0 ? stats.pitchAcceptanceRate : 0}%`, 
                    height: '100%', 
                    backgroundColor: '#16A34A', 
                    borderRadius: '5px' 
                  }} 
                />
              </div>
            </div>

            {/* Step 4: Established Deals */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600, color: '#1F2933' }}>4. Concluded Contracts / Orders</span>
                <span style={{ fontWeight: 700, color: '#9333EA' }}>{stats.totalDeals}</span>
              </div>
              <div style={{ height: '10px', backgroundColor: '#F1F5F9', borderRadius: '5px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    width: `${stats.totalRequirements > 0 ? Math.min(100, Math.round((stats.totalDeals / stats.totalRequirements) * 100)) : 0}%`, 
                    height: '100%', 
                    backgroundColor: '#9333EA', 
                    borderRadius: '5px' 
                  }} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* User Account Status & Moderation Health */}
        <div className="card" style={{ height: '100%' }}>
          <div className="card-header">
            <div>
              <h2 className="card-title">User Governance & Moderation</h2>
              <p className="card-subtitle">Account status, verification, and safety resolution rate</p>
            </div>
            <Link to="/admin/users">
              <Button variant="ghost" size="sm">Manage Users</Button>
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px' }}>
            <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', padding: '14px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16A34A', fontSize: '12px', fontWeight: 600 }}>
                <UserCheck size={16} /> Active Accounts
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#14532D', marginTop: '4px' }}>
                {stats.activeUsers}
              </div>
              <div style={{ fontSize: '11px', color: '#15803D' }}>
                {stats.verifiedUsers} Verified Badges
              </div>
            </div>

            <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', padding: '14px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#DC2626', fontSize: '12px', fontWeight: 600 }}>
                <UserX size={16} /> Suspended / Revoked
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#7F1D1D', marginTop: '4px' }}>
                {stats.suspendedUsers}
              </div>
              <div style={{ fontSize: '11px', color: '#991B1B' }}>
                Access Blocked
              </div>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E5E9', padding: '14px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '12px', fontWeight: 600 }}>
                <AlertTriangle size={16} /> Total Reports
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', marginTop: '4px' }}>
                {stats.totalReports}
              </div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>
                {stats.openReports} Pending Review
              </div>
            </div>

            <div style={{ backgroundColor: '#FAF5FF', border: '1px solid #E9D5FF', padding: '14px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#9333EA', fontSize: '12px', fontWeight: 600 }}>
                <ShieldCheck size={16} /> Resolution Rate
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#581C87', marginTop: '4px' }}>
                {stats.resolutionRate}%
              </div>
              <div style={{ fontSize: '11px', color: '#7E22CE' }}>
                {stats.resolvedReports} Reports Closed
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Category Demand Distribution & Budget Ranges */}
      <div className="grid-2" style={{ marginBottom: '24px' }}>
        {/* Category Breakdown */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Demands by Category</h2>
              <p className="card-subtitle">Volume of buyer postings across active industry categories</p>
            </div>
            <Link to="/admin/categories">
              <Button variant="ghost" size="sm">Manage Categories</Button>
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {stats.categoryDistribution && stats.categoryDistribution.length > 0 ? (
              stats.categoryDistribution.map((cat, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, color: '#1F2933' }}>{cat.name}</span>
                    <span style={{ color: '#667085', fontSize: '12.5px' }}>
                      <strong>{cat.count}</strong> demands ({cat.percentage}%)
                    </span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${cat.percentage}%`,
                        height: '100%',
                        backgroundColor: idx === 0 ? '#2457A6' : (idx === 1 ? '#0284C7' : (idx === 2 ? '#16A34A' : '#D97706')),
                        borderRadius: '4px'
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: '#667085', fontSize: '13px', textAlign: 'center', padding: '20px' }}>
                No category data recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Budget Distribution */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Buyer Budget Segmentation</h2>
              <p className="card-subtitle">Value breakdown of demand postings</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600, color: '#1F2933' }}>Micro (&lt; ₹10,000)</span>
                <span style={{ fontWeight: 600, color: '#2457A6' }}>{stats.budgetRanges?.under10k || 0} postings</span>
              </div>
              <div style={{ height: '8px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${stats.totalRequirements > 0 ? Math.round(((stats.budgetRanges?.under10k || 0) / stats.totalRequirements) * 100) : 0}%`,
                    height: '100%',
                    backgroundColor: '#0284C7',
                    borderRadius: '4px'
                  }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600, color: '#1F2933' }}>Standard (₹10,000 - ₹50,000)</span>
                <span style={{ fontWeight: 600, color: '#2457A6' }}>{stats.budgetRanges?.from10kTo50k || 0} postings</span>
              </div>
              <div style={{ height: '8px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${stats.totalRequirements > 0 ? Math.round(((stats.budgetRanges?.from10kTo50k || 0) / stats.totalRequirements) * 100) : 0}%`,
                    height: '100%',
                    backgroundColor: '#16A34A',
                    borderRadius: '4px'
                  }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600, color: '#1F2933' }}>Mid-Market (₹50,000 - ₹1,00,000)</span>
                <span style={{ fontWeight: 600, color: '#2457A6' }}>{stats.budgetRanges?.from50kTo100k || 0} postings</span>
              </div>
              <div style={{ height: '8px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${stats.totalRequirements > 0 ? Math.round(((stats.budgetRanges?.from50kTo100k || 0) / stats.totalRequirements) * 100) : 0}%`,
                    height: '100%',
                    backgroundColor: '#D97706',
                    borderRadius: '4px'
                  }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600, color: '#1F2933' }}>High Value (&gt; ₹1,00,000)</span>
                <span style={{ fontWeight: 600, color: '#2457A6' }}>{stats.budgetRanges?.above100k || 0} postings</span>
              </div>
              <div style={{ height: '8px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${stats.totalRequirements > 0 ? Math.round(((stats.budgetRanges?.above100k || 0) / stats.totalRequirements) * 100) : 0}%`,
                    height: '100%',
                    backgroundColor: '#9333EA',
                    borderRadius: '4px'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Live Activity Feed */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Live Platform Audit Stream</h2>
            <p className="card-subtitle">Realtime events registered across users, demands, pitches, and deals</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {stats.activityFeed && stats.activityFeed.length > 0 ? (
            stats.activityFeed.map((ev, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '6px',
                  border: '1px solid #E2E5E9',
                  fontSize: '13px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: ev.type === 'user' ? '#E0F2FE' : (ev.type === 'requirement' ? '#EBF6EE' : (ev.type === 'pitch' ? '#FEF6EC' : '#FAF5FF')),
                      color: ev.type === 'user' ? '#0284C7' : (ev.type === 'requirement' ? '#16A34A' : (ev.type === 'pitch' ? '#D97706' : '#9333EA')),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Activity size={16} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#1F2933' }}>{ev.title}</div>
                    <div style={{ fontSize: '12px', color: '#667085' }}>{ev.subtitle}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Badge variant={ev.badge} size="sm">{ev.badge}</Badge>
                  <span style={{ fontSize: '11.5px', color: '#9AA5B1', whiteSpace: 'nowrap' }}>
                    {formatDate(ev.timestamp, true)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div style={{ color: '#667085', fontSize: '13px', textAlign: 'center', padding: '20px' }}>
              No recent events logged yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
