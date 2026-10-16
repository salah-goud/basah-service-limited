/**
 * Import and Export Simulation Service
 * Handles Excel/CSV preview, column mapping, validation, and demo ingestion.
 */

export const DEFAULT_EXCEL_COLUMNS = [
  { field: 'reportDate', label: 'Report Date', sample: '2025-10-02', required: true },
  { field: 'vehicleRegistration', label: 'Vehicle Reg (e.g. KDY 926B)', sample: 'KDY 926B', required: true },
  { field: 'routeOffloadDetails', label: 'Route / Offload Details', sample: 'Mombasa Port - Nairobi ICD', required: true },
  { field: 'offloadQuantity', label: 'Offload Quantity (MT)', sample: '30.0', required: true },
  { field: 'offloadRate', label: 'Offload Rate (KSh/MT)', sample: '4200.0', required: true },
  { field: 'fuelLitres', label: 'Fuel (Litres)', sample: '240.0', required: false },
  { field: 'fuelExpense', label: 'Fuel Expense (KSh)', sample: '43200.0', required: true },
  { field: 'otherExpense', label: 'Other Expense (KSh)', sample: '8500.0', required: false },
  { field: 'mileage', label: 'Mileage / Odometer (KM)', sample: '485', required: false },
  { field: 'remarks', label: 'Remarks / Offloading Notes', sample: 'Prompt discharge', required: false }
];

export const SAMPLE_IMPORTED_ROWS = [
  {
    reportDate: '2025-10-26',
    vehicleRegistration: 'KDY 926B',
    routeOffloadDetails: 'Mombasa Berth 16 - Mlolongo Inland Depot',
    offloadQuantity: 31.0,
    offloadRate: 4150.0,
    fuelLitres: 245.0,
    fuelExpense: 44100.0,
    otherExpense: 6500.0,
    mileage: 490,
    remarks: 'Clear highway transit, weighbridge cleared'
  },
  {
    reportDate: '2025-10-28',
    vehicleRegistration: 'KDY 926B',
    routeOffloadDetails: 'Athi River Steel - Naivasha Distribution Yard',
    offloadQuantity: 28.0,
    offloadRate: 3600.0,
    fuelLitres: 165.0,
    fuelExpense: 29700.0,
    otherExpense: 4200.0,
    mileage: 180,
    remarks: 'Delivered reinforcement bars'
  },
  {
    reportDate: '2025-10-30',
    vehicleRegistration: 'KBZ 481M',
    routeOffloadDetails: 'Nairobi ICD - Nakuru Wholesale Depot',
    offloadQuantity: 29.5,
    offloadRate: 3450.0,
    fuelLitres: 160.0,
    fuelExpense: 28800.0,
    otherExpense: 5000.0,
    mileage: 165,
    remarks: 'Turnaround complete in 4 hours'
  }
];

export const importExportService = {
  /**
   * Generates sample simulated rows based on uploaded file metadata.
   */
  async simulateParseFile(file) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          fileName: file.name,
          fileSize: (file.size / 1024).toFixed(1) + ' KB',
          detectedSheets: ['Daily Offloading Log', 'Monthly Fuel Summary'],
          selectedSheet: 'Daily Offloading Log',
          detectedHeaders: [
            'DATE',
            'VEHICLE_REG',
            'OFFLOAD_LOCATION',
            'QUANTITY_MT',
            'RATE_KSH',
            'FUEL_LITRES',
            'FUEL_COST_KSH',
            'OTHER_COSTS_KSH',
            'ODOMETER_KM',
            'COMMENTS'
          ],
          previewRows: SAMPLE_IMPORTED_ROWS,
          totalRowsFound: SAMPLE_IMPORTED_ROWS.length
        });
      }, 600);
    });
  }
};
