import React from 'react';
import { X, Calendar, Truck, Fuel, DollarSign, MapPin, Gauge, FileText, Printer, Edit2 } from 'lucide-react';
import { formatKSh, formatLitres, formatQuantity } from '../../utils/currency';
import { formatDate } from '../../utils/dateFormat';

export default function ReportDetailModal({
  isOpen,
  onClose,
  report,
  onEdit
}) {
  if (!isOpen || !report) return null;

  const isNetPositive = (report.netIncome || 0) >= 0;

  return (
    <div className="modal-backdrop-custom" role="dialog" aria-modal="true">
      <div className="card-modern shadow-xl bg-white w-100 my-auto" style={{ maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between p-3 p-md-4 border-bottom bg-light">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="vehicle-plate-badge text-dark">{report.vehicleRegistration}</span>
              <span className="badge bg-secondary-subtle text-secondary small">
                {formatDate(report.reportDate)}
              </span>
            </div>
            <h5 className="fw-bold text-slate-900 mb-0">Vehicle Daily Operation Record</h5>
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

        {/* Content Body */}
        <div className="p-3 p-md-4">
          {/* Offloading summary block */}
          <div className="mb-4">
            <h6 className="small fw-bold text-uppercase text-secondary tracking-wider mb-2">
              Route & Cargo Offload
            </h6>
            <div className="p-3 bg-light rounded-3 border">
              <div className="d-flex align-items-start gap-2 mb-2">
                <MapPin size={18} className="text-primary mt-1 shrink-0" />
                <div>
                  <div className="fw-semibold text-slate-900">{report.routeOffloadDetails}</div>
                  <div className="small text-secondary">Designated transit delivery route</div>
                </div>
              </div>
              <div className="row g-2 pt-2 border-top">
                <div className="col-6">
                  <span className="text-secondary small">Offload Quantity:</span>
                  <div className="fw-bold font-monospace">{formatQuantity(report.offloadQuantity, 'MT')}</div>
                </div>
                <div className="col-6">
                  <span className="text-secondary small">Contract Rate:</span>
                  <div className="fw-bold font-monospace">{formatKSh(report.offloadRate)} / MT</div>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Breakdown Table */}
          <div className="mb-4">
            <h6 className="small fw-bold text-uppercase text-secondary tracking-wider mb-2">
              Financial Breakdown
            </h6>
            <div className="table-responsive border rounded-3 overflow-hidden">
              <table className="table table-modern table-sm mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Ledger Item</th>
                    <th className="text-end">Amount (KSh)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Gross Cargo Income</td>
                    <td className="text-end fw-bold font-monospace text-primary">
                      {formatKSh(report.grossAmount)}
                    </td>
                  </tr>
                  <tr>
                    <td className="ps-3 text-secondary">
                      - Fuel Expense ({formatLitres(report.fuelLitres)})
                    </td>
                    <td className="text-end font-monospace text-danger">
                      - {formatKSh(report.fuelExpense)}
                    </td>
                  </tr>
                  <tr>
                    <td className="ps-3 text-secondary">- Other Expenses (Weighbridge/Tolls/Repairs)</td>
                    <td className="text-end font-monospace text-danger">
                      - {formatKSh(report.otherExpense)}
                    </td>
                  </tr>
                  <tr className="table-light fw-bold">
                    <td>Total Operating Expenses</td>
                    <td className="text-end font-monospace text-danger">
                      {formatKSh(report.totalExpenses)}
                    </td>
                  </tr>
                  <tr className={isNetPositive ? 'table-success' : 'table-danger'}>
                    <td className="fw-bold">Net Operational Income</td>
                    <td className={`text-end fw-bold font-monospace fs-6 ${isNetPositive ? 'text-success' : 'text-danger'}`}>
                      {formatKSh(report.netIncome)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Operational notes & mileage */}
          <div className="row g-3 mb-3">
            <div className="col-sm-6">
              <div className="p-3 border rounded-3">
                <span className="small text-secondary d-block">Operational Mileage</span>
                <span className="fs-5 fw-bold font-monospace text-dark">
                  {report.mileage ? `${report.mileage} KM` : 'Not recorded'}
                </span>
                <span className="small text-muted d-block mt-1" style={{ fontSize: '0.72rem' }}>
                  {report.mileageNote || 'Operational distance tracking (expense pending confirmation)'}
                </span>
              </div>
            </div>

            <div className="col-sm-6">
              <div className="p-3 border rounded-3 h-100">
                <span className="small text-secondary d-block">Fuel Consumption</span>
                <span className="fs-5 fw-bold font-monospace text-dark">
                  {formatLitres(report.fuelLitres)}
                </span>
                <span className="small text-muted d-block mt-1" style={{ fontSize: '0.72rem' }}>
                  Total diesel pumped for this journey
                </span>
              </div>
            </div>
          </div>

          {report.remarks && (
            <div className="p-3 bg-light rounded-3 border">
              <span className="small fw-semibold text-secondary d-block mb-1">Operational Remarks:</span>
              <p className="small text-dark mb-0">{report.remarks}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="d-flex align-items-center justify-content-between p-3 p-md-4 border-top bg-light">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
            onClick={() => window.print()}
          >
            <Printer size={14} />
            <span>Print Voucher</span>
          </button>
          
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary px-3"
              onClick={onClose}
            >
              Close
            </button>
            {onEdit && (
              <button
                type="button"
                className="btn btn-sm btn-primary px-3 d-flex align-items-center gap-1"
                onClick={() => {
                  onClose();
                  onEdit(report);
                }}
              >
                <Edit2 size={14} />
                <span>Edit Record</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
