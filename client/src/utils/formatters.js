/**
 * Format emission number to string with unit tCO2e
 * @param {number} val 
 * @param {number} decimals 
 * @returns {string} e.g. "12.45 tCO2e"
 */
export const formatEmissions = (val, decimals = 2) => {
  if (val === null || val === undefined || isNaN(val)) return '0.00 tCO2e';
  const num = Number(val);
  return `${num.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })} tCO2e`;
};

/**
 * Format raw number with commas
 * @param {number} val 
 * @returns {string}
 */
export const formatNumber = (val, decimals = 0) => {
  if (val === null || val === undefined || isNaN(val)) return '0';
  return Number(val).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Format currency amount
 * @param {number} amount 
 * @param {string} currency 
 * @returns {string} e.g. "$1,200/t" or "$1,200"
 */
export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === null || amount === undefined || isNaN(amount)) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format date string
 * @param {string|Date} dateVal 
 * @returns {string} e.g. "Sep 12, 2026"
 */
export const formatDate = (dateVal) => {
  if (!dateVal) return 'N/A';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return 'N/A';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(d);
  } catch (e) {
    return 'N/A';
  }
};

/**
 * Scope label helper
 * @param {number} scope 
 * @returns {string}
 */
export const getScopeLabel = (scope) => {
  switch (Number(scope)) {
    case 1:
      return 'Scope 1 (Direct)';
    case 2:
      return 'Scope 2 (Energy)';
    case 3:
      return 'Scope 3 (Supply Chain)';
    default:
      return `Scope ${scope || 'Unknown'}`;
  }
};
