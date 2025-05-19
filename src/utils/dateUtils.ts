/**
 * Format a date string based on the current language
 * @param dateString - ISO date string to format
 * @param language - Current language (ar or en)
 * @param includeTime - Whether to include time in the formatted date (default: true)
 * @returns Formatted date string
 */
export const formatDate = (dateString: string, language: string = 'en', includeTime: boolean = true): string => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return '';
    }

    // Format options
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      calendar: 'gregory' // Always use Gregorian calendar even for Arabic
    };

    // Add time options if requested
    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }

    // Format based on language
    if (language === 'ar') {
      // Arabic date format with Gregorian calendar
      return new Intl.DateTimeFormat('ar-SA', options).format(date);
    } else {
      // English date format
      return new Intl.DateTimeFormat('en-US', options).format(date);
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

/**
 * Format a date as a relative time (e.g., "2 days ago")
 * @param dateString - ISO date string to format
 * @param language - Current language (ar or en)
 * @returns Relative time string
 */
export const formatRelativeTime = (dateString: string, language: string = 'en'): string => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    const now = new Date();

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return '';
    }

    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // Format based on language
    const rtf = new Intl.RelativeTimeFormat(language === 'ar' ? 'ar' : 'en', { numeric: 'auto' });

    if (diffInSeconds < 60) {
      return rtf.format(-diffInSeconds, 'second');
    } else if (diffInSeconds < 3600) {
      return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
    } else if (diffInSeconds < 86400) {
      return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
    } else if (diffInSeconds < 2592000) {
      return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
    } else if (diffInSeconds < 31536000) {
      return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
    } else {
      return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
    }
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return formatDate(dateString, language);
  }
};

/**
 * Calculate time remaining until a future date
 * @param dateString - ISO date string of the future date
 * @param language - Current language (ar or en)
 * @returns Time remaining string
 */
export const getTimeRemaining = (dateString: string, language: string = 'en'): string => {
  if (!dateString) return '';

  try {
    const targetDate = new Date(dateString);
    const now = new Date();

    // Check if date is valid or in the past
    if (isNaN(targetDate.getTime()) || targetDate <= now) {
      return '';
    }

    const diffInSeconds = Math.floor((targetDate.getTime() - now.getTime()) / 1000);

    if (language === 'ar') {
      if (diffInSeconds < 60) {
        return `${diffInSeconds} ثانية`;
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} ${minutes === 1 ? 'دقيقة' : 'دقائق'}`;
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} ${hours === 1 ? 'ساعة' : 'ساعات'}`;
      } else {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} ${days === 1 ? 'يوم' : 'أيام'}`;
      }
    } else {
      if (diffInSeconds < 60) {
        return `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''}`;
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours !== 1 ? 's' : ''}`;
      } else {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days !== 1 ? 's' : ''}`;
      }
    }
  } catch (error) {
    console.error('Error calculating time remaining:', error);
    return '';
  }
};
