/**
 * Financial Calculation Rules for BASAH SERVICE LIMITED
 *
 * Rules:
 * Gross Amount = Offload Quantity × Offload Rate
 * Total Expenses = Fuel Expense + Other Expenses
 * Net Income = Gross Amount − Total Expenses
 */

/**
 * Rounds a number to 2 decimal places avoiding IEEE 754 floating point precision issues.
 * @param {number|string} value
 * @returns {number}
 */
export function roundCurrency(value) {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num) || num === null || num === undefined) return 0;
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Calculates Gross Amount in KSh.
 * @param {number|string} quantity Offload Quantity (e.g. Metric Tonnes or Units)
 * @param {number|string} rate Offload Rate per unit in KSh
 * @returns {number}
 */
export function calculateGrossAmount(quantity, rate) {
  const qty = parseFloat(quantity) || 0;
  const rt = parseFloat(rate) || 0;
  return roundCurrency(qty * rt);
}

/**
 * Calculates Total Expenses in KSh.
 * @param {number|string} fuelExpense Fuel expense in KSh
 * @param {number|string} otherExpense Other expenses in KSh
 * @returns {number}
 */
export function calculateTotalExpenses(fuelExpense, otherExpense) {
  const fuel = parseFloat(fuelExpense) || 0;
  const other = parseFloat(otherExpense) || 0;
  return roundCurrency(fuel + other);
}

/**
 * Calculates Net Income in KSh. Can be negative if expenses exceed gross income.
 * @param {number|string} grossAmount Gross income in KSh
 * @param {number|string} totalExpenses Total expenses in KSh
 * @returns {number}
 */
export function calculateNetIncome(grossAmount, totalExpenses) {
  const gross = parseFloat(grossAmount) || 0;
  const expenses = parseFloat(totalExpenses) || 0;
  return roundCurrency(gross - expenses);
}

/**
 * Aggregates summary statistics for a collection of daily report records.
 * @param {Array} records
 * @returns {Object}
 */
export function calculateReportSummary(records = []) {
  if (!Array.isArray(records) || records.length === 0) {
    return {
      totalGross: 0,
      totalFuelExpense: 0,
      totalOtherExpense: 0,
      totalExpenses: 0,
      totalNetIncome: 0,
      totalFuelLitres: 0,
      workingDaysCount: 0,
      recordCount: 0,
      averageDailyIncome: 0,
      averageDailyNetIncome: 0,
      averageOffloadQty: 0
    };
  }

  let totalGross = 0;
  let totalFuelExpense = 0;
  let totalOtherExpense = 0;
  let totalFuelLitres = 0;
  let totalOffloadQty = 0;
  const uniqueDates = new Set();

  records.forEach((record) => {
    const gross = parseFloat(record.grossAmount) || 0;
    const fuelExp = parseFloat(record.fuelExpense) || 0;
    const otherExp = parseFloat(record.otherExpense) || 0;
    const fuelLitres = parseFloat(record.fuelLitres) || 0;
    const qty = parseFloat(record.offloadQuantity) || 0;

    totalGross += gross;
    totalFuelExpense += fuelExp;
    totalOtherExpense += otherExp;
    totalFuelLitres += fuelLitres;
    totalOffloadQty += qty;

    if (record.reportDate) {
      uniqueDates.add(record.reportDate);
    }
  });

  const totalExpenses = roundCurrency(totalFuelExpense + totalOtherExpense);
  const totalNetIncome = roundCurrency(totalGross - totalExpenses);
  const workingDaysCount = uniqueDates.size || records.length;
  const averageDailyIncome = workingDaysCount > 0 ? roundCurrency(totalGross / workingDaysCount) : 0;
  const averageDailyNetIncome = workingDaysCount > 0 ? roundCurrency(totalNetIncome / workingDaysCount) : 0;
  const averageOffloadQty = records.length > 0 ? roundCurrency(totalOffloadQty / records.length) : 0;

  return {
    totalGross: roundCurrency(totalGross),
    totalFuelExpense: roundCurrency(totalFuelExpense),
    totalOtherExpense: roundCurrency(totalOtherExpense),
    totalExpenses,
    totalNetIncome,
    totalFuelLitres: roundCurrency(totalFuelLitres),
    workingDaysCount,
    recordCount: records.length,
    averageDailyIncome,
    averageDailyNetIncome,
    averageOffloadQty
  };
}
