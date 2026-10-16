import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Save,
  RotateCcw,
  Shield,
  HelpCircle,
  Building,
  Info,
  CheckCircle2
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/common/ConfirmModal';

export default function Settings() {
  const { settings, updateSettings, resetAllDemoData } = useData();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    companyName: 'BASAH SERVICE LIMITED',
    registrationNumber: 'CPR/2018/382914',
    taxPin: 'P051839201Z',
    defaultCurrency: 'KSh',
    dateFormat: 'DD/MM/YYYY',
    defaultReportPeriod: 'Current Month',
    estimatedFuelPricePerLitre: 180.0,
    headOffice: 'Mombasa - Nairobi Highway Corridor, Athi River Hub, Kenya',
    supportEmail: 'operations@basahservice.co.ke',
    phone: '+254 722 000 000',
    mileageColumnPolicy: 'Tracked as operational travel distance (KM). Pending company confirmation if associated with per-km driver allowance or billing.'
  });

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setFormData((prev) => ({ ...prev, ...settings }));
    }
  }, [settings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setIsSaved(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateSettings(formData);
      setIsSaved(true);
      addToast('System settings saved successfully', 'success');
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      addToast('Error saving settings: ' + err.message, 'danger');
    }
  };

  const handleResetConfirm = async () => {
    try {
      await resetAllDemoData();
      setIsResetModalOpen(false);
      addToast('All demo records restored to initial state', 'info');
    } catch (err) {
      addToast('Error resetting data: ' + err.message, 'danger');
    }
  };

  return (
    <div className="container-fluid p-0">
      {/* Title */}
      <div className="mb-4">
        <h4 className="fw-bold text-slate-900 mb-1">System Settings &amp; Configuration</h4>
        <p className="text-secondary small mb-0">
          Configure financial display formats, company metadata, and operational calculation parameters.
        </p>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <div className="card-modern p-4 bg-white mb-4">
            <h5 className="fw-bold mb-3 text-slate-900 d-flex align-items-center gap-2">
              <Building size={20} className="text-primary" />
              <span>Company Information</span>
            </h5>

            <form onSubmit={handleSave}>
              <div className="row g-3 mb-3">
                <div className="col-12 col-md-8">
                  <label className="form-label small fw-semibold">Company Name *</label>
                  <input
                    type="text"
                    name="companyName"
                    className="form-control form-control-sm fw-semibold"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label small fw-semibold">KRA Tax PIN</label>
                  <input
                    type="text"
                    name="taxPin"
                    className="form-control form-control-sm font-monospace text-uppercase"
                    value={formData.taxPin}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Company Reg / Certificate No.</label>
                  <input
                    type="text"
                    name="registrationNumber"
                    className="form-control form-control-sm font-monospace"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Head Office / Depot Location</label>
                  <input
                    type="text"
                    name="headOffice"
                    className="form-control form-control-sm"
                    value={formData.headOffice}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Operations Contact Email</label>
                  <input
                    type="email"
                    name="supportEmail"
                    className="form-control form-control-sm"
                    value={formData.supportEmail}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Dispatch Phone</label>
                  <input
                    type="text"
                    name="phone"
                    className="form-control form-control-sm"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <h5 className="fw-bold mb-3 pt-3 border-top text-slate-900 d-flex align-items-center gap-2">
                <SettingsIcon size={20} className="text-primary" />
                <span>Financial &amp; Measurement Parameters</span>
              </h5>

              <div className="row g-3 mb-3">
                <div className="col-12 col-md-4">
                  <label className="form-label small fw-semibold">Default Currency</label>
                  <select
                    name="defaultCurrency"
                    className="form-select form-select-sm"
                    value={formData.defaultCurrency}
                    onChange={handleChange}
                  >
                    <option value="KSh">KSh (Kenyan Shilling)</option>
                    <option value="USD">USD (US Dollar)</option>
                    <option value="UGX">UGX (Uganda Shilling)</option>
                  </select>
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label small fw-semibold">Date Format</label>
                  <select
                    name="dateFormat"
                    className="form-select form-select-sm"
                    value={formData.dateFormat}
                    onChange={handleChange}
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY (Standard UK/Kenya)</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                  </select>
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label small fw-semibold">Fuel Ref Price (KSh/Litre)</label>
                  <input
                    type="number"
                    step="0.5"
                    name="estimatedFuelPricePerLitre"
                    className="form-control form-control-sm font-monospace"
                    value={formData.estimatedFuelPricePerLitre}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Mileage Policy Configuration Note */}
              <div className="mb-4">
                <label className="form-label small fw-semibold d-flex align-items-center gap-1">
                  <span>Mileage Column Ledger Policy</span>
                  <span title="Operational guidelines" className="text-secondary"><HelpCircle size={14} /></span>
                </label>
                <textarea
                  name="mileageColumnPolicy"
                  rows={2}
                  className="form-control form-control-sm"
                  value={formData.mileageColumnPolicy}
                  onChange={handleChange}
                />
                <div className="form-text small">
                  The legacy Excel sheet has a <code>MILEAGE</code> column. Currently treated as non-expense operational distance pending confirmation from company management.
                </div>
              </div>

              <div className="d-flex align-items-center justify-content-between pt-3 border-top">
                {isSaved ? (
                  <span className="text-success small d-flex align-items-center gap-1">
                    <CheckCircle2 size={16} />
                    <span>Configuration successfully updated.</span>
                  </span>
                ) : (
                  <span className="small text-muted">All preferences stored in local browser state.</span>
                )}

                <button
                  type="submit"
                  className="btn btn-sm btn-primary d-flex align-items-center gap-1 px-4 fw-semibold"
                >
                  <Save size={15} />
                  <span>Save Configuration</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Application Info & Reset */}
        <div className="col-12 col-lg-4">
          {/* App Info Card */}
          <div className="card-modern p-4 bg-white mb-4">
            <h6 className="fw-bold text-slate-900 mb-3 d-flex align-items-center gap-2">
              <Info size={18} className="text-primary" />
              <span>System Metadata</span>
            </h6>

            <div className="small text-secondary mb-3">
              <div className="d-flex justify-content-between py-1 border-bottom">
                <span>Application:</span>
                <span className="fw-bold text-slate-800">Basah Fleet MIS</span>
              </div>
              <div className="d-flex justify-content-between py-1 border-bottom">
                <span>Phase:</span>
                <span className="badge bg-primary-subtle text-primary">Phase 1: Frontend First</span>
              </div>
              <div className="d-flex justify-content-between py-1 border-bottom">
                <span>Excel Baseline:</span>
                <span className="font-monospace text-slate-800">KDY REPORTT.xlsx</span>
              </div>
              <div className="d-flex justify-content-between py-1 border-bottom">
                <span>Primary Lead Unit:</span>
                <span className="vehicle-plate-badge text-dark py-0 px-1" style={{ fontSize: '0.72rem' }}>KDY 926B</span>
              </div>
              <div className="d-flex justify-content-between py-1 border-bottom">
                <span>Backend Target:</span>
                <span className="text-slate-800">Node.js + Express + MySQL</span>
              </div>
            </div>

            <p className="small text-muted mb-0" style={{ fontSize: '0.75rem' }}>
              Designed with modular service abstractions to ensure zero friction when wiring REST endpoints in Phase 2.
            </p>
          </div>

          {/* Reset Demo Data Action */}
          <div className="card-modern p-4 bg-white border-danger-subtle">
            <h6 className="fw-bold text-danger mb-2 d-flex align-items-center gap-2">
              <RotateCcw size={18} />
              <span>Restore Factory Demo Data</span>
            </h6>
            <p className="text-secondary small mb-3">
              Reset all vehicles, daily trip reports, users, and settings back to the initial baseline from <code>KDY REPORTT.xlsx</code>.
            </p>
            <button
              type="button"
              className="btn btn-sm btn-outline-danger w-100"
              onClick={() => setIsResetModalOpen(true)}
            >
              Reset All Demo Records
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmModal
        isOpen={isResetModalOpen}
        title="Restore Baseline Demo Data"
        message="This will overwrite any local records you added or edited and re-populate the original sample entries for KDY 926B and demo vehicles. Proceed?"
        confirmText="Confirm Reset"
        confirmVariant="danger"
        onConfirm={handleResetConfirm}
        onCancel={() => setIsResetModalOpen(false)}
      />
    </div>
  );
}
