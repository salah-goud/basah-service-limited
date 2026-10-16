/**
 * Currency and Numeric Formatting Utilities
 * Standardized for Kenyan Shillings (KSh) and Fleet metrics.
 */

/**
 * Format an amount in Kenyan Shillings (KSh).
 * Handles positive, zero, and negative values gracefully.
 *
 * @param {number|string} amount
 * @param {Object} options
 * @param {boolean} options.showSymbol - Include 'KSh' prefix (default true)
 * @param {boolean} options.accountingNegative - Format negative as (KSh 1,200.00) if true
 * @param {number} options.minimumFractionDigits - Default 2
 * @returns {string}
 */
export function formatKSh(amount, options = {}) {
  const {
    showSymbol = true,
    accountingNegative = false,
    minimumFractionDigits = 2,
    maximumFractionDigits = 2
  } = options;

  const num = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(num) || num === null || num === undefined) {
    return showSymbol ? 'KSh 0.00' : '0.00';
  }

  const isNegative = num < 0;
  const absVal = Math.abs(num);

  const formattedAbs = new Intl.NumberFormat('en-KE', {
    minimumFractionDigits,
    maximumFractionDigits
  }).format(absVal);

  if (isNegative) {
    if (accountingNegative) {
      return showSymbol ? `(KSh ${formattedAbs})` : `(${formattedAbs})`;
    }
    return showSymbol ? `-KSh ${formattedAbs}` : `-${formattedAbs}`;
  }

  return showSymbol ? `KSh ${formattedAbs}` : formattedAbs;
}

/**
 * Format fuel consumption in litres with suffix.
 * @param {number|string} litres
 * @param {number} decimals
 * @returns {string}
 */
export function formatLitres(litres, decimals = 1) {
  const num = parseFloat(litres);
  if (isNaN(num)) return '0.0 L';
  return `${num.toLocaleString('en-KE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })} L`;
}

/**
 * Format standard quantity (e.g. MT - Metric Tonnes or Units)
 * @param {number|string} qty
 * @param {string} unit
 * @returns {string}
 */
export function formatQuantity(qty, unit = 'MT') {
  const num = parseFloat(qty);
  if (isNaN(num)) return `0 ${unit}`;
  return `${num.toLocaleString('en-KE', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2
  })} ${unit}`;
}
