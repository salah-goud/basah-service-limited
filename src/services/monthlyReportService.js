/**
 * Monthly Report Aggregation Service
 * Derives comprehensive monthly financials from daily vehicle operational records.
 */
import { dailyReportService } from './dailyReportService';
import { calculateReportSummary } from '../utils/calculations';

export const monthlyReportService = {
  /**
   * Generates a monthly performance breakdown.
   * @param {Object} params
   * @param {string} params.month YYYY-MM
   * @param {string} [params.vehicleRegistration] 'ALL' or specific plate
   * @param {string} [params.startDate] Custom date range start
   * @param {string} [params.endDate] Custom date range end
   * @returns {Promise<Object>}
   */
  async getMonthlyReport({ month, vehicleRegistration = 'ALL', startDate = '', endDate = '' }) {
    const filters = {};

    if (month && !startDate && !endDate) {
      filters.month = month;
    }

    if (startDate) {
      filters.startDate = startDate;
    }
    if (endDate) {
      filters.endDate = endDate;
    }

    if (vehicleRegistration && vehicleRegistration !== 'ALL') {
      filters.vehicleRegistration = vehicleRegistration;
    }

    const records = await dailyReportService.getAll(filters);
    const summary = calculateReportSummary(records);

    return {
      month,
      vehicleRegistration,
      dateRange: { startDate, endDate },
      records,
      summary
    };
  }
};
