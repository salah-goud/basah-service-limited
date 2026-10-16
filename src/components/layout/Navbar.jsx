import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, LogOut, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';

export default function Navbar({ onToggleSidebar }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { refreshData } = useData();
  const { addToast } = useToast();

  const getPageTitle = (path) => {
    switch (path) {
      case '/':
      case '/dashboard':
        return 'Dashboard';
      case '/reports':
        return 'Reports & ledgers';
      case '/daily-reports':
        return 'Daily reports';
      case '/monthly-reports':
        return 'Monthly reports';
      case '/vehicles':
        return 'Vehicles';
      case '/import-export':
        return 'Import & export';
      case '/users':
        return 'Team';
      case '/settings':
        return 'Settings';
      default:
        return 'Overview';
    }
  };

  const handleRefresh = async () => {
    await refreshData();
    addToast('Fleet data synchronized successfully', 'info');
  };

  return (
    <header className="app-navbar d-flex align-items-center justify-content-between px-3 px-lg-4 sticky-top bg-white no-print">
      {/* Page title and mobile navigation */}
      <div className="d-flex align-items-center gap-3">
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary d-lg-none p-1 border-0"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation"
        >
          <Menu size={22} />
        </button>

        <h1 className="h6 fw-semibold mb-0">{getPageTitle(location.pathname)}</h1>
      </div>

      {/* Refresh and user account */}
      <div className="d-flex align-items-center gap-2 gap-md-3">
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 py-1 px-2"
          onClick={handleRefresh}
          title="Refresh data"
        >
          <RefreshCw size={14} />
          <span className="small d-none d-sm-inline">Refresh</span>
        </button>

        <div className="vr d-none d-sm-block text-secondary opacity-25 mx-1" style={{ height: '20px' }} />

        {/* User Info & Sign Out */}
        <div className="d-flex align-items-center gap-2">
          <div className="text-end d-none d-md-block">
            <div className="small fw-bold text-dark lh-1">
              {user?.name || 'Suldaan God'}
            </div>
            <div className="text-muted" style={{ fontSize: '0.7rem' }}>
              {user?.role || 'Administrator'}
            </div>
          </div>

          <button
            type="button"
            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 py-1 px-2"
            onClick={logout}
            title="Sign out"
          >
            <LogOut size={14} />
            <span className="small d-none d-sm-inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
