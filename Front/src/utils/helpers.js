/**
 * Common utility functions for the application
 */

/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code (default: 'USD')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

/**
 * Format a date to readable format
 * @param {Date|string} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

/**
 * Days between an order being placed and its expected delivery.
 * Every page that shows a delivery date must go through
 * getExpectedDeliveryDate so the customer sees the same promise everywhere.
 */
export const DELIVERY_DAYS = 7;

/**
 * Expected delivery date for an order
 * @param {Date|string} [from] - When the order was placed (default: now)
 * @returns {string} Date such as "10 Oct 2026"
 */
export const getExpectedDeliveryDate = (from = new Date()) => {
  const d = new Date(from);
  d.setDate(d.getDate() + DELIVERY_DAYS);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Check if a value is empty
 * @param {*} value - The value to check
 * @returns {boolean} True if empty
 */
export const isEmpty = (value) => {
  return (
    value === undefined ||
    value === null ||
    (typeof value === 'string' && value.trim() === '') ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === 'object' && Object.keys(value).length === 0)
  );
};

export const productLabel = (product) =>
  product?.colorName ? `${product.name} - ${product.colorName}` : product?.name;
