import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api/otherApis';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../hooks/useToast';
import { Tabs } from '../../components/ui/Tabs';
import { Search, UserCheck, UserX, Edit2, ShieldAlert } from 'lucide-react';
import { PageHeader } from '../../components/dashboard';

export const UserManagementPage: React.FC = () => {
  const toast = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'STUDENT' | 'FACULTY' | 'ALL'>('STUDENT');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Edit Faculty Modal
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editDesignation, setEditDesignation] = useState('');
  const [editDepartment, setEditDepartment] = useState('');

  // Confirmation Modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [targetUserToToggle, setTargetUserToToggle] = useState<any>(null);

  const loadUsers = () => {
    setIsLoading(true);
    adminApi
      .listUsers({
        role: activeTab === 'ALL' ? undefined : activeTab,
        search: search || undefined,
      })
      .then((data) => setUsers(data.users || []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, [activeTab]);

  const handleToggleStatus = async () => {
    if (!targetUserToToggle) return;
    try {
      await adminApi.toggleUserStatus(targetUserToToggle._id);
      toast.success(`User ${targetUserToToggle.isActive ? 'deactivated' : 'activated'} successfully.`);
      setIsConfirmModalOpen(false);
      setTargetUserToToggle(null);
      loadUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to update user status.');
    }
  };

  const handleOpenEditFaculty = (item: any) => {
    setSelectedUser(item);
    setEditDesignation(item.profile?.designation || 'Associate Professor');
    setEditDepartment(item.profile?.department || 'Computer Science & Engineering');
    setIsEditModalOpen(true);
  };

  const handleSaveFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.updateFaculty(selectedUser.user._id, {
        designation: editDesignation,
        department: editDepartment,
      });
      toast.success('Faculty academic record updated.');
      setIsEditModalOpen(false);
      loadUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to update faculty record.');
    }
  };

  return (
    <div>
      <PageHeader
        title="User Directory & Academic Governance"
        subtitle="Review enrolled students, manage faculty designations, and enforce institutional account access statuses"
        breadcrumbs={[
          { label: 'Admin', path: '/admin/dashboard' },
          { label: 'User Governance' },
        ]}
      />

      <Tabs
        tabs={[
          { id: 'STUDENT', label: 'Students Roster' },
          { id: 'FACULTY', label: 'Faculty Roster' },
          { id: 'ALL', label: 'All Registered Accounts' },
        ]}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as any)}
      />

      {/* Filter and Search Bar */}
      <div className="acr-card" style={{ padding: '0.85rem 1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="text"
              className="acr-input"
              placeholder="Search by student name, faculty name, or institutional email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadUsers()}
              style={{ paddingLeft: '2.25rem' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>
          <Button variant="primary" onClick={loadUsers}>
            Search
          </Button>
        </div>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading user records...
        </div>
      ) : (
        <div className="acr-table-container">
          <table className="acr-table">
            <thead>
              <tr>
                <th>User / Scholar</th>
                <th>Academic Role</th>
                <th>ID / Designation</th>
                <th>Department</th>
                <th>Account Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((item) => {
                const u = item.user;
                const p = item.profile;
                return (
                  <tr key={u._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.fullName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                    </td>
                    <td>
                      <span className="acr-badge acr-badge-info">{u.role}</span>
                    </td>
                    <td>
                      {u.role === 'STUDENT' ? (
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>{p?.studentId || 'N/A'}</span>
                      ) : (
                        <span>{p?.designation || 'Faculty Member'}</span>
                      )}
                    </td>
                    <td>{p?.department || 'University Wide'}</td>
                    <td>
                      <Badge variant={u.isActive ? 'success' : 'danger'}>
                        {u.isActive ? 'Active' : 'Disabled'}
                      </Badge>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        {u.role === 'FACULTY' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditFaculty(item)}
                            title="Edit designation & department"
                            icon={<Edit2 size={14} />}
                          >
                            Edit
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          style={{ color: u.isActive ? '#dc2626' : '#059669' }}
                          onClick={() => {
                            setTargetUserToToggle(u);
                            setIsConfirmModalOpen(true);
                          }}
                          icon={u.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Faculty Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Update Faculty Academic Record">
        <form onSubmit={handleSaveFaculty}>
          <div style={{ marginBottom: '1rem' }}>
            <label className="acr-label">Academic Designation</label>
            <select
              className="acr-select"
              value={editDesignation}
              onChange={(e) => setEditDesignation(e.target.value)}
            >
              <option>Assistant Professor</option>
              <option>Associate Professor</option>
              <option>Professor</option>
              <option>Distinguished Professor</option>
              <option>Dean of Research</option>
            </select>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="acr-label">Department</label>
            <select
              className="acr-select"
              value={editDepartment}
              onChange={(e) => setEditDepartment(e.target.value)}
            >
              <option>Computer Science & Engineering</option>
              <option>Data Science & Artificial Intelligence</option>
              <option>Electronics & Communication Engineering</option>
              <option>Cybersecurity & Information Security</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Destructive Action Confirmation Modal */}
      <Modal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} title="Confirm Account Status Change">
        <div style={{ padding: '0.5rem 0' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            Are you sure you want to {targetUserToToggle?.isActive ? 'deactivate' : 'activate'} the account for{' '}
            <strong>{targetUserToToggle?.fullName}</strong> ({targetUserToToggle?.email})?
            {targetUserToToggle?.isActive && (
              <span style={{ display: 'block', marginTop: '0.5rem', color: '#dc2626' }}>
                Deactivated users are immediately prevented from signing in or modifying active projects.
              </span>
            )}
          </p>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <Button variant="secondary" onClick={() => setIsConfirmModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={targetUserToToggle?.isActive ? 'danger' : 'primary'}
              onClick={handleToggleStatus}
            >
              Confirm {targetUserToToggle?.isActive ? 'Deactivation' : 'Activation'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
