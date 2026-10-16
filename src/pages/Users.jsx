import React, { useState } from 'react';
import {
  Users as UsersIcon,
  PlusCircle,
  Shield,
  Edit2,
  Power,
  Trash2,
  X,
  Lock,
  UserCheck
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/common/ConfirmModal';

export default function Users() {
  const { users, addUser, updateUser, toggleUserStatus } = useData();
  const { addToast } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userToToggle, setUserToToggle] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    email: '',
    role: 'Data Entry Clerk',
    status: 'Active'
  });
  const [formErrors, setFormErrors] = useState({});

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      username: '',
      password: '',
      email: '',
      role: 'Data Entry Clerk',
      status: 'Active'
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      username: user.username,
      password: '',
      email: user.email || '',
      role: user.role,
      status: user.status
    });
    setFormErrors({});
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.username.trim()) errs.username = 'Username is required';
    if (users.some((user) => user.id !== editingUser?.id && user.username.toLowerCase() === formData.username.trim().toLowerCase())) {
      errs.username = 'This username is already in use';
    }
    if ((!editingUser || !editingUser.hasPassword) && !formData.password) {
      errs.password = 'Password is required';
    }
    if (formData.password && formData.password.length < 8) errs.password = 'Use at least 8 characters';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await addUser(formData);
      setIsAddModalOpen(false);
      addToast(`User ${formData.name} added successfully`, 'success');
    } catch (err) {
      addToast('Error adding user: ' + err.message, 'danger');
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await updateUser(editingUser.id, formData);
      setEditingUser(null);
      addToast(`User ${formData.name} updated successfully`, 'success');
    } catch (err) {
      addToast('Error updating user: ' + err.message, 'danger');
    }
  };

  const handleToggleConfirm = async () => {
    if (!userToToggle) return;
    try {
      await toggleUserStatus(userToToggle.id);
      addToast(`Status updated for ${userToToggle.name}`, 'info');
      setUserToToggle(null);
    } catch (err) {
      addToast('Error toggling status: ' + err.message, 'danger');
    }
  };

  return (
    <div className="container-fluid p-0">
      {/* Title */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-slate-900 mb-1">System User Administration</h4>
          <p className="text-secondary small mb-0">
            Manage authorized staff members, role-based access permissions, and account statuses.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-sm btn-primary d-flex align-items-center gap-1 fw-semibold"
          onClick={handleOpenAdd}
        >
          <PlusCircle size={15} />
          <span>Add New User</span>
        </button>
      </div>

      {/* Users Table Card */}
      <div className="card-modern bg-white overflow-hidden mb-4">
        <div className="p-3 p-md-4 border-bottom d-flex align-items-center justify-content-between">
          <div>
            <h6 className="fw-bold mb-0 text-slate-800">Authorized Personnel</h6>
            <span className="small text-secondary">Personnel permitted to log and review vehicle financial data</span>
          </div>
          <span className="badge bg-light text-secondary border">
            {users.length} Registered Accounts
          </span>
        </div>

        <div className="table-responsive">
          <table className="table table-modern align-middle mb-0">
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Sign-in</th>
                <th>Email Address</th>
                <th>Assigned Role</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isAdmin = user.username === 'admin' || user.role === 'Administrator';
                return (
                  <tr key={user.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-circle bg-primary-subtle text-primary fw-bold d-flex align-items-center justify-content-center"
                          style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}
                        >
                          {user.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="fw-semibold text-slate-800 small">{user.name}</div>
                      </div>
                    </td>
                    <td className="small font-monospace text-secondary">
                      @{user.username}
                    </td>
                    <td>
                      <span className={`badge ${user.hasPassword ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning-emphasis'}`}>
                        {user.hasPassword ? 'Ready' : 'Password needed'}
                      </span>
                    </td>
                    <td className="small text-muted">
                      {user.email || '-'}
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border">
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          user.status === 'Active'
                            ? 'bg-success-subtle text-success border border-success-subtle'
                            : 'bg-secondary-subtle text-secondary'
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="d-flex align-items-center justify-content-center gap-1">
                        <button
                          type="button"
                          className="btn btn-sm btn-link text-primary p-1"
                          title="Edit User"
                          onClick={() => handleOpenEdit(user)}
                        >
                          <Edit2 size={15} />
                        </button>

                        {!isAdmin && (
                          <button
                            type="button"
                            className={`btn btn-sm btn-link p-1 ${
                              user.status === 'Active' ? 'text-warning' : 'text-success'
                            }`}
                            title={user.status === 'Active' ? 'Deactivate User' : 'Activate User'}
                            onClick={() => setUserToToggle(user)}
                          >
                            <Power size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Definitions Guide */}
      <div className="card-modern p-4 bg-white">
        <h6 className="fw-bold text-slate-900 mb-3">Role Capabilities in BASAH SERVICE LIMITED</h6>
        <div className="row g-3">
          <div className="col-12 col-md-4">
            <div className="p-3 bg-light rounded-3 border h-100">
              <span className="small fw-bold text-primary d-block mb-1">Administrator</span>
              <p className="small text-secondary mb-0">
                Full authority over system settings, user roles, fleet registry, database migration, and irreversible records deletion.
              </p>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="p-3 bg-light rounded-3 border h-100">
              <span className="small fw-bold text-slate-800 d-block mb-1">Fleet Operations Manager</span>
              <p className="small text-secondary mb-0">
                Manages vehicle offloading dispatches, driver assignments, route logs, and approves fuel expenditures.
              </p>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="p-3 bg-light rounded-3 border h-100">
              <span className="small fw-bold text-slate-800 d-block mb-1">Finance / Data Clerk</span>
              <p className="small text-secondary mb-0">
                Enters daily offloading quantities, offload contract rates, weighbridge vouchers, and exports monthly performance ledgers.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {(isAddModalOpen || editingUser) && (
        <div className="modal-backdrop-custom" role="dialog" aria-modal="true">
          <div className="card-modern shadow-xl bg-white w-100 my-auto" style={{ maxWidth: '480px' }}>
            <div className="d-flex align-items-center justify-content-between p-3 p-md-4 border-bottom bg-light">
              <div className="d-flex align-items-center gap-2">
                <div className="p-2 bg-primary-subtle text-primary rounded-2">
                  <UsersIcon size={20} />
                </div>
                <div>
                    <h5 className="fw-bold mb-0 text-slate-900">
                    {editingUser ? 'Edit user' : 'Add user'}
                  </h5>
                  <span className="small text-secondary">Set up account details and access</span>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary p-1"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingUser(null);
                }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={editingUser ? handleSubmitEdit : handleSubmitAdd} className="p-3 p-md-4">
              <div className="mb-3">
                <label className="form-label small fw-semibold">Full Name *</label>
                <input
                  type="text"
                  className={`form-control form-control-sm ${formErrors.name ? 'is-invalid' : ''}`}
                  placeholder="e.g. John Mwangi"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                {formErrors.name && <div className="invalid-feedback">{formErrors.name}</div>}
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Username *</label>
                  <input
                    type="text"
                    className={`form-control form-control-sm ${formErrors.username ? 'is-invalid' : ''}`}
                    placeholder="e.g. jmwangi"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                  {formErrors.username && <div className="invalid-feedback">{formErrors.username}</div>}
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Role *</label>
                  <select
                    className="form-select form-select-sm"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="Administrator">Administrator</option>
                    <option value="Fleet Operations Manager">Fleet Operations Manager</option>
                    <option value="Finance Officer">Finance Officer</option>
                    <option value="Data Entry Clerk">Data Entry Clerk</option>
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">
                  {editingUser?.hasPassword ? 'New password (optional)' : 'Password *'}
                </label>
                <input
                  type="password"
                  className={`form-control form-control-sm ${formErrors.password ? 'is-invalid' : ''}`}
                  placeholder={editingUser?.hasPassword ? 'Leave blank to keep current password' : 'At least 8 characters'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  autoComplete="new-password"
                  minLength={8}
                  required={!editingUser || !editingUser.hasPassword}
                />
                {formErrors.password && <div className="invalid-feedback">{formErrors.password}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Email Address</label>
                <input
                  type="email"
                  className="form-control form-control-sm"
                  placeholder="e.g. j.mwangi@basahservice.co.ke"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Account Status</label>
                <select
                  className="form-select form-select-sm"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="d-flex justify-content-end gap-2 pt-3 border-top">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary px-3"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingUser(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-sm btn-primary px-4 fw-semibold">
                  {editingUser ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Toggle Status */}
      <ConfirmModal
        isOpen={!!userToToggle}
        title="Toggle Account Access"
        message={`Are you sure you want to change account status for ${userToToggle?.name} to ${
          userToToggle?.status === 'Active' ? 'Inactive' : 'Active'
        }?`}
        confirmText={userToToggle?.status === 'Active' ? 'Deactivate' : 'Activate'}
        confirmVariant={userToToggle?.status === 'Active' ? 'warning' : 'primary'}
        onConfirm={handleToggleConfirm}
        onCancel={() => setUserToToggle(null)}
      />
    </div>
  );
}
