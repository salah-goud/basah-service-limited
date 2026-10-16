import React, { useState, useEffect } from 'react';
import { X, Truck } from 'lucide-react';

export default function VehicleFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null
}) {
  const [formData, setFormData] = useState({
    registrationNumber: '',
    makeModel: '',
    type: 'Prime Mover / Semi-Trailer',
    capacity: '30.0 MT',
    status: 'Active',
    assignedDriver: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        registrationNumber: initialData.registrationNumber || '',
        makeModel: initialData.makeModel || '',
        type: initialData.type || 'Prime Mover / Semi-Trailer',
        capacity: initialData.capacity || '30.0 MT',
        status: initialData.status || 'Active',
        assignedDriver: initialData.assignedDriver || '',
        notes: initialData.notes || ''
      });
    } else {
      setFormData({
        registrationNumber: '',
        makeModel: '',
        type: 'Prime Mover / Semi-Trailer',
        capacity: '30.0 MT',
        status: 'Active',
        assignedDriver: '',
        notes: ''
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.registrationNumber.trim()) {
      errs.registrationNumber = 'Registration number is required (e.g. KDY 926B)';
    }
    if (!formData.makeModel.trim()) {
      errs.makeModel = 'Vehicle make and model are required (e.g. Actros 3340)';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...formData,
      registrationNumber: formData.registrationNumber.trim().toUpperCase()
    });
  };

  return (
    <div className="modal-backdrop-custom" role="dialog" aria-modal="true">
      <div className="card-modern shadow-xl bg-white w-100 my-auto" style={{ maxWidth: '540px' }}>
        <div className="d-flex align-items-center justify-content-between p-3 p-md-4 border-bottom bg-light">
          <div className="d-flex align-items-center gap-2">
            <div className="p-2 bg-primary-subtle text-primary rounded-2">
              <Truck size={20} />
            </div>
            <div>
              <h5 className="fw-bold mb-0 text-slate-900">
                {initialData ? 'Edit Fleet Vehicle' : 'Register New Fleet Vehicle'}
              </h5>
              <span className="small text-secondary">BASAH SERVICE LIMITED Logistics</span>
            </div>
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

        <form onSubmit={handleSubmit} className="p-3 p-md-4">
          <div className="mb-3">
            <label className="form-label small fw-semibold">Registration Plate *</label>
            <input
              type="text"
              name="registrationNumber"
              className={`form-control form-control-sm font-monospace text-uppercase ${errors.registrationNumber ? 'is-invalid' : ''}`}
              placeholder="e.g. KDY 926B"
              value={formData.registrationNumber}
              onChange={handleChange}
            />
            {errors.registrationNumber && (
              <div className="invalid-feedback">{errors.registrationNumber}</div>
            )}
            <div className="form-text small">Kenyan motor vehicle registration format.</div>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label small fw-semibold">Make & Model *</label>
              <input
                type="text"
                name="makeModel"
                className={`form-control form-control-sm ${errors.makeModel ? 'is-invalid' : ''}`}
                placeholder="e.g. Mercedes-Benz Actros 3340"
                value={formData.makeModel}
                onChange={handleChange}
              />
              {errors.makeModel && (
                <div className="invalid-feedback">{errors.makeModel}</div>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-semibold">Configuration / Type</label>
              <input
                type="text"
                name="type"
                className="form-control form-control-sm"
                placeholder="e.g. Prime Mover / 30T Trailer"
                value={formData.type}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label small fw-semibold">Payload Capacity</label>
              <input
                type="text"
                name="capacity"
                className="form-control form-control-sm"
                placeholder="e.g. 30.0 MT"
                value={formData.capacity}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-semibold">Operational Status</label>
              <select
                name="status"
                className="form-select form-select-sm"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Active">Active / On Duty</option>
                <option value="Maintenance">In Maintenance</option>
                <option value="Inactive">Decommissioned / Inactive</option>
              </select>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold">Assigned Driver</label>
            <input
              type="text"
              name="assignedDriver"
              className="form-control form-control-sm"
              placeholder="e.g. David Karanja"
              value={formData.assignedDriver}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold">Vehicle Notes</label>
            <textarea
              name="notes"
              rows={2}
              className="form-control form-control-sm"
              placeholder="Operational corridor, insurance details, inspection notes..."
              value={formData.notes}
              onChange={handleChange}
            />
          </div>

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
              {initialData ? 'Update Vehicle' : 'Register Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
