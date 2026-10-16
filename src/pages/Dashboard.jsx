import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Download,
  RotateCcw,
  Eye,
  Edit,
  ArrowRight
} from 'lucide-react';
import { Bar, Line } from 'react-chartjs-2';
import '../utils/chartConfig';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { calculateReportSummary } from '../utils/calculations';
import { formatKSh, formatLitres, formatQuantity } from '../utils/currency';
import { formatDate } from '../utils/dateFormat';
import { exportToCSV } from '../utils/exportUtils';
import StatCard from '../components/common/StatCard';
import EmptyState from '../components/common/EmptyState';
import DailyReportModal from '../components/reports/DailyReportModal';
import ReportDetailModal from '../components/reports/ReportDetailModal';

export default function Dashboard() {
  const { reports, vehicles, addReport, updateReport } = useData();
  const { addToast } = useToast();

  // Filters state
  const [selectedVehicle, setSelectedVehicle] = useState('ALL');
  const [selectedMonth, setSelectedMonth] = useState('2025-10'); // Default to October 2025 sample data
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [viewingReport, setViewingReport] = useState(null);

  // Filtered reports
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
      if (!startDate && !endDate && selectedMonth && selectedMonth !== 'ALL') {
        if (!r.reportDate || !r.reportDate.startsWith(selectedMonth)) {
          return false;
        }
      }
      return true;
    });
  }, [reports, selectedVehicle, selectedMonth, startDate, endDate]);

  // Aggregate financial metrics
  const summary = useMemo(() => {
    return calculateReportSummary(filteredReports);
  }, [filteredReports]);

  // Sort chronological for charts
  const chronologicalReports = useMemo(() => {
    return [...filteredReports].sort((a, b) => new Date(a.reportDate) - new Date(b.reportDate));
  }, [filteredReports]);

  // Chart 1: Income vs. Expenses Bar Chart
  const incomeVsExpenseChartData = useMemo(() => {
    const labels = chronologicalReports.map((r) => formatDate(r.reportDate));
    return {
      labels,
      datasets: [
        {
          label: 'Income (KSh)',
          data: chronologicalReports.map((r) => r.grossAmount),
          backgroundColor: 'rgba(40, 99, 77, 0.84)',
          borderRadius: 4
        },
        {
          label: 'Costs (KSh)',
          data: chronologicalReports.map((r) => r.totalExpenses),
          backgroundColor: 'rgba(220, 38, 38, 0.75)',
          borderRadius: 4
        }
      ]
    };
  }, [chronologicalReports]);

  // Chart 2: Daily Net Income Trend Line Chart
  const netIncomeTrendChartData = useMemo(() => {
    const labels = chronologicalReports.map((r) => formatDate(r.reportDate));
    return {
      labels,
      datasets: [
        {
          label: 'Net Operating Income (KSh)',
          data: chronologicalReports.map((r) => r.netIncome),
          borderColor: '#16a34a',
          backgroundColor: 'rgba(22, 163, 74, 0.12)',
          fill: true,
          tension: 0.35,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    };
  }, [chronologicalReports]);

  const handleResetFilters = () => {
    setSelectedVehicle('ALL');
    setSelectedMonth('ALL');
    setStartDate('');
    setEndDate('');
    addToast('Filters reset to show all records', 'info');
  };

  const handleExportFiltered = () => {
    const headers = [
      'Report Date',
      'Vehicle Reg',
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

    exportToCSV(`BASAH_FLEET_REPORT_${selectedVehicle}_${new Date().toISOString().slice(0, 10)}`, headers, rows);
    addToast(`Exported ${filteredReports.length} records to CSV`, 'success');
  };

  return (
    <div className="container-fluid p-0">
      {/* Page Title & Top Actions */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="h4 fw-semibold mb-1">Fleet overview</h2>
          <p className="text-secondary small mb-0">A clear look at your trips, income and costs.</p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
            onClick={handleExportFiltered}
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
            <span>Add trip</span>
          </button>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="card-modern p-3 mb-4 bg-white">
        <div className="row g-2 align-items-center">
          {/* Vehicle Selector */}
          <div className="col-12 col-md-3">
            <label className="form-label small fw-semibold text-secondary mb-1">
              Vehicle
            </label>
            <select
              className="form-select form-select-sm"
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
            >
              <option value="ALL">All Fleet Vehicles ({vehicles.length})</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.registrationNumber}>
                  {v.registrationNumber} - {v.makeModel}
                </option>
              ))}
            </select>
          </div>

          {/* Month Selector */}
          <div className="col-6 col-md-2">
            <label className="form-label small fw-semibold text-secondary mb-1">
              Month
            </label>
            <select
              className="form-select form-select-sm"
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setStartDate('');
                setEndDate('');
              }}
            >
              <option value="ALL">All Available</option>
              <option value="2025-10">October 2025</option>
              <option value="2025-09">September 2025</option>
              <option value="2025-11">November 2025</option>
            </select>
          </div>

          {/* Start Date */}
          <div className="col-6 col-md-2">
            <label className="form-label small fw-semibold text-secondary mb-1">
              From
            </label>
            <input
              type="date"
              className="form-control form-control-sm"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setSelectedMonth('ALL');
              }}
            />
          </div>

          {/* End Date */}
          <div className="col-6 col-md-2">
            <label className="form-label small fw-semibold text-secondary mb-1">
              To
            </label>
            <input
              type="date"
              className="form-control form-control-sm"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setSelectedMonth('ALL');
              }}
            />
          </div>

          {/* Reset Action */}
          <div className="col-6 col-md-3 d-flex align-items-end pt-md-4">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-1"
              onClick={handleResetFilters}
            >
              <RotateCcw size={14} />
              <span>Clear filters</span>
            </button>
          </div>
        </div>

        {/* Filter State Note */}
        <div className="mt-2 pt-2 border-top d-flex flex-wrap align-items-center justify-content-between small text-secondary">
          <div>
            <strong>{filteredReports.length}</strong> trips ·{' '}
            <strong>{summary.workingDaysCount}</strong> working days
          </div>
        </div>
      </div>

      {/* Fleet totals */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Income"
            value={formatKSh(summary.totalGross)}
            subtitle={`${summary.recordCount} trips recorded`}
            variant="primary"
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Total costs"
            value={formatKSh(summary.totalExpenses)}
            subtitle="Fuel and other expenses"
            variant="danger"
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Net income"
            value={formatKSh(summary.totalNetIncome)}
            subtitle="Income after costs"
            variant={summary.totalNetIncome >= 0 ? 'success' : 'danger'}
            isNegative={summary.totalNetIncome < 0}
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Fuel used"
            value={formatLitres(summary.totalFuelLitres)}
            subtitle={`Average ${(summary.totalFuelLitres / (summary.recordCount || 1)).toFixed(1)} L per trip`}
            variant="default"
          />
        </div>
      </div>

      {/* Trends */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-lg-7">
          <div className="card-modern p-3 p-md-4 h-100 bg-white">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h3 className="h6 fw-semibold mb-1">Income and costs</h3>
                <span className="small text-secondary">By trip · KSh</span>
              </div>
            </div>
            {filteredReports.length > 0 ? (
              <div className="chart-frame">
                <Bar
                  data={incomeVsExpenseChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'top', labels: { boxWidth: 12 } }
                    },
                    scales: {
                      y: {
                        ticks: {
                          callback: (val) => `KSh ${(val / 1000).toFixed(0)}k`
                        }
                      }
                    }
                  }}
                />
              </div>
            ) : (
              <div className="py-5 text-center text-muted small">No data to plot for selected filters.</div>
            )}
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="card-modern p-3 p-md-4 bg-white">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h3 className="h6 fw-semibold mb-1">Net income</h3>
                <span className="small text-secondary">Daily after costs · KSh</span>
              </div>
            </div>
            {filteredReports.length > 0 ? (
              <div className="chart-frame chart-frame-short">
                <Line
                  data={netIncomeTrendChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false }
                    },
                    scales: {
                      y: {
                        ticks: {
                          callback: (val) => `KSh ${(val / 1000).toFixed(0)}k`
                        }
                      }
                    }
                  }}
                />
              </div>
            ) : (
              <div className="py-4 text-center text-muted small">No timeline data available.</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent trips */}
      <div className="card-modern bg-white overflow-hidden mb-4">
        <div className="p-3 p-md-4 border-bottom d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2">
          <div>
            <h3 className="h6 fw-semibold mb-1">Recent trips</h3>
            <span className="small text-secondary">
              Latest entries across your fleet
            </span>
          </div>
          <Link
            to="/reports?tab=daily"
            className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
          >
            <span>All reports</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {filteredReports.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-modern align-middle mb-0">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Vehicle</th>
                  <th>Route / Offload</th>
                  <th className="num-col">Offload Qty</th>
                  <th className="num-col">Gross (KSh)</th>
                  <th className="num-col">Fuel (L)</th>
                  <th className="num-col">Expenses (KSh)</th>
                  <th className="num-col">Net Income (KSh)</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.slice(0, 7).map((report) => {
                  const isPositive = report.netIncome >= 0;
                  return (
                    <tr key={report.id}>
                      <td className="small text-nowrap fw-medium">
                        {formatDate(report.reportDate)}
                      </td>
                      <td>
                        <span className="vehicle-plate-badge text-dark">
                          {report.vehicleRegistration}
                        </span>
                      </td>
                      <td className="small text-truncate" style={{ maxWidth: '240px' }} title={report.routeOffloadDetails}>
                        {report.routeOffloadDetails}
                      </td>
                      <td className="num-col small">
                        {formatQuantity(report.offloadQuantity, 'MT')}
                      </td>
                      <td className="num-col small fw-semibold text-primary font-monospace">
                        {formatKSh(report.grossAmount)}
                      </td>
                      <td className="num-col small font-monospace">
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
                            onClick={() => setViewingReport(report)}
                            title="View Full Breakdown"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-link text-primary p-1"
                            onClick={() => setEditingReport(report)}
                            title="Edit Report"
                          >
                            <Edit size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No trips match these filters"
            description="Try another vehicle or date range."
            actionText="Clear filters"
            onAction={handleResetFilters}
          />
        )}
      </div>

      {/* Modals */}
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
    </div>
  );
}
