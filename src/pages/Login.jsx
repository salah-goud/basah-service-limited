import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Lock, User, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Username is required.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }

    try {
      setLoading(true);
      await login(username.trim(), password);
      addToast('Welcome back to Basah Service Limited fleet portal', 'success');
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please verify demo credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickCredentials = (user, pass) => {
    setUsername(user);
    setPassword(pass);
    setError('');
  };

  return (
    <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-light py-5 px-3">
      <div className="w-100" style={{ maxWidth: '440px' }}>
        {/* Brand Header */}
        <div className="text-center mb-4">
          <div className="d-inline-flex p-3 rounded-3 bg-primary text-white shadow-sm mb-3">
            <Truck size={36} />
          </div>
          <h4 className="fw-bold text-slate-900 mb-1">BASAH SERVICE LIMITED</h4>
          <p className="text-secondary small mb-0">
            Vehicle Income & Expense Management System
          </p>
          <span className="small text-muted" style={{ fontSize: '0.75rem' }}>
            Replacing legacy Excel workbook (KDY REPORTT.xlsx)
          </span>
        </div>

        {/* Login Card */}
        <div className="card-modern p-4 p-md-5 bg-white shadow-sm">
          <h5 className="fw-bold mb-3 text-slate-800">System Sign In</h5>

          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 small mb-3">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">
                Username / Email
              </label>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light text-secondary">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. admin or suldaangod"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label small fw-semibold text-secondary">
                Password
              </label>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light text-secondary">
                  <Lock size={16} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Access Management System</span>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Switcher */}
          <div className="mt-4 pt-3 border-top">
            <span className="small text-secondary fw-semibold d-block mb-2">
              Demo Credentials (Frontend Phase):
            </span>
            <div className="d-flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-xs btn-outline-secondary py-1 px-2 small"
                style={{ fontSize: '0.75rem' }}
                onClick={() => fillQuickCredentials('admin', 'admin123')}
              >
                Administrator (admin)
              </button>
              <button
                type="button"
                className="btn btn-xs btn-outline-secondary py-1 px-2 small"
                style={{ fontSize: '0.75rem' }}
                onClick={() => fillQuickCredentials('manager', 'manager123')}
              >
                Operations (manager)
              </button>
            </div>
          </div>
        </div>

        {/* Phase Disclaimer */}
        <div className="mt-3 p-3 bg-white rounded-3 border text-secondary small d-flex align-items-start gap-2">
          <ShieldCheck size={18} className="text-info shrink-0 mt-0.5" />
          <div style={{ fontSize: '0.75rem' }}>
            <strong>Phase 1 Notice:</strong> This is a frontend demonstration simulating authentication with local state. Production JWT authentication will connect to Node.js &amp; MySQL in Phase 2.
          </div>
        </div>
      </div>
    </div>
  );
}
