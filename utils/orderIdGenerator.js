import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a systematic order number
 * Format: YUCA-YYYY-MM-DD-XXXXXX
 * Where XXXXXX is a 6-digit sequential number
 */
export const generateOrderNumber = async () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  // Generate a 6-digit random number for uniqueness
  const randomSuffix = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  
  return `YUCA-${year}-${month}-${day}-${randomSuffix}`;
};

/**
 * Generate a UUID for internal order tracking
 * This will be used as the primary key for better ID management
 */
export const generateOrderUUID = () => {
  return uuidv4();
};

/**
 * Validate if a string is a valid order number format
 * @param {string} orderNumber - The order number to validate
 * @returns {boolean} - True if valid format
 */
export const isValidOrderNumber = (orderNumber) => {
  const orderNumberRegex = /^YUCA-\d{4}-\d{2}-\d{2}-\d{6}$/;
  return orderNumberRegex.test(orderNumber);
};

/**
 * Extract date from order number
 * @param {string} orderNumber - The order number
 * @returns {Date|null} - The date or null if invalid
 */
export const extractDateFromOrderNumber = (orderNumber) => {
  if (!isValidOrderNumber(orderNumber)) {
    return null;
  }
  
  const parts = orderNumber.split('-');
  const year = parseInt(parts[1]);
  const month = parseInt(parts[2]) - 1; // Month is 0-indexed in Date
  const day = parseInt(parts[3]);
  
  return new Date(year, month, day);
};
