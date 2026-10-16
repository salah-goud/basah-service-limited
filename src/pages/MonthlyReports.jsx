import React, { useState, useMemo } from 'react';
import {
  CalendarRange,
  Download,
  Printer,
  Filter,
  Truck,
  RotateCcw,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Fuel,
  Receipt,
  FileText
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { calculateReportSummary } from '../utils/calculations';
import { formatKSh, formatLitres, formatQuantity } from '../utils/currency';
import { formatDate, formatMonthYear } from '../utils/dateFormat';
import { exportToCSV, triggerPrint } from '../utils/exportUtils';
import StatCard from '../components/common/StatCard';
import EmptyState from '../components/common/EmptyState';

export default function MonthlyReports() {
  const { reports, vehicles, settings } = useData();
  const { addToast } = useToast();

  const [selectedMonth, setSelectedMonth] = useState('2025-10');
  const [selectedVehicle, setSelectedVehicle] = useState('ALL');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Filter records
  const monthlyRecords = useMemo(() => {
    return reports.filter((r) => {
      if (selectedVehicle !== 'ALL' && r.vehicleRegistration !== selectedVehicle) {
        return false;
      }
      if (customStartDate && r.reportDate < customStartDate) {
        return false;
      }
      if (customEndDate && r.reportDate > customEndDate) {
        return false;
      }
      if (!customStartDate && !customEndDate && selectedMonth) {
        if (!r.reportDate || !r.reportDate.startsWith(selectedMonth)) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => new Date(a.reportDate) - new Date(b.reportDate));
  }, [reports, selectedMonth, selectedVehicle, customStartDate, customEndDate]);

  // Derived financial summary
  const summary = useMemo(() => {
    return calculateReportSummary(monthlyRecords);
  }, [monthlyRecords]);

  const handleExportCSV = () => {
    const headers = [
      'Report Date',
      'Vehicle Registration',
      'Route / Destination',
      'Offload Qty (MT)',
      'Offload Rate (KSh)',
      'Gross Amount (KSh)',
      'Fuel Litres',
      'Fuel Expense (KSh)',
      'Other Expense (KSh)',
      'Total Expenses (KSh)',
      'Net Income (KSh)',
      'Mileage (KM)',
      'Remarks'
    ];

    const rows = monthlyRecords.map((r) => [
      r.reportDate,
      r.vehicleRegistration,
      r.routeOffloadDetails,
      r.offloadQuantity,
      r.offloadRate,
      r.grossAmount,
      r.fuelLitres,
      r.fuelExpense,
      r.otherExpense,
      r.totalExpenses,
      r.netIncome,
      r.mileage,
      r.remarks
    ]);

    const filename = `BASAH_MONTHLY_SUMMARY_${selectedMonth}_${selectedVehicle}`;
    exportToCSV(filename, headers, rows);
    addToast('Monthly statement exported as CSV', 'success');
  };

  const handlePrint = () => {
    triggerPrint();
  };

  const activePeriodTitle = customStartDate || customEndDate
    ? `Custom Range (${formatDate(customStartDate)} - ${formatDate(customEndDate)})`
    : formatMonthYear(selectedMonth);

  return (
    <div className="container-fluid p-0">
      {/* Page Title & Actions */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4 no-print">
        <div>
          <h4 className="fw-bold text-slate-900 mb-1">Monthly Financial Performance Analysis</h4>
          <p className="text-secondary small mb-0">
            Consolidated vehicle operational earnings, diesel expenditures, and balance sheet breakdown.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
            onClick={handleExportCSV}
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            className="btn btn-sm btn-primary d-flex align-items-center gap-1 fw-semibold"
            onClick={handlePrint}
          >
            <Printer size={15} />
            <span>Print Monthly Statement</span>
          </button>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="card-modern p-3 mb-4 bg-white no-print">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-3">
            <label className="form-label small fw-semibold text-secondary mb-1">
              Billing Month
            </label>
            <select
              className="form-select form-select-sm"
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setCustomStartDate('');
                setCustomEndDate('');
              }}
            >
              <option value="2025-10">October 2025</option>
              <option value="2025-09">September 2025</option>
              <option value="2025-11">November 2025</option>
              <option value="2025-08">August 2025</option>
            </select>
          </div>

          <div className="col-12 col-md-3">
            <label className="form-label small fw-semibold text-secondary mb-1">
              Filter by Vehicle
            </label>
            <select
              className="form-select form-select-sm"
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
            >
              <option value="ALL">All Commercial Fleet Units</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.registrationNumber}>
                  {v.registrationNumber} - {v.makeModel}
                </option>
              ))}
            </select>
          </div>

          <div className="col-6 col-md-2">
            <label className="form-label small fw-semibold text-secondary mb-1">
              Custom From
            </label>
            <input
              type="date"
              className="form-control form-control-sm"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
            />
          </div>

          <div className="col-6 col-md-2">
            <label className="form-label small fw-semibold text-secondary mb-1">
              Custom To
            </label>
            <input
              type="date"
              className="form-control form-control-sm"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
            />
          </div>

          <div className="col-12 col-md-2 d-flex align-items-end pt-md-4">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-1"
              onClick={() => {
                setSelectedMonth('2025-10');
                setSelectedVehicle('ALL');
                setCustomStartDate('');
                setCustomEndDate('');
                addToast('Reset to October 2025', 'info');
              }}
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Official Executive Header (Visible in Print & On-screen) */}
      <div className="card-modern p-4 mb-4 bg-white">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start border-bottom pb-3 mb-3">
          <div>
            <span className="small text-secondary fw-semibold text-uppercase tracking-wider">
              OFFICIAL FINANCIAL MONTHLY STATEMENT
            </span>
            <h4 className="fw-bold text-slate-900 mb-0">{settings?.companyName || 'BASAH SERVICE LIMITED'}</h4>
            <span className="small text-muted">
              {settings?.headOffice || 'Mombasa - Nairobi Highway Corridor, Kenya'} | PIN: {settings?.taxPin || 'P051839201Z'}
            </span>
          </div>

          <div className="text-md-end mt-2 mt-md-0">
            <div className="badge bg-primary text-white fs-6 px-3 py-1">
              {activePeriodTitle}
            </div>
            <div className="small text-secondary mt-1">
              Scope: {selectedVehicle === 'ALL' ? 'Complete Fleet Consolidation' : `Vehicle Unit ${selectedVehicle}`}
            </div>
          </div>
        </div>

        {/* 6 Core Financial Summary Tiles */}
        <div className="row g-3">
          <div className="col-12 col-sm-6 col-md-4 col-xl-2">
            <div className="p-3 bg-light rounded-3 border">
              <span className="small text-secondary d-block fw-semibold">Gross Income</span>
              <span className="fs-5 fw-bold font-monospace text-primary">
                {formatKSh(summary.totalGross)}
              </span>
              <span className="small text-muted d-block mt-1" style={{ fontSize: '0.72rem' }}>
                {summary.recordCount} freight trips
              </span>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-md-4 col-xl-2">
            <div className="p-3 bg-light rounded-3 border">
              <span className="small text-secondary d-block fw-semibold">Fuel Expense</span>
              <span className="fs-5 fw-bold font-monospace text-warning-emphasis">
                {formatKSh(summary.totalFuelExpense)}
              </span>
              <span className="small text-muted d-block mt-1" style={{ fontSize: '0.72rem' }}>
                {formatLitres(summary.totalFuelLitres)} consumed
              </span>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-md-4 col-xl-2">
            <div className="p-3 bg-light rounded-3 border">
              <span className="small text-secondary d-block fw-semibold">Other Expenses</span>
              <span className="fs-5 fw-bold font-monospace text-secondary">
                {formatKSh(summary.totalOtherExpense)}
              </span>
              <span className="small text-muted d-block mt-1" style={{ fontSize: '0.72rem' }}>
                Tolls &amp; maintenance
              </span>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-md-4 col-xl-2">
            <div className="p-3 bg-light rounded-3 border">
              <span className="small text-secondary d-block fw-semibold">Total Expenses</span>
              <span className="fs-5 fw-bold font-monospace text-danger">
                {formatKSh(summary.totalExpenses)}
              </span>
              <span className="small text-muted d-block mt-1" style={{ fontSize: '0.72rem' }}>
                Fuel + operational
              </span>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-md-4 col-xl-2">
            <div className={`p-3 rounded-3 border ${summary.totalNetIncome >= 0 ? 'bg-success-subtle border-success-subtle' : 'bg-danger-subtle border-danger-subtle'}`}>
              <span className="small text-secondary d-block fw-semibold">Net Income</span>
              <span className={`fs-5 fw-bold font-monospace ${summary.totalNetIncome >= 0 ? 'text-success' : 'text-danger'}`}>
                {formatKSh(summary.totalNetIncome)}
              </span>
              <span className="small text-muted d-block mt-1" style={{ fontSize: '0.72rem' }}>
                Gross − Total Expenses
              </span>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-md-4 col-xl-2">
            <div className="p-3 bg-light rounded-3 border">
              <span className="small text-secondary d-block fw-semibold">Operating Days</span>
              <span className="fs-5 fw-bold font-monospace text-slate-800">
                {summary.workingDaysCount} Days
              </span>
              <span className="small text-muted d-block mt-1" style={{ fontSize: '0.72rem' }}>
                Active transit shifts
              </span>
            </div>
          </div>
        </div>

        {/* Operational Efficiency Metrics Row */}
        <div className="row g-3 mt-1 pt-3 border-top">
          <div className="col-12 col-md-4">
            <div className="d-flex align-items-center justify-content-between p-2 px-3 bg-light rounded-2">
              <span className="small text-secondary">Average Daily Gross Income:</span>
              <span className="small fw-bold font-monospace text-primary">
                {formatKSh(summary.averageDailyIncome)} / day
              </span>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="d-flex align-items-center justify-content-between p-2 px-3 bg-light rounded-2">
              <span className="small text-secondary">Average Daily Net Profit:</span>
              <span className={`small fw-bold font-monospace ${summary.averageDailyNetIncome >= 0 ? 'text-success' : 'text-danger'}`}>
                {formatKSh(summary.averageDailyNetIncome)} / day
              </span>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="d-flex align-items-center justify-content-between p-2 px-3 bg-light rounded-2">
              <span className="small text-secondary">Average Load Quantity:</span>
              <span className="small fw-bold font-monospace text-slate-800">
                {formatQuantity(summary.averageOffloadQty, 'MT')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Breakdown Ledger Table */}
      <div className="card-modern bg-white overflow-hidden mb-4">
        <div className="p-3 p-md-4 border-bottom d-flex align-items-center justify-content-between">
          <div>
            <h6 className="fw-bold mb-0 text-slate-800">Daily Offloading Ledger Breakdown</h6>
            <span className="small text-secondary">
              Chronological log corresponding to legacy KDY REPORTT.xlsx reporting
            </span>
          </div>
          <span className="badge bg-light text-secondary border">
            {monthlyRecords.length} Ledger Entries
          </span>
        </div>

        {monthlyRecords.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-modern align-middle mb-0">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Vehicle</th>
                  <th>Route / Destination</th>
                  <th className="num-col">Qty (MT)</th>
                  <th className="num-col">Rate (KSh)</th>
                  <th className="num-col">Gross (KSh)</th>
                  <th className="num-col">Fuel (L)</th>
                  <th className="num-col">Fuel Exp (KSh)</th>
                  <th className="num-col">Other Exp (KSh)</th>
                  <th className="num-col">Total Exp (KSh)</th>
                  <th className="num-col">Net (KSh)</th>
                  <th className="num-col">Mileage</th>
                </tr>
              </thead>
              <tbody>
                {monthlyRecords.map((record) => {
                  const isNetPos = record.netIncome >= 0;
                  return (
                    <tr key={record.id}>
                      <td className="small text-nowrap fw-medium">
                        {formatDate(record.reportDate)}
                      </td>
                      <td>
                        <span className="vehicle-plate-badge text-dark">
                          {record.vehicleRegistration}
                        </span>
                      </td>
                      <td className="small text-truncate" style={{ maxWidth: '220px' }} title={record.routeOffloadDetails}>
                        {record.routeOffloadDetails}
                      </td>
                      <td className="num-col small font-monospace">
                        {formatQuantity(record.offloadQuantity, 'MT')}
                      </td>
                      <td className="num-col small font-monospace text-secondary">
                        {formatKSh(record.offloadRate, { showSymbol: false })}
                      </td>
                      <td className="num-col small fw-bold font-monospace text-primary">
                        {formatKSh(record.grossAmount)}
                      </td>
                      <td className="num-col small font-monospace">
                        {formatLitres(record.fuelLitres)}
                      </td>
                      <td className="num-col small font-monospace text-warning-emphasis">
                        {formatKSh(record.fuelExpense)}
                      </td>
                      <td className="num-col small font-monospace text-secondary">
                        {formatKSh(record.otherExpense)}
                      </td>
                      <td className="num-col small font-monospace text-danger">
                        {formatKSh(record.totalExpenses)}
                      </td>
                      <td className={`num-col small fw-bold font-monospace ${isNetPos ? 'text-success' : 'text-danger'}`}>
                        {formatKSh(record.netIncome)}
                      </td>
                      <td className="num-col small font-monospace text-muted" title={record.mileageNote}>
                        {record.mileage ? `${record.mileage} KM` : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="table-light fw-bold">
                <tr>
                  <td colSpan={3} className="text-uppercase small">
                    Monthly Statement Totals:
                  </td>
                  <td className="num-col font-monospace small">
                    -
                  </td>
                  <td className="num-col font-monospace small">
                    -
                  </td>
                  <td className="num-col font-monospace text-primary small">
                    {formatKSh(summary.totalGross)}
                  </td>
                  <td className="num-col font-monospace small">
                    {formatLitres(summary.totalFuelLitres)}
                  </td>
                  <td className="num-col font-monospace text-warning-emphasis small">
                    {formatKSh(summary.totalFuelExpense)}
                  </td>
                  <td className="num-col font-monospace text-secondary small">
                    {formatKSh(summary.totalOtherExpense)}
                  </td>
                  <td className="num-col font-monospace text-danger small">
                    {formatKSh(summary.totalExpenses)}
                  </td>
                  <td className={`num-col font-monospace small ${summary.totalNetIncome >= 0 ? 'text-success' : 'text-danger'}`}>
                    {formatKSh(summary.totalNetIncome)}
                  </td>
                  <td className="num-col font-monospace text-muted small">
                    -
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No records found for this period"
            description="There are no offloading records logged for this vehicle and month selection."
          />
        )}
      </div>

      {/* Print Signature & Verification Block (Visible when printing) */}
      <div className="card-modern p-4 bg-white d-none print-only">
        <div className="row g-4 pt-4">
          <div className="col-4">
            <div className="border-top pt-2">
              <span className="small text-secondary d-block">Prepared By:</span>
              <span className="fw-semibold small d-block">Reporting / Operations Officer</span>
              <span className="small text-muted">BASAH SERVICE LIMITED</span>
            </div>
          </div>
          <div className="col-4">
            <div className="border-top pt-2">
              <span className="small text-secondary d-block">Checked &amp; Audited By:</span>
              <span className="fw-semibold small d-block">Finance Manager</span>
              <span className="small text-muted">BASAH SERVICE LIMITED</span>
            </div>
          </div>
          <div className="col-4">
            <div className="border-top pt-2">
              <span className="small text-secondary d-block">Approved By:</span>
              <span className="fw-semibold small d-block">Managing Director</span>
              <span className="small text-muted">BASAH SERVICE LIMITED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
