import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  PlusCircle,
  Search,
  Filter,
  Download,
  Eye,
  Edit2,
  Trash2,
  ArrowUpDown,
  RotateCcw,
  CheckCircle,
  Calendar
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { calculateReportSummary } from '../utils/calculations';
import { formatKSh, formatLitres, formatQuantity } from '../utils/currency';
import { formatDate } from '../utils/dateFormat';
import { exportToCSV } from '../utils/exportUtils';
import DailyReportModal from '../components/reports/DailyReportModal';
import ReportDetailModal from '../components/reports/ReportDetailModal';
import ConfirmModal from '../components/common/ConfirmModal';
import EmptyState from '../components/common/EmptyState';

export default function DailyReports() {
  const { reports, vehicles, addReport, updateReport, deleteReport } = useData();
  const { addToast } = useToast();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Sorting
  const [sortField, setSortField] = useState('reportDate');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [viewingReport, setViewingReport] = useState(null);
  const [reportToDelete, setReportToDelete] = useState(null);

  // Filter logic
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (selectedVehicle !== 'ALL' && r.vehicleRegistration !== selectedVehicle) {
        return false;
      }
      if (startDate && r.reportDate < startDate) {
        return false;
      }
      if (endDate && r.reportDate > endDate) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const routeMatch = r.routeOffloadDetails && r.routeOffloadDetails.toLowerCase().includes(q);
        const regMatch = r.vehicleRegistration && r.vehicleRegistration.toLowerCase().includes(q);
        const remarksMatch = r.remarks && r.remarks.toLowerCase().includes(q);
        if (!routeMatch && !regMatch && !remarksMatch) {
          return false;
        }
      }
      return true;
    });
  }, [reports, selectedVehicle, startDate, endDate, searchQuery]);

  // Sort logic
  const sortedReports = useMemo(() => {
    return [...filteredReports].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string') {
        const comp = valA.localeCompare(valB);
        return sortOrder === 'asc' ? comp : -comp;
      } else {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
    });
  }, [filteredReports, sortField, sortOrder]);

  // Pagination slice
  const totalPages = Math.ceil(sortedReports.length / pageSize) || 1;
  const paginatedReports = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedReports.slice(start, start + pageSize);
  }, [sortedReports, currentPage, pageSize]);

  // Totals for filtered records
  const summary = useMemo(() => {
    return calculateReportSummary(filteredReports);
  }, [filteredReports]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedVehicle('ALL');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
    addToast('Filters reset', 'info');
  };

  const handleDeleteConfirm = async () => {
    if (!reportToDelete) return;
    try {
      await deleteReport(reportToDelete.id);
      addToast('Daily operational report deleted', 'warning');
      setReportToDelete(null);
    } catch (err) {
      addToast('Failed to delete report: ' + err.message, 'danger');
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'Date',
      'Vehicle Plate',
      'Route / Offload Details',
      'Offload Qty (MT)',
      'Rate (KSh)',
      'Gross Amount (KSh)',
      'Fuel Litres',
      'Fuel Expense (KSh)',
      'Other Expense (KSh)',
      'Total Expenses (KSh)',
      'Net Income (KSh)',
      'Mileage (KM)',
      'Remarks'
    ];

    const rows = filteredReports.map((r) => [
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

    exportToCSV(`BASAH_DAILY_REPORTS_${new Date().toISOString().slice(0, 10)}`, headers, rows);
    addToast(`Exported ${filteredReports.length} records to CSV`, 'success');
  };

  return (
    <div className="container-fluid p-0">
      {/* Title & Action Bar */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-slate-900 mb-1">Daily Vehicle Operational Reports</h4>
          <p className="text-secondary small mb-0">
            Trip logs, cargo offloading quantities, contract rates, fuel consumption, and net earnings.
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
            onClick={() => setIsAddModalOpen(true)}
          >
            <PlusCircle size={15} />
            <span>New Daily Report</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Card */}
      <div className="card-modern p-3 mb-4 bg-white">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-4">
            <label className="form-label small fw-semibold text-secondary mb-1">
              Search Routes &amp; Remarks
            </label>
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light text-secondary">
                <Search size={14} />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Mombasa Port, ICD, Athi River, weighbridge..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          <div className="col-6 col-md-2">
            <label className="form-label small fw-semibold text-secondary mb-1">
              Vehicle Filter
            </label>
            <select
              className="form-select form-select-sm"
              value={selectedVehicle}
              onChange={(e) => {
                setSelectedVehicle(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">All Vehicles</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.registrationNumber}>
                  {v.registrationNumber}
                </option>
              ))}
            </select>
          </div>

          <div className="col-6 col-md-2">
            <label className="form-label small fw-semibold text-secondary mb-1">
              From Date
            </label>
            <input
              type="date"
              className="form-control form-control-sm"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="col-6 col-md-2">
            <label className="form-label small fw-semibold text-secondary mb-1">
              To Date
            </label>
            <input
              type="date"
              className="form-control form-control-sm"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="col-6 col-md-2 d-flex align-items-end pt-md-4">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-1"
              onClick={handleResetFilters}
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filtered Aggregation Summary Bar */}
      <div className="card-modern p-3 mb-4 bg-white border-primary-subtle">
        <div className="row g-3 text-center text-sm-start">
          <div className="col-6 col-md-2 border-end">
            <span className="small text-secondary d-block">Matching Entries</span>
            <span className="fs-6 fw-bold tabular-nums text-slate-800">
              {filteredReports.length} trips
            </span>
          </div>

          <div className="col-6 col-md-2 border-end">
            <span className="small text-secondary d-block">Total Gross Income</span>
            <span className="fs-6 fw-bold tabular-nums text-primary font-monospace">
              {formatKSh(summary.totalGross)}
            </span>
          </div>

          <div className="col-6 col-md-2 border-end">
            <span className="small text-secondary d-block">Total Fuel Expense</span>
            <span className="fs-6 fw-bold tabular-nums text-warning-emphasis font-monospace">
              {formatKSh(summary.totalFuelExpense)}
            </span>
          </div>

          <div className="col-6 col-md-2 border-end">
            <span className="small text-secondary d-block">Other Expenses</span>
            <span className="fs-6 fw-bold tabular-nums text-secondary font-monospace">
              {formatKSh(summary.totalOtherExpense)}
            </span>
          </div>

          <div className="col-6 col-md-2 border-end">
            <span className="small text-secondary d-block">Total Expenses</span>
            <span className="fs-6 fw-bold tabular-nums text-danger font-monospace">
              {formatKSh(summary.totalExpenses)}
            </span>
          </div>

          <div className="col-6 col-md-2">
            <span className="small text-secondary d-block">Net Operational Income</span>
            <span className={`fs-6 fw-bold tabular-nums font-monospace ${summary.totalNetIncome >= 0 ? 'text-success' : 'text-danger'}`}>
              {formatKSh(summary.totalNetIncome)}
            </span>
          </div>
        </div>
      </div>

      {/* Reports Table Card */}
      {sortedReports.length > 0 ? (
        <div className="card-modern bg-white overflow-hidden mb-4">
          <div className="table-responsive">
            <table className="table table-modern align-middle mb-0">
              <thead>
                <tr>
                  <th
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('reportDate')}
                    className="user-select-none"
                  >
                    <div className="d-flex align-items-center gap-1">
                      <span>Date</span>
                      <ArrowUpDown size={12} className="text-muted" />
                    </div>
                  </th>
                  <th>Vehicle</th>
                  <th>Route / Offload Details</th>
                  <th className="num-col">Qty (MT)</th>
                  <th className="num-col">Rate (KSh)</th>
                  <th
                    className="num-col user-select-none"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('grossAmount')}
                  >
                    <div className="d-flex align-items-center justify-content-end gap-1">
                      <span>Gross (KSh)</span>
                      <ArrowUpDown size={12} className="text-muted" />
                    </div>
                  </th>
                  <th className="num-col">Fuel</th>
                  <th
                    className="num-col user-select-none"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('totalExpenses')}
                  >
                    <div className="d-flex align-items-center justify-content-end gap-1">
                      <span>Total Exp</span>
                      <ArrowUpDown size={12} className="text-muted" />
                    </div>
                  </th>
                  <th
                    className="num-col user-select-none"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('netIncome')}
                  >
                    <div className="d-flex align-items-center justify-content-end gap-1">
                      <span>Net Income</span>
                      <ArrowUpDown size={12} className="text-muted" />
                    </div>
                  </th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedReports.map((report) => {
                  const isPositive = report.netIncome >= 0;
                  return (
                    <tr key={report.id}>
                      <td className="small text-nowrap fw-medium text-slate-800">
                        {formatDate(report.reportDate)}
                      </td>
                      <td>
                        <span className="vehicle-plate-badge text-dark">
                          {report.vehicleRegistration}
                        </span>
                      </td>
                      <td>
                        <div className="small fw-semibold text-slate-900 text-truncate" style={{ maxWidth: '250px' }} title={report.routeOffloadDetails}>
                          {report.routeOffloadDetails}
                        </div>
                        {report.remarks && (
                          <div className="small text-muted text-truncate" style={{ maxWidth: '250px', fontSize: '0.72rem' }}>
                            {report.remarks}
                          </div>
                        )}
                      </td>
                      <td className="num-col small font-monospace">
                        {formatQuantity(report.offloadQuantity, 'MT')}
                      </td>
                      <td className="num-col small font-monospace text-secondary">
                        {formatKSh(report.offloadRate, { showSymbol: false })}
                      </td>
                      <td className="num-col small fw-bold font-monospace text-primary">
                        {formatKSh(report.grossAmount)}
                      </td>
                      <td className="num-col small font-monospace" title={`${formatKSh(report.fuelExpense)} fuel cost`}>
                        {formatLitres(report.fuelLitres)}
                      </td>
                      <td className="num-col small font-monospace text-danger">
                        {formatKSh(report.totalExpenses)}
                      </td>
                      <td className={`num-col small fw-bold font-monospace ${isPositive ? 'text-success' : 'text-danger'}`}>
                        {formatKSh(report.netIncome)}
                      </td>
                      <td className="text-center">
                        <div className="d-flex align-items-center justify-content-center gap-1">
                          <button
                            type="button"
                            className="btn btn-sm btn-link text-secondary p-1"
                            title="View Full Breakdown"
                            onClick={() => setViewingReport(report)}
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm btn-link text-primary p-1"
                            title="Edit Report"
                            onClick={() => setEditingReport(report)}
                          >
                            <Edit2 size={15} />
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm btn-link text-danger p-1"
                            title="Delete Report"
                            onClick={() => setReportToDelete(report)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-3 border-top d-flex flex-column flex-sm-row align-items-center justify-content-between gap-2">
            <span className="small text-secondary">
              Showing Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({sortedReports.length} total entries)
            </span>

            {totalPages > 1 && (
              <nav aria-label="Report pagination">
                <ul className="pagination pagination-sm mb-0">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </button>
                  </li>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <li
                      key={i + 1}
                      className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </div>
        </div>
      ) : (
        <EmptyState
          title="No daily report entries match filters"
          description="Try broadening your date range, switching vehicles, or creating a new offloading entry."
          actionText="Log New Daily Report"
          onAction={() => setIsAddModalOpen(true)}
        />
      )}

      {/* Modals */}
      <DailyReportModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={async (data) => {
          await addReport(data);
          setIsAddModalOpen(false);
          addToast('Daily operational record added successfully', 'success');
        }}
        vehicles={vehicles}
      />

      <DailyReportModal
        isOpen={!!editingReport}
        initialData={editingReport}
        onClose={() => setEditingReport(null)}
        onSubmit={async (data) => {
          await updateReport(editingReport.id, data);
          setEditingReport(null);
          addToast('Report record updated successfully', 'success');
        }}
        vehicles={vehicles}
      />

      <ReportDetailModal
        isOpen={!!viewingReport}
        report={viewingReport}
        onClose={() => setViewingReport(null)}
        onEdit={(r) => {
          setViewingReport(null);
          setEditingReport(r);
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!reportToDelete}
        title="Delete Daily Report Record"
        message={`Are you sure you want to delete the report for ${reportToDelete?.vehicleRegistration} on ${reportToDelete?.reportDate}? Gross amount ${formatKSh(reportToDelete?.grossAmount)} will be removed from financial balances.`}
        confirmText="Delete Record"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setReportToDelete(null)}
      />
    </div>
  );
}
