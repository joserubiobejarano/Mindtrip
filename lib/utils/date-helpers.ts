/**
 * Date utility functions for checking if a day is in the past
 * Uses consistent date-only comparison (no time component)
 */

/**
 * Get today's date as a date-only string (YYYY-MM-DD) in UTC
 */
export function getTodayDateString(): string {
  const today = new Date();
  // Use UTC to avoid timezone issues
  const year = today.getUTCFullYear();
  const month = String(today.getUTCMonth() + 1).padStart(2, '0');
  const day = String(today.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Normalize a date to a date-only string (YYYY-MM-DD)
 * Handles both Date objects and date strings
 */
export function normalizeDateToString(date: string | Date): string {
  let dateObj: Date;
  
  if (typeof date === 'string') {
    // Parse the date string (assuming YYYY-MM-DD format)
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }
  
  // Ensure we're working with a valid date
  if (isNaN(dateObj.getTime())) {
    throw new Error('Invalid date provided');
  }
  
  // Use UTC to get date-only string
  const year = dateObj.getUTCFullYear();
  const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Check if a given date is in the past (strictly before today)
 * @param date - Date string (YYYY-MM-DD) or Date object
 * @returns true if the date is before today (not including today)
 */
export function isPastDay(date: string | Date): boolean {
  try {
    const dateString = normalizeDateToString(date);
    const todayString = getTodayDateString();
    
    // Simple string comparison works for YYYY-MM-DD format
    return dateString < todayString;
  } catch (error) {
    console.error('Error checking if date is past:', error);
    // On error, default to false (not past) to avoid blocking users
    return false;
  }
}

