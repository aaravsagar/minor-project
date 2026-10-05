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
import { Search, UserCheck, ShieldAlert, Shield, Edit, ArrowRightLeft } from 'lucide-react';

export const AdminUsersPage = () => {
  const { currentUser } = useAuth();
  const toast = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Change Role Modal
  const [editingUser, setEditingUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [updatingRole, setUpdatingRole] = useState(false);

  // Toggle Status Dialog
  const [suspendingUser, setSuspendingUser] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

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

  const handleOpenRoleModal = (user) => {
    setEditingUser(user);
    setNewRole(user.role || 'buyer');
  };

  const handleSaveRole = async (e) => {
    e.preventDefault();
    if (!editingUser || !newRole) return;

    try {
      setUpdatingRole(true);
      await userService.adminChangeRole(editingUser.uid, newRole);
      toast.success(`Updated ${editingUser.name}'s role to ${newRole.toUpperCase()}.`);
      setUsers(prev => prev.map(u => u.uid === editingUser.uid ? { ...u, role: newRole } : u));
      setEditingUser(null);
    } catch (err) {
      toast.error('Failed to update role: ' + err.message);
    } finally {
      setUpdatingRole(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!suspendingUser) return;
    try {
      setStatusLoading(true);
      const newStatus = await userService.adminToggleStatus(suspendingUser.uid, suspendingUser.status || 'active');
      toast.success(`User status changed to ${newStatus.toUpperCase()}`);
      setUsers(prev => prev.map(u => u.uid === suspendingUser.uid ? { ...u, status: newStatus } : u));
      setSuspendingUser(null);
    } catch (err) {
      toast.error('Failed to change user status.');
    } finally {
      setStatusLoading(false);
    }
  };

  const filtered = users.filter(u => {
    const matchesSearch = 
      (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.location || '').toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  if (loading) {
    return <LoadingSpinner text="Loading user profiles from Firestore..." />;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">User Accounts Directory</h1>
          <p className="page-description">
            Manage buyer, seller, and administrator accounts registered in the Firestore database.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          <Input
            placeholder="Search by name, email, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            prefix={<Search size={15} />}
          />

          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Roles' },
              { value: 'buyer', label: 'Buyers Only' },
              { value: 'seller', label: 'Sellers Only' },
              { value: 'admin', label: 'Admins Only' }
            ]}
            placeholder=""
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Location</th>
                <th>Phone</th>
                <th>Joined Date</th>
                <th>Account Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const isSuspended = u.status === 'suspended';

                return (
                  <tr key={u.uid}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {u.photoURL ? (
                          <img src={u.photoURL} alt={u.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#EBF2FC', color: '#2457A6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '12px' }}>
                            {(u.name || 'U')[0]}
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 600, color: '#1F2933' }}>{u.name || 'Anonymous User'}</div>
                          <div style={{ fontSize: '12px', color: '#667085' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <Badge variant={u.role || 'info'}>{u.role || 'Unset'}</Badge>
                    </td>
                    <td>{u.location || 'Ahmedabad'}</td>
                    <td>{u.phone || '—'}</td>
                    <td>{formatDate(u.createdAt)}</td>
                    <td>
                      <Badge variant={isSuspended ? 'danger' : 'active'}>
                        {isSuspended ? 'Suspended' : 'Active'}
                      </Badge>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={Edit}
                          onClick={() => handleOpenRoleModal(u)}
                          title="Change Role"
                        >
                          Role
                        </Button>
                        <Button
                          variant={isSuspended ? 'success' : 'danger'}
                          size="sm"
                          onClick={() => setSuspendingUser(u)}
                          title={isSuspended ? 'Reactivate Account' : 'Suspend Account'}
                        >
                          {isSuspended ? 'Activate' : 'Suspend'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Change Role Modal */}
      {editingUser && (
        <Modal
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          title={`Modify Role: ${editingUser.name}`}
          maxWidth="420px"
        >
          <form onSubmit={handleSaveRole}>
            <div style={{ fontSize: '13px', color: '#667085', marginBottom: '16px' }}>
              Assign an operational role for user account: <strong>{editingUser.email}</strong>
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
              <Button variant="secondary" onClick={() => setEditingUser(null)} disabled={updatingRole}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={updatingRole}>
                Update Role
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Suspend / Reactivate Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!suspendingUser}
        onClose={() => setSuspendingUser(null)}
        onConfirm={handleToggleStatus}
        title={suspendingUser?.status === 'suspended' ? 'Reactivate Account' : 'Suspend Account'}
        message={`Are you sure you want to ${suspendingUser?.status === 'suspended' ? 'reactivate' : 'suspend'} the account of "${suspendingUser?.name}" (${suspendingUser?.email})?`}
        confirmText={suspendingUser?.status === 'suspended' ? 'Yes, Reactivate' : 'Yes, Suspend Account'}
        variant={suspendingUser?.status === 'suspended' ? 'primary' : 'danger'}
        loading={statusLoading}
      />
    </div>
  );
};
