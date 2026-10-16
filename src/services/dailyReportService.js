/**
 * Daily Report Service
 * Manages daily vehicle trip/offloading records and enforces financial formulas.
 */
import apiClient from './apiClient';
import { INITIAL_DAILY_REPORTS } from '../data/mockData';
import { calculateGrossAmount, calculateTotalExpenses, calculateNetIncome, calculateReportSummary } from '../utils/calculations';

const STORAGE_KEY = 'basah_daily_reports_data';

function getStoredReports() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DAILY_REPORTS));
      return INITIAL_DAILY_REPORTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DAILY_REPORTS;
  }
}

function saveReports(reports) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

export const dailyReportService = {
  async getAll(filters = {}) {
    let reports = [...getStoredReports()];

    if (filters.vehicleRegistration && filters.vehicleRegistration !== 'ALL') {
      reports = reports.filter((r) => r.vehicleRegistration === filters.vehicleRegistration);
    }

    if (filters.startDate) {
      reports = reports.filter((r) => r.reportDate >= filters.startDate);
    }

    if (filters.endDate) {
      reports = reports.filter((r) => r.reportDate <= filters.endDate);
    }

    if (filters.month) {
      // YYYY-MM
      reports = reports.filter((r) => r.reportDate && r.reportDate.startsWith(filters.month));
    }

    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      reports = reports.filter((r) =>
        (r.routeOffloadDetails && r.routeOffloadDetails.toLowerCase().includes(q)) ||
        (r.vehicleRegistration && r.vehicleRegistration.toLowerCase().includes(q)) ||
        (r.remarks && r.remarks.toLowerCase().includes(q))
      );
    }

    // Default order by reportDate descending
    reports.sort((a, b) => new Date(b.reportDate) - new Date(a.reportDate));

    return Promise.resolve(reports);
  },

  async getById(id) {
    const reports = getStoredReports();
    const found = reports.find((r) => r.id === id);
    if (!found) throw new Error(`Daily report ${id} not found`);
    return Promise.resolve({ ...found });
  },

  async create(reportData) {
    const reports = getStoredReports();

    const offloadQuantity = parseFloat(reportData.offloadQuantity) || 0;
    const offloadRate = parseFloat(reportData.offloadRate) || 0;
    const fuelLitres = parseFloat(reportData.fuelLitres) || 0;
    const fuelExpense = parseFloat(reportData.fuelExpense) || 0;
    const otherExpense = parseFloat(reportData.otherExpense) || 0;

    const grossAmount = calculateGrossAmount(offloadQuantity, offloadRate);
    const totalExpenses = calculateTotalExpenses(fuelExpense, otherExpense);
    const netIncome = calculateNetIncome(grossAmount, totalExpenses);

    const newReport = {
      id: 'rep-' + Date.now(),
      reportDate: reportData.reportDate,
      vehicleId: reportData.vehicleId || 'veh-1',
      vehicleRegistration: (reportData.vehicleRegistration || 'KDY 926B').toUpperCase(),
      routeOffloadDetails: reportData.routeOffloadDetails?.trim() || '',
      offloadQuantity,
      offloadRate,
      grossAmount,
      fuelLitres,
      fuelExpense,
      otherExpense,
      totalExpenses,
      netIncome,
      mileage: parseFloat(reportData.mileage) || 0,
      mileageNote: 'Operational odometer distance',
      remarks: reportData.remarks?.trim() || ''
    };

    reports.unshift(newReport);
    saveReports(reports);
    return Promise.resolve(newReport);
  },

  async update(id, reportData) {
    const reports = getStoredReports();
    const index = reports.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('Daily report record not found');

    const offloadQuantity = parseFloat(reportData.offloadQuantity) || 0;
    const offloadRate = parseFloat(reportData.offloadRate) || 0;
    const fuelLitres = parseFloat(reportData.fuelLitres) || 0;
    const fuelExpense = parseFloat(reportData.fuelExpense) || 0;
    const otherExpense = parseFloat(reportData.otherExpense) || 0;

    const grossAmount = calculateGrossAmount(offloadQuantity, offloadRate);
    const totalExpenses = calculateTotalExpenses(fuelExpense, otherExpense);
    const netIncome = calculateNetIncome(grossAmount, totalExpenses);

    const updated = {
      ...reports[index],
      ...reportData,
      vehicleRegistration: (reportData.vehicleRegistration || reports[index].vehicleRegistration).toUpperCase(),
      offloadQuantity,
      offloadRate,
      grossAmount,
      fuelLitres,
      fuelExpense,
      otherExpense,
      totalExpenses,
      netIncome,
      mileage: parseFloat(reportData.mileage) || 0
    };

    reports[index] = updated;
    saveReports(reports);
    return Promise.resolve(updated);
  },

  async delete(id) {
    let reports = getStoredReports();
    reports = reports.filter((r) => r.id !== id);
    saveReports(reports);
    return Promise.resolve(true);
  },

  async getSummary(filters = {}) {
    const records = await this.getAll(filters);
    return calculateReportSummary(records);
  },

  async bulkAdd(records) {
    const current = getStoredReports();
    const newReports = records.map((record, index) => {
      const offloadQuantity = parseFloat(record.offloadQuantity) || 0;
      const offloadRate = parseFloat(record.offloadRate) || 0;
      const fuelLitres = parseFloat(record.fuelLitres) || 0;
      const fuelExpense = parseFloat(record.fuelExpense) || 0;
      const otherExpense = parseFloat(record.otherExpense) || 0;

      const grossAmount = calculateGrossAmount(offloadQuantity, offloadRate);
      const totalExpenses = calculateTotalExpenses(fuelExpense, otherExpense);
      const netIncome = calculateNetIncome(grossAmount, totalExpenses);

      return {
        id: 'rep-imp-' + Date.now() + '-' + index,
        reportDate: record.reportDate,
        vehicleRegistration: (record.vehicleRegistration || 'KDY 926B').toUpperCase(),
        routeOffloadDetails: record.routeOffloadDetails || 'Direct Haul',
        offloadQuantity,
        offloadRate,
        grossAmount,
        fuelLitres,
        fuelExpense,
        otherExpense,
        totalExpenses,
        netIncome,
        mileage: parseFloat(record.mileage) || 0,
        remarks: record.remarks || 'Imported from spreadsheet batch'
      };
    });

    const combined = [...newReports, ...current];
    saveReports(combined);
    return Promise.resolve(newReports.length);
  },

  async resetToDemo() {
    localStorage.removeItem(STORAGE_KEY);
    return Promise.resolve(INITIAL_DAILY_REPORTS);
  }
};
