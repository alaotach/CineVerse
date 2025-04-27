import { format, parse, isValid, compareDesc } from 'date-fns';
import { logger } from './logger';

// Get dates for the next n days starting from today
export const getNextDays = (days: number) => {
  const result = [];
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(today.getDate() + i);
    
    const formattedValue = formatDateToYYYYMMDD(date);
    
    result.push({
      day: format(date, 'EEE'),
      date: format(date, 'd'),
      month: format(date, 'MMM'),
      value: formattedValue
    });
  }

  return result;
};

// Parse a date string into Date object, with fallback
export const parseDate = (dateString: string): Date | null => {
  if (!dateString) return null;
  
  // Try to parse common date formats
  const formats = ['yyyy-MM-dd', 'MM/dd/yyyy', 'MMM dd, yyyy', 'dd-MM-yyyy'];
  let parsedDate: Date | null = null;
  
  // First try if it's already a valid ISO date
  try {
    const date = new Date(dateString);
    if (isValid(date)) {
      return date;
    }
  } catch (error) {
    // Continue with other formats
  }
  
  // Try each format
  for (const dateFormat of formats) {
    try {
      const date = parse(dateString, dateFormat, new Date());
      if (isValid(date)) {
        parsedDate = date;
        break;
      }
    } catch (error) {
      // Try next format
    }
  }
  
  // If all parsing attempts failed, log warning and return null
  if (!parsedDate) {
    logger.warn(`Could not parse date string: ${dateString}`);
  }
  
  return parsedDate;
};

// Format a date as YYYY-MM-DD
export const formatDateToYYYYMMDD = (date: Date): string => {
  try {
    return format(date, 'yyyy-MM-dd');
  } catch (error) {
    logger.error('Error formatting date to YYYY-MM-DD:', error);
    return '';
  }
};

// Format date for display with error handling
export const formatDateForDisplay = (dateString: string): string => {
  try {
    if (!dateString) return '';
    
    const parsedDate = parseDate(dateString);
    if (!parsedDate) return dateString;
    
    return format(parsedDate, 'MMMM dd, yyyy');
  } catch (error) {
    logger.error('Error formatting date for display:', error);
    return dateString;
  }
};

// Compare two dates for equality, handling different formats
export const areDatesEqual = (dateA: string, dateB: string): boolean => {
  try {
    if (dateA === dateB) return true;
    
    const parsedA = parseDate(dateA);
    const parsedB = parseDate(dateB);
    
    if (!parsedA || !parsedB) return false;
    
    // Format both to YYYY-MM-DD for comparison
    return formatDateToYYYYMMDD(parsedA) === formatDateToYYYYMMDD(parsedB);
  } catch (error) {
    logger.error('Error comparing dates:', error);
    return false;
  }
};

// Debug function to log date information
export const debugDate = (label: string, dateString?: string): void => {
  if (!dateString) {
    logger.debug(`${label}: undefined or empty`);
    return;
  }
  
  try {
    const parsed = parseDate(dateString);
    if (parsed) {
      logger.debug(`${label}: "${dateString}" parsed as "${formatDateToYYYYMMDD(parsed)}"`);
    } else {
      logger.debug(`${label}: "${dateString}" could not be parsed`);
    }
  } catch (error) {
    logger.error(`Error debugging date ${label}:`, error);
  }
};

// Convert date to standard format for API requests
export const standardizeDate = (dateString: string): string => {
  try {
    const parsed = parseDate(dateString);
    return parsed ? formatDateToYYYYMMDD(parsed) : dateString;
  } catch (error) {
    logger.error('Error standardizing date:', error);
    return dateString;
  }
};
