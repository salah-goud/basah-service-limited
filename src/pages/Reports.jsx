import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FileSpreadsheet,
  CalendarRange,
  PlusCircle,
  Download,
  Printer,
  Search,
  Filter,
  ArrowUpDown,
  RotateCcw,
  Eye,
  Edit2,
  Trash2,
  DollarSign,
  Fuel,
  Receipt,
  TrendingUp,
  TrendingDown,
  Building,
  Truck
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { calculateReportSummary } from '../utils/calculations';
import { formatKSh, formatLitres, formatQuantity } from '../utils/currency';
import { formatDate, formatMonthYear } from '../utils/dateFormat';
import { exportToCSV, triggerPrint } from '../utils/exportUtils';
import DailyReportModal from '../components/reports/DailyReportModal';
import ReportDetailModal from '../components/reports/ReportDetailModal';
import ConfirmModal from '../components/common/ConfirmModal';
import EmptyState from '../components/common/EmptyState';
import StatCard from '../components/common/StatCard';

export default function Reports() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'monthly' ? 'monthly' : 'daily';
  const [activeTab, setActiveTab] = useState(initialTab);

  const { reports, vehicles, settings, addReport, updateReport, deleteReport } = useData();
  const { addToast } = useToast();

  // Sync tab with URL search parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'monthly' || tabParam === 'daily') {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // ==========================================
  // SHARED & DAILY FILTERS STATE
  // ==========================================
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortField, setSortField] = useState('reportDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // ==========================================
  // MONTHLY SPECIFIC STATE
  // ==========================================
  const [selectedMonth, setSelectedMonth] = useState('2025-10');
  const [monthlyCustomStart, setMonthlyCustomStart] = useState('');
  const [monthlyCustomEnd, setMonthlyCustomEnd] = useState('');

  // ==========================================
  // MODALS STATE
  // ==========================================
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [viewingReport, setViewingReport] = useState(null);
  const [reportToDelete, setReportToDelete] = useState(null);

  // Filtered Daily Reports
  const filteredDailyReports = useMemo(() => {
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
        if (!routeMatch && !regMatch && !remarksMatch) return false;
      }
      return true;
    });
  }, [reports, selectedVehicle, startDate, endDate, searchQuery]);

  // Sorted Daily Reports
  const sortedDailyReports = useMemo(() => {
    return [...filteredDailyReports].sort((a, b) => {
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
  }, [filteredDailyReports, sortField, sortOrder]);

  const totalPages = Math.ceil(sortedDailyReports.length / pageSize) || 1;
  const paginatedDailyReports = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedDailyReports.slice(start, start + pageSize);
  }, [sortedDailyReports, currentPage, pageSize]);

  const dailySummary = useMemo(() => {
    return calculateReportSummary(filteredDailyReports);
  }, [filteredDailyReports]);

  // Filtered Monthly Records
  const filteredMonthlyRecords = useMemo(() => {
    return reports.filter((r) => {
      if (selectedVehicle !== 'ALL' && r.vehicleRegistration !== selectedVehicle) {
        return false;
      }
      if (monthlyCustomStart && r.reportDate < monthlyCustomStart) {
        return false;
      }
      if (monthlyCustomEnd && r.reportDate > monthlyCustomEnd) {
        return false;
      }
      if (!monthlyCustomStart && !monthlyCustomEnd && selectedMonth) {
        if (!r.reportDate || !r.reportDate.startsWith(selectedMonth)) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => new Date(a.reportDate) - new Date(b.reportDate));
  }, [reports, selectedVehicle, selectedMonth, monthlyCustomStart, monthlyCustomEnd]);

  const monthlySummary = useMemo(() => {
    return calculateReportSummary(filteredMonthlyRecords);
  }, [filteredMonthlyRecords]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleResetDailyFilters = () => {
    setSearchQuery('');
    setSelectedVehicle('ALL');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
    addToast('Daily filters reset', 'info');
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
    const isDaily = activeTab === 'daily';
    const targetRecords = isDaily ? filteredDailyReports : filteredMonthlyRecords;

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

    const rows = targetRecords.map((r) => [
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

    const prefix = isDaily ? 'BASAH_DAILY_REPORTS' : `BASAH_MONTHLY_REPORT_${selectedMonth}`;
    exportToCSV(`${prefix}_${new Date().toISOString().slice(0, 10)}`, headers, rows);
    addToast(`Exported ${targetRecords.length} records to CSV`, 'success');
  };

  const monthlyActivePeriodTitle = monthlyCustomStart || monthlyCustomEnd
    ? `Custom Range (${formatDate(monthlyCustomStart)} - ${formatDate(monthlyCustomEnd)})`
    : formatMonthYear(selectedMonth);

  return (
    <div className="container-fluid p-0">
      {/* Top Header & Unified Segmented Controls */}
      <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-4 no-print">
        <div>
          <h4 className="fw-bold text-slate-900 mb-1">Vehicle Income &amp; Expense Reports</h4>
          <p className="text-secondary small mb-0">
            Unified reporting hub for daily offloading dispatches, trip ledgers, and monthly executive statements.
          </p>
        </div>

        {/* View Switcher & Action Buttons */}
        <div className="d-flex flex-wrap align-items-center gap-2">
          {/* Segmented Control for Report View */}
          <div className="bg-light p-1 rounded-3 border d-inline-flex align-items-center">
            <button
              type="button"
              className={`btn btn-sm px-3 py-1 fw-semibold transition-all ${
                activeTab === 'daily'
                  ? 'btn-white bg-white text-primary shadow-sm'
                  : 'text-secondary border-0 bg-transparent'
              }`}
              onClick={() => handleTabChange('daily')}
            >
              <span className="d-inline-flex align-items-center gap-1.5">
                <FileSpreadsheet size={15} />
                <span>Daily Reports</span>
              </span>
            </button>

            <button
              type="button"
              className={`btn btn-sm px-3 py-1 fw-semibold transition-all ${
                activeTab === 'monthly'
                  ? 'btn-white bg-white text-primary shadow-sm'
                  : 'text-secondary border-0 bg-transparent'
              }`}
              onClick={() => handleTabChange('monthly')}
            >
              <span className="d-inline-flex align-items-center gap-1.5">
                <CalendarRange size={15} />
                <span>Monthly Statements</span>
              </span>
            </button>
          </div>

          {/* Action buttons */}
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
            onClick={handleExportCSV}
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          {activeTab === 'monthly' ? (
            <button
              type="button"
              className="btn btn-sm btn-primary d-flex align-items-center gap-1 fw-semibold"
              onClick={triggerPrint}
            >
              <Printer size={14} />
              <span>Print Statement</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-sm btn-primary d-flex align-items-center gap-1 fw-semibold"
              onClick={() => setIsAddModalOpen(true)}
            >
              <PlusCircle size={14} />
              <span>New Daily Entry</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DAILY VEHICLE REPORTS */}
      {/* ========================================================================= */}
      {activeTab === 'daily' && (
        <>
          {/* Filter Bar */}
          <div className="card-modern p-3 mb-4 bg-white no-print">
            <div className="row g-2 align-items-center">
              <div className="col-12 col-md-4">
                <label className="form-label small fw-semibold text-secondary mb-1">
                  Search Route or Remarks
                </label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-light text-secondary">
                    <Search size={14} />
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Mombasa Port, Nairobi ICD, weighbridge..."
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
                  Filter Vehicle
                </label>
                <select
                  className="form-select form-select-sm"
                  value={selectedVehicle}
                  onChange={(e) => {
                    setSelectedVehicle(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="ALL">All Vehicles ({vehicles.length})</option>
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
                  onClick={handleResetDailyFilters}
                >
                  <RotateCcw size={14} />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          </div>

          {/* Aggregated Totals Strip */}
          <div className="card-modern p-3 mb-4 bg-white border-primary-subtle no-print">
            <div className="row g-3 text-center text-sm-start">
              <div className="col-6 col-md-2 border-end">
                <span className="small text-secondary d-block">Filtered Records</span>
                <span className="fs-6 fw-bold tabular-nums text-slate-800">
                  {filteredDailyReports.length} trips
                </span>
              </div>

              <div className="col-6 col-md-2 border-end">
                <span className="small text-secondary d-block">Gross Income</span>
                <span className="fs-6 fw-bold tabular-nums text-primary font-monospace">
                  {formatKSh(dailySummary.totalGross)}
                </span>
              </div>

              <div className="col-6 col-md-2 border-end">
                <span className="small text-secondary d-block">Fuel Expenses</span>
                <span className="fs-6 fw-bold tabular-nums text-warning-emphasis font-monospace">
                  {formatKSh(dailySummary.totalFuelExpense)}
                </span>
              </div>

              <div className="col-6 col-md-2 border-end">
                <span className="small text-secondary d-block">Other Expenses</span>
                <span className="fs-6 fw-bold tabular-nums text-secondary font-monospace">
                  {formatKSh(dailySummary.totalOtherExpense)}
                </span>
              </div>

              <div className="col-6 col-md-2 border-end">
                <span className="small text-secondary d-block">Total Expenses</span>
                <span className="fs-6 fw-bold tabular-nums text-danger font-monospace">
                  {formatKSh(dailySummary.totalExpenses)}
                </span>
              </div>

              <div className="col-6 col-md-2">
                <span className="small text-secondary d-block">Net Income</span>
                <span className={`fs-6 fw-bold tabular-nums font-monospace ${dailySummary.totalNetIncome >= 0 ? 'text-success' : 'text-danger'}`}>
                  {formatKSh(dailySummary.totalNetIncome)}
                </span>
              </div>
            </div>
          </div>

          {/* Daily Table Card */}
          {sortedDailyReports.length > 0 ? (
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
                    {paginatedDailyReports.map((report) => {
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
                            <div className="small fw-semibold text-slate-900 text-truncate" style={{ maxWidth: '240px' }} title={report.routeOffloadDetails}>
                              {report.routeOffloadDetails}
                            </div>
                            {report.remarks && (
                              <div className="small text-muted text-truncate" style={{ maxWidth: '240px', fontSize: '0.72rem' }}>
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
                                title="View Details"
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

              {/* Pagination */}
              <div className="p-3 border-top d-flex flex-column flex-sm-row align-items-center justify-content-between gap-2">
                <span className="small text-secondary">
                  Showing Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({sortedDailyReports.length} total entries)
                </span>

                {totalPages > 1 && (
                  <nav aria-label="Pagination">
                    <ul className="pagination pagination-sm mb-0">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>
                          Previous
                        </button>
                      </li>
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                          <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                            {i + 1}
                          </button>
                        </li>
                      ))}
                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}>
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
              title="No daily report entries found"
              description="No entries matched your search criteria or date selection."
              actionText="Log New Daily Report"
              onAction={() => setIsAddModalOpen(true)}
            />
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MONTHLY EXECUTIVE PERFORMANCE */}
      {/* ========================================================================= */}
      {activeTab === 'monthly' && (
        <>
          {/* Monthly Filters */}
          <div className="card-modern p-3 mb-4 bg-white no-print">
            <div className="row g-2 align-items-center">
              <div className="col-12 col-md-3">
                <label className="form-label small fw-semibold text-secondary mb-1">
                  Billing Month Period
                </label>
                <select
                  className="form-select form-select-sm"
                  value={selectedMonth}
                  onChange={(e) => {
                    setSelectedMonth(e.target.value);
                    setMonthlyCustomStart('');
                    setMonthlyCustomEnd('');
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
                  Fleet Vehicle Focus
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
                  Custom Start
                </label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={monthlyCustomStart}
                  onChange={(e) => setMonthlyCustomStart(e.target.value)}
                />
              </div>

              <div className="col-6 col-md-2">
                <label className="form-label small fw-semibold text-secondary mb-1">
                  Custom End
                </label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={monthlyCustomEnd}
                  onChange={(e) => setMonthlyCustomEnd(e.target.value)}
                />
              </div>

              <div className="col-12 col-md-2 d-flex align-items-end pt-md-4">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-1"
                  onClick={() => {
                    setSelectedMonth('2025-10');
                    setSelectedVehicle('ALL');
                    setMonthlyCustomStart('');
                    setMonthlyCustomEnd('');
                    addToast('Reset to October 2025', 'info');
                  }}
                >
                  <RotateCcw size={14} />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          </div>

          {/* Official Monthly Statement Header */}
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
                  {monthlyActivePeriodTitle}
                </div>
                <div className="small text-secondary mt-1">
                  Scope: {selectedVehicle === 'ALL' ? 'Complete Fleet Consolidation' : `Vehicle Unit ${selectedVehicle}`}
                </div>
              </div>
            </div>

            {/* 6 Monthly Summary Metric Cards */}
            <div className="row g-3">
              <div className="col-12 col-sm-6 col-md-4 col-xl-2">
                <div className="p-3 bg-light rounded-3 border">
                  <span className="small text-secondary d-block fw-semibold">Gross Income</span>
                  <span className="fs-5 fw-bold font-monospace text-primary">
                    {formatKSh(monthlySummary.totalGross)}
                  </span>
                  <span className="small text-muted d-block mt-1" style={{ fontSize: '0.72rem' }}>
                    {monthlySummary.recordCount} freight trips
                  </span>
                </div>
              </div>

              <div className="col-12 col-sm-6 col-md-4 col-xl-2">
                <div className="p-3 bg-light rounded-3 border">
                  <span className="small text-secondary d-block fw-semibold">Fuel Expense</span>
                  <span className="fs-5 fw-bold font-monospace text-warning-emphasis">
                    {formatKSh(monthlySummary.totalFuelExpense)}
                  </span>
                  <span className="small text-muted d-block mt-1" style={{ fontSize: '0.72rem' }}>
                    {formatLitres(monthlySummary.totalFuelLitres)} consumed
                  </span>
                </div>
              </div>

              <div className="col-12 col-sm-6 col-md-4 col-xl-2">
                <div className="p-3 bg-light rounded-3 border">
                  <span className="small text-secondary d-block fw-semibold">Other Expenses</span>
                  <span className="fs-5 fw-bold font-monospace text-secondary">
                    {formatKSh(monthlySummary.totalOtherExpense)}
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
                    {formatKSh(monthlySummary.totalExpenses)}
                  </span>
                  <span className="small text-muted d-block mt-1" style={{ fontSize: '0.72rem' }}>
                    Fuel + overheads
                  </span>
                </div>
              </div>

              <div className="col-12 col-sm-6 col-md-4 col-xl-2">
                <div className={`p-3 rounded-3 border ${monthlySummary.totalNetIncome >= 0 ? 'bg-success-subtle border-success-subtle' : 'bg-danger-subtle border-danger-subtle'}`}>
                  <span className="small text-secondary d-block fw-semibold">Net Income</span>
                  <span className={`fs-5 fw-bold font-monospace ${monthlySummary.totalNetIncome >= 0 ? 'text-success' : 'text-danger'}`}>
                    {formatKSh(monthlySummary.totalNetIncome)}
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
                    {monthlySummary.workingDaysCount} Days
                  </span>
                  <span className="small text-muted d-block mt-1" style={{ fontSize: '0.72rem' }}>
                    Active transit shifts
                  </span>
                </div>
              </div>
            </div>

            {/* Averages Row */}
            <div className="row g-3 mt-1 pt-3 border-top">
              <div className="col-12 col-md-4">
                <div className="d-flex align-items-center justify-content-between p-2 px-3 bg-light rounded-2">
                  <span className="small text-secondary">Avg Daily Gross:</span>
                  <span className="small fw-bold font-monospace text-primary">
                    {formatKSh(monthlySummary.averageDailyIncome)} / day
                  </span>
                </div>
              </div>

              <div className="col-12 col-md-4">
                <div className="d-flex align-items-center justify-content-between p-2 px-3 bg-light rounded-2">
                  <span className="small text-secondary">Avg Daily Net Profit:</span>
                  <span className={`small fw-bold font-monospace ${monthlySummary.averageDailyNetIncome >= 0 ? 'text-success' : 'text-danger'}`}>
                    {formatKSh(monthlySummary.averageDailyNetIncome)} / day
                  </span>
                </div>
              </div>

              <div className="col-12 col-md-4">
                <div className="d-flex align-items-center justify-content-between p-2 px-3 bg-light rounded-2">
                  <span className="small text-secondary">Avg Offload Load:</span>
                  <span className="small fw-bold font-monospace text-slate-800">
                    {formatQuantity(monthlySummary.averageOffloadQty, 'MT')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Ledger Table */}
          <div className="card-modern bg-white overflow-hidden mb-4">
            <div className="p-3 p-md-4 border-bottom d-flex align-items-center justify-content-between">
              <div>
                <h6 className="fw-bold mb-0 text-slate-800">Monthly Offloading Ledger Breakdown</h6>
                <span className="small text-secondary">
                  Chronological offloading records for {monthlyActivePeriodTitle}
                </span>
              </div>
              <span className="badge bg-light text-secondary border">
                {filteredMonthlyRecords.length} Entries
              </span>
            </div>

            {filteredMonthlyRecords.length > 0 ? (
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
                    {filteredMonthlyRecords.map((record) => {
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
                      <td className="num-col font-monospace small">-</td>
                      <td className="num-col font-monospace small">-</td>
                      <td className="num-col font-monospace text-primary small">
                        {formatKSh(monthlySummary.totalGross)}
                      </td>
                      <td className="num-col font-monospace small">
                        {formatLitres(monthlySummary.totalFuelLitres)}
                      </td>
                      <td className="num-col font-monospace text-warning-emphasis small">
                        {formatKSh(monthlySummary.totalFuelExpense)}
                      </td>
                      <td className="num-col font-monospace text-secondary small">
                        {formatKSh(monthlySummary.totalOtherExpense)}
                      </td>
                      <td className="num-col font-monospace text-danger small">
                        {formatKSh(monthlySummary.totalExpenses)}
                      </td>
                      <td className={`num-col font-monospace small ${monthlySummary.totalNetIncome >= 0 ? 'text-success' : 'text-danger'}`}>
                        {formatKSh(monthlySummary.totalNetIncome)}
                      </td>
                      <td className="num-col font-monospace text-muted small">-</td>
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

          {/* Print Signature Block */}
          <div className="card-modern p-4 bg-white d-none print-only">
            <div className="row g-4 pt-4">
              <div className="col-4">
                <div className="border-top pt-2">
                  <span className="small text-secondary d-block">Prepared By:</span>
                  <span className="fw-semibold small d-block">Reporting Officer</span>
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
        </>
      )}

      {/* Shared Modals */}
      <DailyReportModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={async (data) => {
          await addReport(data);
          setIsAddModalOpen(false);
          addToast('Daily operational record added', 'success');
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
          addToast('Report record updated', 'success');
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

      <ConfirmModal
        isOpen={!!reportToDelete}
        title="Delete Daily Report Record"
        message={`Are you sure you want to delete the report for ${reportToDelete?.vehicleRegistration} on ${reportToDelete?.reportDate}?`}
        confirmText="Delete Record"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setReportToDelete(null)}
      />
    </div>
  );
}
