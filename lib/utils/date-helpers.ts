/**
 * Date utility functions for checking if a day is in the past
 * Uses consistent date-only comparison (no time component)
 * Uses local timezone to match user's perception of "today"
 */

/**
 * Get today's date as a date-only string (YYYY-MM-DD) in local timezone
 * This ensures dates are compared based on the user's local calendar day
 */
export function getTodayDateString(): string {
  const today = new Date();
  // Use local timezone to match user's perception of "today"
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Normalize a date to a date-only string (YYYY-MM-DD)
 * Handles both Date objects and date strings
 * For date strings, validates format but doesn't convert timezone
 */
export function normalizeDateToString(date: string | Date): string {
  // If it's already a string in YYYY-MM-DD format, use it directly
  if (typeof date === 'string') {
    // Validate format: YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (dateRegex.test(date)) {
      return date;
    }
    // If not in expected format, try parsing
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      throw new Error('Invalid date string provided');
    }
    // Use local timezone to get date-only string
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // For Date objects, use local timezone
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Check if a given date is in the past (strictly before today)
 * Uses local timezone to determine "today" - matches user's calendar perception
 * @param date - Date string (YYYY-MM-DD) or Date object
 * @returns true if the date is before today (not including today)
 */
export function isPastDay(date: string | Date): boolean {
  try {
    const dateString = normalizeDateToString(date);
    const todayString = getTodayDateString();
    
    // Simple string comparison works for YYYY-MM-DD format
    // This compares calendar dates, not timestamps
    return dateString < todayString;
  } catch (error) {
    console.error('Error checking if date is past:', error);
    // On error, default to false (not past) to avoid blocking users
    return false;
  }
}

