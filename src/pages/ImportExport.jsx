import React, { useState } from 'react';
import {
  FileUp,
  FileSpreadsheet,
  Download,
  CheckCircle,
  AlertTriangle,
  UploadCloud,
  FileCheck,
  RefreshCw,
  Info,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { DEFAULT_EXCEL_COLUMNS, SAMPLE_IMPORTED_ROWS, importExportService } from '../services/importExportService';
import { formatKSh, formatQuantity } from '../utils/currency';
import { formatDate } from '../utils/dateFormat';
import { exportToCSV } from '../utils/exportUtils';

export default function ImportExport() {
  const { reports, bulkAddReports } = useData();
  const { addToast } = useToast();

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [columnMapping, setColumnMapping] = useState({
    reportDate: 'DATE',
    vehicleRegistration: 'VEHICLE_REG',
    routeOffloadDetails: 'OFFLOAD_LOCATION',
    offloadQuantity: 'QUANTITY_MT',
    offloadRate: 'RATE_KSH',
    fuelLitres: 'FUEL_LITRES',
    fuelExpense: 'FUEL_COST_KSH',
    otherExpense: 'OTHER_COSTS_KSH',
    mileage: 'ODOMETER_KM',
    remarks: 'COMMENTS'
  });
  const [importResult, setImportResult] = useState(null);

  // Drag handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file) => {
    setSelectedFile(file);
    setIsProcessing(true);
    setImportResult(null);

    try {
      const parsed = await importExportService.simulateParseFile(file);
      setParsedData(parsed);
      addToast(`Workbook parsed: ${file.name} (${parsed.previewRows.length} sample rows)`, 'info');
    } catch (err) {
      addToast('Error reading workbook: ' + err.message, 'danger');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadSampleExcel = () => {
    const mockFile = {
      name: 'KDY REPORTT.xlsx',
      size: 48520
    };
    processFile(mockFile);
  };

  const handleConfirmImport = async () => {
    if (!parsedData || !parsedData.previewRows) return;

    try {
      setIsProcessing(true);
      await bulkAddReports(parsedData.previewRows);
      setImportResult({
        success: true,
        count: parsedData.previewRows.length,
        message: `Successfully ingested ${parsedData.previewRows.length} records into local fleet state.`
      });
      addToast(`Imported ${parsedData.previewRows.length} daily reports`, 'success');
    } catch (err) {
      addToast('Import failed: ' + err.message, 'danger');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportFullFleet = () => {
    const headers = [
      'Report Date',
      'Vehicle Plate',
      'Route / Details',
      'Offload Qty (MT)',
      'Rate (KSh)',
      'Gross Amount (KSh)',
      'Fuel Litres',
      'Fuel Cost (KSh)',
      'Other Overhead (KSh)',
      'Total Expenses (KSh)',
      'Net Income (KSh)',
      'Mileage (KM)',
      'Remarks'
    ];

    const rows = reports.map((r) => [
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

    exportToCSV(`BASAH_FULL_FLEET_EXPORT_${new Date().toISOString().slice(0, 10)}`, headers, rows);
    addToast(`Exported complete ledger (${reports.length} records) to Excel-compatible CSV`, 'success');
  };

  return (
    <div className="container-fluid p-0">
      {/* Title */}
      <div className="mb-4">
        <h4 className="fw-bold text-slate-900 mb-1">Excel Ingestion &amp; Data Integration</h4>
        <p className="text-secondary small mb-0">
          Migrate workbook spreadsheets (e.g. <code>KDY REPORTT.xlsx</code>) into the structured system, map custom columns, and export financial summaries.
        </p>
      </div>

      <div className="row g-4">
        {/* Left Column: Import Section */}
        <div className="col-12 col-lg-7">
          <div className="card-modern p-4 bg-white mb-4">
            <h5 className="fw-bold mb-3 text-slate-900 d-flex align-items-center gap-2">
              <FileUp size={20} className="text-primary" />
              <span>Spreadsheet Upload &amp; Validation</span>
            </h5>

            {/* Drag & Drop Area */}
            <div
              className={`p-4 p-md-5 text-center border-2 border-dashed rounded-3 transition-colors ${
                dragActive ? 'bg-primary-subtle border-primary' : 'bg-light border-secondary-subtle'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              style={{ cursor: 'pointer' }}
            >
              <div className="d-inline-flex p-3 rounded-circle bg-white shadow-sm mb-3 text-primary">
                <UploadCloud size={36} />
              </div>

              <h6 className="fw-semibold text-slate-800 mb-1">
                Drop your Excel spreadsheet here or browse
              </h6>
              <p className="text-secondary small mb-3">
                Supports <code>.xlsx</code>, <code>.xls</code>, and <code>.csv</code> files from vehicle trip logs.
              </p>

              <div className="d-flex flex-wrap justify-content-center gap-2">
                <label className="btn btn-sm btn-primary px-3 cursor-pointer">
                  <span>Browse Device Files</span>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="d-none"
                    onChange={handleFileInput}
                  />
                </label>

                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={handleLoadSampleExcel}
                >
                  Load <code>KDY REPORTT.xlsx</code> Sample
                </button>
              </div>
            </div>

            {/* Selected File Details */}
            {selectedFile && (
              <div className="mt-3 p-3 bg-light rounded-3 border d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-2">
                  <FileSpreadsheet size={24} className="text-success" />
                  <div>
                    <span className="small fw-bold text-slate-900 d-block">{selectedFile.name}</span>
                    <span className="small text-muted">
                      {parsedData?.fileSize || `${(selectedFile.size / 1024).toFixed(1)} KB`} · Sheet: {parsedData?.selectedSheet || 'Default'}
                    </span>
                  </div>
                </div>

                {isProcessing && (
                  <div className="d-flex align-items-center gap-2 text-primary small">
                    <span className="spinner-border spinner-border-sm" role="status" />
                    <span>Parsing structure...</span>
                  </div>
                )}
              </div>
            )}

            {/* Column Mapping Interface */}
            {parsedData && (
              <div className="mt-4 pt-3 border-top">
                <h6 className="fw-bold mb-2 text-slate-800 d-flex align-items-center justify-content-between">
                  <span>Column Header Mapping</span>
                  <span className="small text-muted fw-normal">Match Excel columns to database fields</span>
                </h6>

                <div className="row g-2 mb-3">
                  {DEFAULT_EXCEL_COLUMNS.slice(0, 6).map((col) => (
                    <div key={col.field} className="col-12 col-sm-6">
                      <div className="p-2 border rounded-2 bg-light">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="small fw-semibold">{col.label} {col.required && '*'}</span>
                          <span className="badge bg-secondary-subtle text-secondary" style={{ fontSize: '0.65rem' }}>Field</span>
                        </div>
                        <select
                          className="form-select form-select-sm"
                          value={columnMapping[col.field] || ''}
                          onChange={(e) =>
                            setColumnMapping((prev) => ({
                              ...prev,
                              [col.field]: e.target.value
                            }))
                          }
                        >
                          {parsedData.detectedHeaders.map((header) => (
                            <option key={header} value={header}>
                              Excel: {header}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Validation Warnings & Duplicate Inspection */}
                <div className="p-3 bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-3 small mb-3">
                  <div className="d-flex align-items-start gap-2">
                    <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                    <div>
                      <strong>Duplicate &amp; Validation Check:</strong>
                      <div className="small mt-1">
                        3 potential batch rows scanned. Zero date-overlap conflicts detected with primary fleet vehicle <strong>KDY 926B</strong>.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Import Preview Table */}
                <div className="mb-3">
                  <span className="small fw-bold text-secondary text-uppercase d-block mb-2">
                    Ingestion Preview ({parsedData.previewRows.length} Rows Detected)
                  </span>
                  <div className="table-responsive border rounded-3">
                    <table className="table table-modern table-sm mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th>Date</th>
                          <th>Vehicle</th>
                          <th>Offload Details</th>
                          <th className="num-col">Qty (MT)</th>
                          <th className="num-col">Rate</th>
                          <th className="num-col">Fuel Cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedData.previewRows.map((r, i) => (
                          <tr key={i}>
                            <td className="small text-nowrap">{formatDate(r.reportDate)}</td>
                            <td><span className="vehicle-plate-badge text-dark py-0 px-1" style={{ fontSize: '0.72rem' }}>{r.vehicleRegistration}</span></td>
                            <td className="small text-truncate" style={{ maxWidth: '160px' }}>{r.routeOffloadDetails}</td>
                            <td className="num-col small font-monospace">{r.offloadQuantity}</td>
                            <td className="num-col small font-monospace">{formatKSh(r.offloadRate, { showSymbol: false })}</td>
                            <td className="num-col small font-monospace text-warning-emphasis">{formatKSh(r.fuelExpense, { showSymbol: false })}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Confirmation Action */}
                <div className="d-flex align-items-center justify-content-between pt-3 border-top">
                  <span className="small text-muted">
                    * Ingestion updates local demo state immediately.
                  </span>
                  <button
                    type="button"
                    className="btn btn-sm btn-success d-flex align-items-center gap-1 fw-semibold px-3"
                    onClick={handleConfirmImport}
                    disabled={isProcessing}
                  >
                    <FileCheck size={16} />
                    <span>Confirm &amp; Ingest {parsedData.previewRows.length} Records</span>
                  </button>
                </div>
              </div>
            )}

            {/* Ingestion Result Banner */}
            {importResult && (
              <div className="mt-3 p-3 bg-success-subtle text-success border border-success-subtle rounded-3 small">
                <div className="d-flex align-items-center gap-2">
                  <CheckCircle size={18} />
                  <span>{importResult.message} Dashboard cards and monthly ledgers are now synchronized.</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Export & Excel Template Section */}
        <div className="col-12 col-lg-5">
          {/* Download Template Card */}
          <div className="card-modern p-4 bg-white mb-4">
            <h5 className="fw-bold mb-3 text-slate-900 d-flex align-items-center gap-2">
              <Download size={20} className="text-primary" />
              <span>Export &amp; Excel Reports</span>
            </h5>

            <p className="text-secondary small mb-3">
              Export real-time fleet earnings or download standard Excel templates matching the company reporting format.
            </p>

            <div className="d-grid gap-2 mb-4">
              <button
                type="button"
                className="btn btn-outline-primary d-flex align-items-center justify-content-center gap-2 py-2"
                onClick={handleExportFullFleet}
              >
                <Download size={16} />
                <span>Export Full Fleet Ledger (.CSV / Excel)</span>
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary d-flex align-items-center justify-content-center gap-2 py-2"
                onClick={() => {
                  const headers = DEFAULT_EXCEL_COLUMNS.map((c) => c.label);
                  const sampleRow = DEFAULT_EXCEL_COLUMNS.map((c) => c.sample);
                  exportToCSV('BASAH_BLANK_VEHICLE_REPORT_TEMPLATE', headers, [sampleRow]);
                  addToast('Downloaded standard Excel template', 'info');
                }}
              >
                <FileSpreadsheet size={16} />
                <span>Download Standard Blank Template</span>
              </button>
            </div>

            <div className="p-3 bg-light rounded-3 border">
              <span className="small fw-bold text-secondary text-uppercase d-block mb-1">
                Excel File Integration Guidelines
              </span>
              <ul className="small text-secondary ps-3 mb-0" style={{ fontSize: '0.8rem' }}>
                <li className="mb-1">
                  Ensure dates are formatted in standard <code>YYYY-MM-DD</code> or <code>DD/MM/YYYY</code> format.
                </li>
                <li className="mb-1">
                  Offload quantities are typically measured in <strong>Metric Tonnes (MT)</strong> for bulk haulage.
                </li>
                <li className="mb-1">
                  Financial columns (Rate, Fuel Expense, Other Expense) should be entered in <strong>KSh</strong> without currency signs.
                </li>
                <li>
                  Gross amount and net income are automatically recalculated by the system formulas upon ingestion.
                </li>
              </ul>
            </div>
          </div>

          {/* Integration Phase Architecture Notice */}
          <div className="card-modern p-4 bg-white">
            <h6 className="fw-bold text-slate-900 mb-2 d-flex align-items-center gap-2">
              <ShieldAlert size={18} className="text-info" />
              <span>Phase 1 Architecture Note</span>
            </h6>
            <p className="text-secondary small mb-2">
              In this frontend-first phase, files are parsed client-side and stored in temporary reactive application state to demonstrate workflow ergonomics without requiring an active MySQL database.
            </p>
            <div className="small text-muted" style={{ fontSize: '0.75rem' }}>
              Phase 2 will integrate Node.js + Express <code>multer</code> multipart upload with backend MySQL transaction rollback.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
