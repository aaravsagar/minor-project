import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { userService } from '../../services/userService';
import { formatDate } from '../../utils/formatters';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input, Select } from '../../components/common/FormControls';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal, ConfirmDialog } from '../../components/common/Modal';
import { 
  Search, 
  UserPlus, 
  UserCheck, 
  UserX, 
  ShieldAlert, 
  Shield, 
  ShieldCheck,
  Edit, 
  Trash2, 
  Copy, 
  Check, 
  Key, 
  Eye, 
  EyeOff, 
  Sparkles, 
  RefreshCw, 
  Ban, 
  CheckCircle2,
  Building,
  Phone,
  MapPin,
  FileText
} from 'lucide-react';

export const AdminUsersPage = () => {
  const { currentUser } = useAuth();
  const toast = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Create User Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'buyer',
    phone: '',
    location: 'Ahmedabad',
    company: '',
    notes: '',
    status: 'active',
    isVerified: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [creating, setCreating] = useState(false);

  // Success Created Credentials Dialog
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [copied, setCopied] = useState(false);

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [updatingUser, setUpdatingUser] = useState(false);

  // Change Role Modal State
  const [roleModalUser, setRoleModalUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [updatingRole, setUpdatingRole] = useState(false);

  // Revoke Access / Suspend Modal State
  const [revokingUser, setRevokingUser] = useState(null);
  const [revokeReason, setRevokeReason] = useState('Policy violation and administrative hold');
  const [customRevokeReason, setCustomRevokeReason] = useState('');
  const [revokingLoading, setRevokingLoading] = useState(false);

  // Delete User Dialog State
  const [deletingUser, setDeletingUser] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const list = await userService.getAllUsers();
      setUsers(list);
    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error('Failed to load users from Firestore.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Helper: Generate Random Strong Password
  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pwd = '';
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCreateForm(prev => ({ ...prev, password: pwd }));
    setShowPassword(true);
  };

  // Quick Buyer Generator for rapid evaluator testing
  const handleQuickBuyerGenerator = async () => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const buyerEmail = `buyer.corp${randomSuffix}@needconnect.demo`;
    const buyerPassword = `Buyer@${randomSuffix}!`;
    const buyerName = `Apex Retail Buyer ${randomSuffix}`;

    try {
      setLoading(true);
      const res = await userService.createUserByAdmin({
        name: buyerName,
        email: buyerEmail,
        password: buyerPassword,
        role: 'buyer',
        phone: '+91 98980 ' + Math.floor(10000 + Math.random() * 90000),
        location: 'Ahmedabad',
        company: `Apex Global Pvt Ltd #${randomSuffix}`,
        notes: 'Instant Admin Test Account',
        status: 'active',
        isVerified: true
      });

      toast.success(`Buyer credentials generated for ${buyerEmail}`);
      setCreatedCredentials({
        name: buyerName,
        email: buyerEmail,
        password: buyerPassword,
        role: 'buyer'
      });
      await fetchUsers();
    } catch (err) {
      toast.error('Failed to generate quick buyer: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Form Submit for New User / Buyer
  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    if (!createForm.name || !createForm.email || !createForm.password) {
      toast.error('Please enter Name, Email, and Password.');
      return;
    }

    try {
      setCreating(true);
      const res = await userService.createUserByAdmin(createForm);
      toast.success(`Account credentials created for ${createForm.email}!`);
      
      setCreatedCredentials({
        name: createForm.name,
        email: createForm.email,
        password: createForm.password,
        role: createForm.role,
        company: createForm.company
      });

      setShowCreateModal(false);
      setCreateForm({
        name: '',
        email: '',
        password: '',
        role: 'buyer',
        phone: '',
        location: 'Ahmedabad',
        company: '',
        notes: '',
        status: 'active',
        isVerified: false
      });

      await fetchUsers();
    } catch (err) {
      toast.error('Failed to create user credentials: ' + err.message);
    } finally {
      setCreating(false);
    }
  };

  // Copy Credentials to Clipboard
  const handleCopyCredentials = () => {
    if (!createdCredentials) return;
    const text = `Need Connect Account Credentials:
Role: ${createdCredentials.role.toUpperCase()}
Name: ${createdCredentials.name}
Email: ${createdCredentials.email}
Password: ${createdCredentials.password}
Portal URL: ${window.location.origin}/login`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Credentials copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  // Suspend / Revoke User Access
  const handleConfirmRevokeAccess = async () => {
    if (!revokingUser) return;
    try {
      setRevokingLoading(true);
      const finalReason = revokeReason === 'Other (Custom)' ? (customRevokeReason || 'Administrative suspension') : revokeReason;
      await userService.adminSuspendUser(revokingUser.uid, finalReason);
      toast.success(`Account access revoked for "${revokingUser.name}".`);
      setUsers(prev => prev.map(u => u.uid === revokingUser.uid ? { ...u, status: 'suspended', accessRevoked: true, suspendedReason: finalReason } : u));
      setRevokingUser(null);
    } catch (err) {
      toast.error('Failed to suspend user: ' + err.message);
    } finally {
      setRevokingLoading(false);
    }
  };

  // Reactivate / Unsuspend User
  const handleUnsuspendUser = async (user) => {
    try {
      await userService.adminUnsuspendUser(user.uid);
      toast.success(`Reactivated account for "${user.name}". Access restored.`);
      setUsers(prev => prev.map(u => u.uid === user.uid ? { ...u, status: 'active', accessRevoked: false, suspendedReason: null } : u));
    } catch (err) {
      toast.error('Failed to reactivate account: ' + err.message);
    }
  };

  // Toggle Verification Badge
  const handleToggleVerification = async (user) => {
    try {
      const newVerified = await userService.adminToggleVerification(user.uid, user.isVerified);
      toast.success(`${user.name} is now ${newVerified ? 'Verified' : 'Unverified'}.`);
      setUsers(prev => prev.map(u => u.uid === user.uid ? { ...u, isVerified: newVerified } : u));
    } catch (err) {
      toast.error('Failed to toggle verification badge.');
    }
  };

  // Open Edit Modal
  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      location: user.location || 'Ahmedabad',
      company: user.company || '',
      notes: user.notes || '',
      trustScore: user.trustScore || 5.0
    });
  };

  // Save Edit Modal
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      setUpdatingUser(true);
      await userService.adminUpdateUserProfile(editingUser.uid, editForm);
      toast.success(`Profile updated for ${editingUser.name}.`);
      setUsers(prev => prev.map(u => u.uid === editingUser.uid ? { ...u, ...editForm } : u));
      setEditingUser(null);
    } catch (err) {
      toast.error('Failed to update profile: ' + err.message);
    } finally {
      setUpdatingUser(false);
    }
  };

  // Change Role
  const handleOpenRoleModal = (user) => {
    setRoleModalUser(user);
    setNewRole(user.role || 'buyer');
  };

  const handleSaveRole = async (e) => {
    e.preventDefault();
    if (!roleModalUser || !newRole) return;
    try {
      setUpdatingRole(true);
      await userService.adminChangeRole(roleModalUser.uid, newRole);
      toast.success(`Updated role for ${roleModalUser.name} to ${newRole.toUpperCase()}.`);
      setUsers(prev => prev.map(u => u.uid === roleModalUser.uid ? { ...u, role: newRole } : u));
      setRoleModalUser(null);
    } catch (err) {
      toast.error('Failed to update role: ' + err.message);
    } finally {
      setUpdatingRole(false);
    }
  };

  // Delete User
  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    try {
      setDeleteLoading(true);
      await userService.adminDeleteUser(deletingUser.uid);
      toast.success(`User "${deletingUser.name}" deleted permanently.`);
      setUsers(prev => prev.filter(u => u.uid !== deletingUser.uid));
      setDeletingUser(null);
    } catch (err) {
      toast.error('Failed to delete user: ' + err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filter and Search
  const filtered = users.filter(u => {
    const matchesSearch = 
      (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.phone || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.company || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.location || '').toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    let matchesStatus = true;
    if (statusFilter === 'active') matchesStatus = u.status !== 'suspended' && !u.accessRevoked;
    else if (statusFilter === 'suspended') matchesStatus = u.status === 'suspended' || u.accessRevoked;
    else if (statusFilter === 'verified') matchesStatus = !!u.isVerified;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Count summaries
  const totalCount = users.length;
  const buyerCount = users.filter(u => u.role === 'buyer').length;
  const sellerCount = users.filter(u => u.role === 'seller').length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const suspendedCount = users.filter(u => u.status === 'suspended' || u.accessRevoked).length;

  if (loading) {
    return <LoadingSpinner text="Synchronizing user accounts & credentials directory..." />;
  }

  return (
    <div>
      {/* Header and Top Action Buttons */}
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <div>
          <h1 className="page-title">User Accounts & Credentials Management</h1>
          <p className="page-description">
            Full administrative control over buyer & seller credentials, role assignment, access revocation, and verification.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Button
            variant="primary"
            icon={UserPlus}
            size="sm"
            onClick={() => {
              handleGeneratePassword();
              setShowCreateModal(true);
            }}
          >
            + Create Buyer / User Credentials
          </Button>

          <Button
            variant="secondary"
            icon={Sparkles}
            size="sm"
            onClick={handleQuickBuyerGenerator}
            title="Instant 1-click test buyer credential creation"
          >
            ⚡ Quick Buyer Generator
          </Button>

          <Button
            variant="ghost"
            icon={RefreshCw}
            size="sm"
            onClick={fetchUsers}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <div style={{ padding: '8px 14px', backgroundColor: '#FFFFFF', border: '1px solid #E2E5E9', borderRadius: '6px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Users size={16} color="#2457A6" />
          <span>Total: <strong>{totalCount}</strong></span>
        </div>
        <div style={{ padding: '8px 14px', backgroundColor: '#FFFFFF', border: '1px solid #E2E5E9', borderRadius: '6px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2457A6' }} />
          <span>Buyers: <strong>{buyerCount}</strong></span>
        </div>
        <div style={{ padding: '8px 14px', backgroundColor: '#FFFFFF', border: '1px solid #E2E5E9', borderRadius: '6px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#D97706' }} />
          <span>Sellers: <strong>{sellerCount}</strong></span>
        </div>
        <div style={{ padding: '8px 14px', backgroundColor: '#FFFFFF', border: '1px solid #E2E5E9', borderRadius: '6px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Shield size={16} color="#7E22CE" />
          <span>Admins: <strong>{adminCount}</strong></span>
        </div>
        {suspendedCount > 0 && (
          <div style={{ padding: '8px 14px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '6px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', color: '#DC2626' }}>
            <Ban size={16} />
            <span>Suspended / Revoked: <strong>{suspendedCount}</strong></span>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          <Input
            placeholder="Search by name, email, phone, company, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            prefix={<Search size={15} />}
          />

          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Roles (Buyers, Sellers, Admins)' },
              { value: 'buyer', label: 'Buyers Only' },
              { value: 'seller', label: 'Sellers Only' },
              { value: 'admin', label: 'Administrators Only' }
            ]}
            placeholder=""
          />

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Statuses (Active & Suspended)' },
              { value: 'active', label: 'Active Access Only' },
              { value: 'suspended', label: 'Suspended / Revoked Only' },
              { value: 'verified', label: 'Verified Accounts Only' }
            ]}
            placeholder=""
          />
        </div>
      </div>

      {/* Users Data Table with Full Admin Controls */}
      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>User / Account</th>
                <th>Role</th>
                <th>Company / Location</th>
                <th>Contact Phone</th>
                <th>Joined</th>
                <th>Access Status</th>
                <th>Admin Controls</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const isSuspended = u.status === 'suspended' || u.accessRevoked;

                return (
                  <tr key={u.uid} style={{ backgroundColor: isSuspended ? '#FFFBFB' : 'transparent' }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {u.photoURL ? (
                          <img 
                            src={u.photoURL} 
                            alt={u.name} 
                            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #E2E5E9' }} 
                          />
                        ) : (
                          <div 
                            style={{ 
                              width: '36px', 
                              height: '36px', 
                              borderRadius: '50%', 
                              backgroundColor: u.role === 'admin' ? '#FAF5FF' : (u.role === 'seller' ? '#FEF6EC' : '#EBF2FC'), 
                              color: u.role === 'admin' ? '#7E22CE' : (u.role === 'seller' ? '#D97706' : '#2457A6'), 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              fontWeight: 700, 
                              fontSize: '13px' 
                            }}
                          >
                            {(u.name || 'U')[0]?.toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ fontWeight: 600, color: '#1F2933' }}>{u.name || 'Anonymous User'}</span>
                            {u.isVerified && (
                              <ShieldCheck size={14} color="#16A34A" title="Verified Account" />
                            )}
                          </div>
                          <div style={{ fontSize: '12px', color: '#667085' }}>{u.email}</div>
                          {u.createdByAdmin && (
                            <span style={{ fontSize: '10.5px', color: '#0284C7', backgroundColor: '#E0F2FE', padding: '1px 5px', borderRadius: '3px', fontWeight: 500 }}>
                              Admin Provisioned
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td>
                      <Badge variant={u.role || 'info'}>
                        {(u.role || 'User').toUpperCase()}
                      </Badge>
                    </td>

                    <td>
                      <div>
                        <div style={{ fontWeight: 500, color: '#1F2933', fontSize: '13px' }}>
                          {u.company || '—'}
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#667085' }}>
                          {u.location || 'Ahmedabad'}
                        </div>
                      </div>
                    </td>

                    <td style={{ fontSize: '12.5px' }}>{u.phone || '—'}</td>

                    <td style={{ fontSize: '12px', color: '#667085' }}>
                      {formatDate(u.createdAt)}
                    </td>

                    <td>
                      {isSuspended ? (
                        <div>
                          <Badge variant="danger">Suspended</Badge>
                          {u.suspendedReason && (
                            <div style={{ fontSize: '11px', color: '#B42318', marginTop: '2px', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={u.suspendedReason}>
                              {u.suspendedReason}
                            </div>
                          )}
                        </div>
                      ) : (
                        <Badge variant="active">Active Access</Badge>
                      )}
                    </td>

                    <td>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {/* Edit User Details */}
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={Edit}
                          onClick={() => handleOpenEditModal(u)}
                          title="Edit User Profile"
                        >
                          Edit
                        </Button>

                        {/* Change Role */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenRoleModal(u)}
                          title="Assign New Role"
                        >
                          Role
                        </Button>

                        {/* Suspend / Revoke vs Reactivate */}
                        {isSuspended ? (
                          <Button
                            variant="success"
                            size="sm"
                            icon={CheckCircle2}
                            onClick={() => handleUnsuspendUser(u)}
                            title="Reactivate Account Access"
                          >
                            Restore
                          </Button>
                        ) : (
                          <Button
                            variant="danger"
                            size="sm"
                            icon={Ban}
                            onClick={() => {
                              setRevokingUser(u);
                              setRevokeReason('Policy violation and administrative hold');
                              setCustomRevokeReason('');
                            }}
                            title="Revoke Access & Suspend Account"
                          >
                            Revoke / Suspend
                          </Button>
                        )}

                        {/* Toggle Verification */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleVerification(u)}
                          title={u.isVerified ? 'Remove Verified Badge' : 'Grant Verified Badge'}
                          style={{ color: u.isVerified ? '#16A34A' : '#667085' }}
                        >
                          {u.isVerified ? 'Verified' : 'Verify'}
                        </Button>

                        {/* Delete User Safeguard */}
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Trash2}
                          onClick={() => setDeletingUser(u)}
                          title="Permanently Delete User"
                          style={{ color: '#B42318' }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Create Buyer / User Credentials */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New User / Buyer Credentials"
          maxWidth="540px"
        >
          <form onSubmit={handleCreateUserSubmit}>
            <p style={{ fontSize: '13px', color: '#667085', marginBottom: '16px' }}>
              Directly provision a buyer, seller, or administrator account. Credentials will be ready for immediate platform login.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '12px' }}>
              <Input
                label="Full Name / Contact Name"
                placeholder="e.g. Ramesh Patel"
                value={createForm.name}
                onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                required
              />

              <Select
                label="Assigned Role"
                value={createForm.role}
                onChange={(e) => setCreateForm(prev => ({ ...prev, role: e.target.value }))}
                options={[
                  { value: 'buyer', label: 'Buyer (Post Demands & Hire Sellers)' },
                  { value: 'seller', label: 'Seller (Browse & Submit Pitches)' },
                  { value: 'admin', label: 'Admin (Full Platform Moderation)' }
                ]}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '12px' }}>
              <Input
                label="Email Address (Login Username)"
                type="email"
                placeholder="e.g. buyer@example.com"
                value={createForm.email}
                onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>

            {/* Password input with generator */}
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label">
                Account Password <span className="required">*</span>
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="Enter or generate password"
                    value={createForm.password}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                    required
                    style={{ paddingRight: '36px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#667085',
                      display: 'flex'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  icon={Key}
                  onClick={handleGeneratePassword}
                >
                  Generate Strong
                </Button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '12px' }}>
              <Input
                label="Company / Business Name (Optional)"
                placeholder="e.g. Acme Corp"
                value={createForm.company}
                onChange={(e) => setCreateForm(prev => ({ ...prev, company: e.target.value }))}
              />

              <Input
                label="Phone Number"
                placeholder="+91 98765 43210"
                value={createForm.phone}
                onChange={(e) => setCreateForm(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '12px' }}>
              <Input
                label="Location / City"
                placeholder="e.g. Ahmedabad, Gujarat"
                value={createForm.location}
                onChange={(e) => setCreateForm(prev => ({ ...prev, location: e.target.value }))}
              />

              <Select
                label="Initial Account Status"
                value={createForm.status}
                onChange={(e) => setCreateForm(prev => ({ ...prev, status: e.target.value }))}
                options={[
                  { value: 'active', label: 'Active Access (Immediate)' },
                  { value: 'suspended', label: 'Suspended (Access Revoked)' }
                ]}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                <input
                  type="checkbox"
                  checked={createForm.isVerified}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, isVerified: e.target.checked }))}
                />
                <span>Grant <strong>Verified Badge</strong> to this account</span>
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #E2E5E9', paddingTop: '16px' }}>
              <Button variant="secondary" onClick={() => setShowCreateModal(false)} disabled={creating}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={creating}>
                Create Account Credentials
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal 2: Credentials Created Success Dialog */}
      {createdCredentials && (
        <Modal
          isOpen={!!createdCredentials}
          onClose={() => setCreatedCredentials(null)}
          title="Account Credentials Created Successfully"
          maxWidth="460px"
        >
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#EBF6EE', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
              <CheckCircle2 size={28} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1F2933', margin: 0 }}>
              Credentials Ready for {createdCredentials.name}
            </h3>
            <p style={{ fontSize: '12.5px', color: '#667085', marginTop: '4px' }}>
              You can copy and send these details to the buyer or client.
            </p>
          </div>

          <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E5E9', borderRadius: '8px', padding: '16px', marginBottom: '20px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#667085' }}>Assigned Role:</span>
              <Badge variant={createdCredentials.role} size="sm">{createdCredentials.role.toUpperCase()}</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#667085' }}>Login Email:</span>
              <strong style={{ color: '#1F2933' }}>{createdCredentials.email}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#667085' }}>Password:</span>
              <code style={{ backgroundColor: '#FFFFFF', padding: '2px 8px', borderRadius: '4px', border: '1px solid #CBD5E1', fontWeight: 600, color: '#2457A6' }}>
                {createdCredentials.password}
              </code>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#667085' }}>Portal URL:</span>
              <span style={{ color: '#2457A6', fontSize: '12px' }}>{window.location.origin}/login</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Button
              variant="primary"
              icon={copied ? Check : Copy}
              onClick={handleCopyCredentials}
              style={{ width: '100%' }}
            >
              {copied ? 'Copied to Clipboard!' : 'Copy All Credentials to Clipboard'}
            </Button>

            <Button
              variant="secondary"
              onClick={() => setCreatedCredentials(null)}
              style={{ width: '100%' }}
            >
              Done & Close
            </Button>
          </div>
        </Modal>
      )}

      {/* Modal 3: Revoke Access & Suspend Account */}
      {revokingUser && (
        <Modal
          isOpen={!!revokingUser}
          onClose={() => setRevokingUser(null)}
          title={`Revoke Access: ${revokingUser.name}`}
          maxWidth="460px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#FEF2F2', padding: '12px', borderRadius: '6px', border: '1px solid #FECACA' }}>
              <ShieldAlert size={24} color="#DC2626" />
              <div style={{ fontSize: '13px', color: '#991B1B' }}>
                Suspending this account will immediately revoke all access to post demands, submit pitches, or log into the portal.
              </div>
            </div>

            <Select
              label="Select Suspension / Revocation Reason"
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              options={[
                { value: 'Policy violation and administrative hold', label: 'Policy Violation / Inappropriate Content' },
                { value: 'Suspicious or fraudulent activity detected', label: 'Fraudulent Activity or Scam Attempt' },
                { value: 'Non-fulfillment or dispute on deals', label: 'Non-fulfillment of Accepted Deals' },
                { value: 'Account inactive or unverified credentials', label: 'Inactivity / Invalid Identity Credentials' },
                { value: 'Requested by user or administrative audit', label: 'Administrative Audit Review' },
                { value: 'Other (Custom)', label: 'Other (Specify Custom Reason Below)' }
              ]}
              required
            />

            {revokeReason === 'Other (Custom)' && (
              <Input
                label="Custom Suspension Reason"
                placeholder="Describe reason for suspension..."
                value={customRevokeReason}
                onChange={(e) => setCustomRevokeReason(e.target.value)}
                required
              />
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', borderTop: '1px solid #E2E5E9', paddingTop: '14px' }}>
              <Button variant="secondary" onClick={() => setRevokingUser(null)} disabled={revokingLoading}>
                Cancel
              </Button>
              <Button variant="danger" icon={Ban} onClick={handleConfirmRevokeAccess} loading={revokingLoading}>
                Confirm Revocation & Suspend
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal 4: Edit Profile Details */}
      {editingUser && (
        <Modal
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          title={`Edit Profile: ${editingUser.name}`}
          maxWidth="480px"
        >
          <form onSubmit={handleSaveEdit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Input
                label="Full Name"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                required
              />

              <Input
                label="Company / Business Name"
                value={editForm.company}
                onChange={(e) => setEditForm(prev => ({ ...prev, company: e.target.value }))}
              />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <Input
                  label="Phone Number"
                  value={editForm.phone}
                  onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                />

                <Input
                  label="Location / City"
                  value={editForm.location}
                  onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>

              <Input
                label="Trust Score (0.0 to 5.0)"
                type="number"
                step="0.1"
                min="1.0"
                max="5.0"
                value={editForm.trustScore}
                onChange={(e) => setEditForm(prev => ({ ...prev, trustScore: parseFloat(e.target.value) || 5.0 }))}
              />

              <div className="form-group">
                <label className="form-label">Internal Administrative Notes</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={editForm.notes}
                  onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Notes visible only to platform administrators..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #E2E5E9', paddingTop: '14px' }}>
                <Button variant="secondary" onClick={() => setEditingUser(null)} disabled={updatingUser}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={updatingUser}>
                  Save Changes
                </Button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal 5: Change Role */}
      {roleModalUser && (
        <Modal
          isOpen={!!roleModalUser}
          onClose={() => setRoleModalUser(null)}
          title={`Modify Role: ${roleModalUser.name}`}
          maxWidth="420px"
        >
          <form onSubmit={handleSaveRole}>
            <div style={{ fontSize: '13px', color: '#667085', marginBottom: '16px' }}>
              Assign an operational role for user account: <strong>{roleModalUser.email}</strong>
            </div>

            <Select
              label="Selected Role"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              options={[
                { value: 'buyer', label: 'Buyer (Post requirements & accept offers)' },
                { value: 'seller', label: 'Seller (Browse requirements & submit pitches)' },
                { value: 'admin', label: 'Admin (Full moderation & platform control)' }
              ]}
              required
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <Button variant="secondary" onClick={() => setRoleModalUser(null)} disabled={updatingRole}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={updatingRole}>
                Update Role
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal 6: Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleDeleteUser}
        title="Delete User Permanently"
        message={`Are you sure you want to permanently delete the profile of "${deletingUser?.name}" (${deletingUser?.email}) from Firestore? This action cannot be undone.`}
        confirmText="Yes, Delete Permanently"
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
};
