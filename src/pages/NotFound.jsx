import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-light text-center p-4">
      <div className="d-inline-flex p-3 rounded-circle bg-primary-subtle text-primary mb-3">
        <Truck size={48} />
      </div>
      <h1 className="display-5 fw-bold text-slate-900 mb-2">404</h1>
      <h5 className="fw-semibold text-slate-800 mb-2">Page Not Found</h5>
      <p className="text-secondary small mb-4" style={{ maxWidth: '420px' }}>
        The vehicle record, reporting ledger, or management screen you requested does not exist in the BASAH SERVICE LIMITED fleet system.
      </p>
      <Link to="/" className="btn btn-primary d-inline-flex align-items-center gap-2 px-4 py-2 fw-semibold">
        <Home size={16} />
        <span>Return to Fleet Dashboard</span>
      </Link>
    </div>
  );
}
