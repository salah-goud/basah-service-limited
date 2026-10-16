import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileSpreadsheet,
  CalendarRange,
  Truck,
  FileUp,
  Users,
  Settings,
  PlusCircle,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ isOpen, onClose, onQuickAddReport }) {
  const { user } = useAuth();

  const navItems = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/reports', label: 'Reports', icon: FileSpreadsheet },
    { to: '/vehicles', label: 'Vehicles', icon: Truck },
    { to: '/import-export', label: 'Import & export', icon: FileUp },
    { to: '/users', label: 'Team', icon: Users },
    { to: '/settings', label: 'Settings', icon: Settings }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="d-lg-none position-fixed top-0 start-0 w-100 h-100 bg-dark opacity-50"
          style={{ zIndex: 1039 }}
          onClick={onClose}
        />
      )}

      <aside
        className={`app-sidebar position-fixed top-0 start-0 h-100 d-flex flex-column ${
          isOpen ? 'translate-middle-x-0' : 'd-none d-lg-flex'
        }`}
        style={{
          transform: isOpen ? 'translateX(0)' : undefined
        }}
      >
        {/* Brand Header */}
        <div className="p-3 border-bottom border-white-10 d-flex align-items-center justify-content-between">
          <div>
            <div className="fw-semibold text-white">
              BASAH SERVICE
            </div>
            <div className="text-white-50 small" style={{ fontSize: '0.75rem' }}>
              Fleet operations
            </div>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-link text-white-50 d-lg-none p-1"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-grow-1 px-3 py-3 overflow-y-auto">
          <nav className="nav flex-column gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => {
                    if (window.innerWidth < 992) onClose();
                  }}
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'active' : ''}`
                  }
                  end={item.to === '/'}
                >
                  <Icon size={18} className="shrink-0" />
                  <span className="text-truncate">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Quick Action Button */}
          {onQuickAddReport && (
            <div className="mt-4 pt-3 border-top border-white-10">
              <button
                type="button"
                className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2 py-2 text-white fw-medium shadow-sm"
                style={{ fontSize: '0.85rem' }}
                onClick={() => {
                  if (window.innerWidth < 992) onClose();
                  onQuickAddReport();
                }}
              >
                <PlusCircle size={16} />
                <span>Add trip</span>
              </button>
            </div>
          )}
        </div>

      </aside>
    </>
  );
}
