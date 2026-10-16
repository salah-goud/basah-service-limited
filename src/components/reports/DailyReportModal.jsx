import React, { useState, useEffect } from 'react';
import { X, Calculator, HelpCircle, AlertCircle } from 'lucide-react';
import { calculateGrossAmount, calculateTotalExpenses, calculateNetIncome } from '../../utils/calculations';
import { formatKSh } from '../../utils/currency';
import { getTodayString } from '../../utils/dateFormat';

export default function DailyReportModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  vehicles = []
}) {
  const [formData, setFormData] = useState({
    reportDate: getTodayString(),
    vehicleRegistration: 'KDY 926B',
    routeOffloadDetails: '',
    offloadQuantity: '',
    offloadRate: '',
    fuelLitres: '',
    fuelExpense: '',
    otherExpense: '',
    mileage: '',
    remarks: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        reportDate: initialData.reportDate || getTodayString(),
        vehicleRegistration: initialData.vehicleRegistration || 'KDY 926B',
        routeOffloadDetails: initialData.routeOffloadDetails || '',
        offloadQuantity: initialData.offloadQuantity !== undefined ? String(initialData.offloadQuantity) : '',
        offloadRate: initialData.offloadRate !== undefined ? String(initialData.offloadRate) : '',
        fuelLitres: initialData.fuelLitres !== undefined ? String(initialData.fuelLitres) : '',
        fuelExpense: initialData.fuelExpense !== undefined ? String(initialData.fuelExpense) : '',
        otherExpense: initialData.otherExpense !== undefined ? String(initialData.otherExpense) : '',
        mileage: initialData.mileage !== undefined ? String(initialData.mileage) : '',
        remarks: initialData.remarks || ''
      });
    } else {
      setFormData({
        reportDate: getTodayString(),
        vehicleRegistration: vehicles[0]?.registrationNumber || 'KDY 926B',
        routeOffloadDetails: '',
        offloadQuantity: '',
        offloadRate: '',
        fuelLitres: '',
        fuelExpense: '',
        otherExpense: '',
        mileage: '',
        remarks: ''
      });
    }
    setErrors({});
  }, [initialData, isOpen, vehicles]);

  if (!isOpen) return null;

  // Real-time calculated values
  const grossAmount = calculateGrossAmount(formData.offloadQuantity, formData.offloadRate);
  const totalExpenses = calculateTotalExpenses(formData.fuelExpense, formData.otherExpense);
  const netIncome = calculateNetIncome(grossAmount, totalExpenses);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.reportDate) errs.reportDate = 'Report date is required';
    if (!formData.vehicleRegistration) errs.vehicleRegistration = 'Vehicle registration is required';
    if (!formData.routeOffloadDetails.trim()) errs.routeOffloadDetails = 'Route / Offload details are required';
    
    const qty = parseFloat(formData.offloadQuantity);
    if (isNaN(qty) || qty <= 0) {
      errs.offloadQuantity = 'Please enter a valid offload quantity (> 0)';
    }

    const rate = parseFloat(formData.offloadRate);
    if (isNaN(rate) || rate <= 0) {
      errs.offloadRate = 'Please enter a valid offload rate (> 0 KSh)';
    }

    const fuelExp = parseFloat(formData.fuelExpense);
    if (formData.fuelExpense !== '' && (isNaN(fuelExp) || fuelExp < 0)) {
      errs.fuelExpense = 'Fuel expense cannot be negative';
    }

    const otherExp = parseFloat(formData.otherExpense);
    if (formData.otherExpense !== '' && (isNaN(otherExp) || otherExp < 0)) {
      errs.otherExpense = 'Other expense cannot be negative';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      ...formData,
      offloadQuantity: parseFloat(formData.offloadQuantity) || 0,
      offloadRate: parseFloat(formData.offloadRate) || 0,
      fuelLitres: parseFloat(formData.fuelLitres) || 0,
      fuelExpense: parseFloat(formData.fuelExpense) || 0,
      otherExpense: parseFloat(formData.otherExpense) || 0,
      mileage: parseFloat(formData.mileage) || 0,
      grossAmount,
      totalExpenses,
      netIncome
    });
  };

  return (
    <div className="modal-backdrop-custom" role="dialog" aria-modal="true" aria-labelledby="report-modal-title">
      <div className="card-modern shadow-xl bg-white w-100 my-auto" style={{ maxWidth: '780px', maxHeight: '92vh', overflowY: 'auto' }}>
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between p-3 p-md-4 border-bottom sticky-top bg-white" style={{ zIndex: 10 }}>
          <div>
            <h5 id="report-modal-title" className="fw-bold mb-0 text-slate-900">
              {initialData ? 'Edit Daily Vehicle Report' : 'New Daily Vehicle Report'}
            </h5>
            <span className="small text-secondary">
              BASAH SERVICE LIMITED Fleet Financial Operations
            </span>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary p-1"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-3 p-md-4">
          {/* Row 1: Date & Vehicle */}
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label small fw-semibold">Report Date *</label>
              <input
                type="date"
                name="reportDate"
                className={`form-control form-control-sm ${errors.reportDate ? 'is-invalid' : ''}`}
                value={formData.reportDate}
                onChange={handleChange}
              />
              {errors.reportDate && <div className="invalid-feedback">{errors.reportDate}</div>}
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-semibold">Vehicle Registration *</label>
              <select
                name="vehicleRegistration"
                className={`form-select form-select-sm ${errors.vehicleRegistration ? 'is-invalid' : ''}`}
                value={formData.vehicleRegistration}
                onChange={handleChange}
              >
                {vehicles.map((v) => (
                  <option key={v.id || v.registrationNumber} value={v.registrationNumber}>
                    {v.registrationNumber} ({v.makeModel || 'Fleet Truck'})
                  </option>
                ))}
                {!vehicles.some((v) => v.registrationNumber === 'KDY 926B') && (
                  <option value="KDY 926B">KDY 926B (Primary Unit)</option>
                )}
              </select>
              {errors.vehicleRegistration && <div className="invalid-feedback">{errors.vehicleRegistration}</div>}
            </div>
          </div>

          {/* Row 2: Route / Offloading Details */}
          <div className="mb-3">
            <label className="form-label small fw-semibold">Route / Offloading Details *</label>
            <input
              type="text"
              name="routeOffloadDetails"
              className={`form-control form-control-sm ${errors.routeOffloadDetails ? 'is-invalid' : ''}`}
              placeholder="e.g. Mombasa Port Berth 14 - Nairobi ICD Yard"
              value={formData.routeOffloadDetails}
              onChange={handleChange}
            />
            {errors.routeOffloadDetails && <div className="invalid-feedback">{errors.routeOffloadDetails}</div>}
            <div className="form-text small">Destination or corridor for this day's offload assignment.</div>
          </div>

          {/* Section: Income Calculations */}
          <div className="p-3 bg-light rounded-3 mb-3 border">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="small fw-bold text-uppercase text-secondary tracking-wider">
                1. Offload Income Metrics
              </span>
              <span className="small text-muted font-monospace">Gross = Qty × Rate</span>
            </div>

            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label small fw-semibold">Offload Quantity (MT/Units) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="offloadQuantity"
                  className={`form-control form-control-sm ${errors.offloadQuantity ? 'is-invalid' : ''}`}
                  placeholder="e.g. 30.0"
                  value={formData.offloadQuantity}
                  onChange={handleChange}
                />
                {errors.offloadQuantity && <div className="invalid-feedback">{errors.offloadQuantity}</div>}
              </div>

              <div className="col-md-4">
                <label className="form-label small fw-semibold">Offload Rate (KSh per MT) *</label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text">KSh</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="offloadRate"
                    className={`form-control ${errors.offloadRate ? 'is-invalid' : ''}`}
                    placeholder="e.g. 4200.00"
                    value={formData.offloadRate}
                    onChange={handleChange}
                  />
                </div>
                {errors.offloadRate && <div className="text-danger small mt-1">{errors.offloadRate}</div>}
              </div>

              <div className="col-md-4">
                <label className="form-label small fw-semibold text-primary">Calculated Gross Amount</label>
                <div className="form-control form-control-sm bg-white fw-bold text-primary font-monospace">
                  {formatKSh(grossAmount)}
                </div>
                <div className="form-text small">Auto-calculated immediately</div>
              </div>
            </div>
          </div>

          {/* Section: Operational Expenses */}
          <div className="p-3 bg-light rounded-3 mb-3 border">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="small fw-bold text-uppercase text-secondary tracking-wider">
                2. Operational Expenses
              </span>
              <span className="small text-muted font-monospace">Total Exp = Fuel + Other</span>
            </div>

            <div className="row g-3 mb-2">
              <div className="col-md-4">
                <label className="form-label small fw-semibold">Fuel Litres Consumed</label>
                <div className="input-group input-group-sm">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    name="fuelLitres"
                    className="form-control"
                    placeholder="e.g. 240.0"
                    value={formData.fuelLitres}
                    onChange={handleChange}
                  />
                  <span className="input-group-text">L</span>
                </div>
              </div>

              <div className="col-md-4">
                <label className="form-label small fw-semibold">Fuel Expense (KSh) *</label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text">KSh</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="fuelExpense"
                    className={`form-control ${errors.fuelExpense ? 'is-invalid' : ''}`}
                    placeholder="e.g. 43200.00"
                    value={formData.fuelExpense}
                    onChange={handleChange}
                  />
                </div>
                {errors.fuelExpense && <div className="text-danger small mt-1">{errors.fuelExpense}</div>}
              </div>

              <div className="col-md-4">
                <label className="form-label small fw-semibold">Other Expense (KSh)</label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text">KSh</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="otherExpense"
                    className={`form-control ${errors.otherExpense ? 'is-invalid' : ''}`}
                    placeholder="Tolls, repairs, etc."
                    value={formData.otherExpense}
                    onChange={handleChange}
                  />
                </div>
                {errors.otherExpense && <div className="text-danger small mt-1">{errors.otherExpense}</div>}
              </div>
            </div>

            <div className="row g-2 pt-2 border-top">
              <div className="col-6">
                <span className="small text-secondary">Total Calculated Expenses:</span>
              </div>
              <div className="col-6 text-end">
                <span className="small fw-bold text-danger font-monospace">
                  {formatKSh(totalExpenses)}
                </span>
              </div>
            </div>
          </div>

          {/* Section: Live Financial Net Result */}
          <div className={`p-3 rounded-3 mb-3 border ${netIncome >= 0 ? 'bg-success-subtle border-success-subtle' : 'bg-danger-subtle border-danger-subtle'}`}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="small fw-bold text-uppercase d-block text-secondary">
                  3. Net Operating Income (Gross - Total Expenses)
                </span>
                <span className="small text-muted" style={{ fontSize: '0.78rem' }}>
                  {netIncome >= 0 ? 'Profitable single trip record' : 'Deficit trip: expenses exceed gross amount'}
                </span>
              </div>
              <div className="text-end">
                <span className={`fs-5 fw-bold font-monospace ${netIncome >= 0 ? 'text-success' : 'text-danger'}`}>
                  {formatKSh(netIncome)}
                </span>
              </div>
            </div>
          </div>

          {/* Row 3: Mileage & Remarks */}
          <div className="row g-3 mb-3">
            <div className="col-md-4">
              <label className="form-label small fw-semibold d-flex align-items-center gap-1">
                <span>Trip Mileage (KM)</span>
                <span
                  title="Operational odometer distance. Note: Not currently classified as an expense pending company policy confirmation."
                  className="text-secondary"
                >
                  <HelpCircle size={14} />
                </span>
              </label>
              <div className="input-group input-group-sm">
                <input
                  type="number"
                  step="1"
                  min="0"
                  name="mileage"
                  className="form-control"
                  placeholder="e.g. 485"
                  value={formData.mileage}
                  onChange={handleChange}
                />
                <span className="input-group-text">KM</span>
              </div>
              <div className="form-text small" style={{ fontSize: '0.7rem' }}>
                Operational distance (expense pending confirmation)
              </div>
            </div>

            <div className="col-md-8">
              <label className="form-label small fw-semibold">Remarks / Operational Notes</label>
              <input
                type="text"
                name="remarks"
                className="form-control form-control-sm"
                placeholder="Weighbridge notes, driver comments, tyre inspection..."
                value={formData.remarks}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="d-flex justify-content-end gap-2 pt-3 border-top">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary px-3"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-sm btn-primary px-4 fw-semibold"
            >
              {initialData ? 'Update Record' : 'Save Daily Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
