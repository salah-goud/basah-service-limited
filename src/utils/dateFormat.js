/**
 * Date Formatting and Period Utilities
 */

/**
 * Formats YYYY-MM-DD into readable date (e.g., "12 Oct 2025" or "Oct 12, 2025").
 * @param {string|Date} dateVal
 * @returns {string}
 */
export function formatDate(dateVal) {
  if (!dateVal) return '-';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return String(dateVal);
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Returns formatted month and year (e.g. "October 2025")
 * @param {string} monthStr YYYY-MM format
 * @returns {string}
 */
export function formatMonthYear(monthStr) {
  if (!monthStr) return '';
  const [year, month] = monthStr.split('-');
  if (!year || !month) return monthStr;
  const d = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
  return d.toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Get current year-month in YYYY-MM format.
 * @returns {string}
 */
export function getCurrentMonthString() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

/**
 * Get today in YYYY-MM-DD format.
 * @returns {string}
 */
export function getTodayString() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
