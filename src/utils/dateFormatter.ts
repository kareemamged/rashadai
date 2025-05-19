export const formatDate = (dateString: string, language?: string): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    calendar: 'gregory' // Always use Gregorian calendar even for Arabic
  };

  const locale = language === 'ar' ? 'ar-SA' : 'en-US';
  return new Date(dateString).toLocaleDateString(locale, options);
};

export const timeAgo = (dateString: string, language?: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const isArabic = language === 'ar';

  let interval = seconds / 31536000; // seconds in a year

  if (interval > 1) {
    const value = Math.floor(interval);
    return isArabic
      ? `منذ ${value} ${value === 1 ? 'سنة' : value === 2 ? 'سنتين' : 'سنوات'}`
      : `${value} ${value === 1 ? 'year' : 'years'} ago`;
  }

  interval = seconds / 2592000; // seconds in a month
  if (interval > 1) {
    const value = Math.floor(interval);
    return isArabic
      ? `منذ ${value} ${value === 1 ? 'شهر' : value === 2 ? 'شهرين' : 'أشهر'}`
      : `${value} ${value === 1 ? 'month' : 'months'} ago`;
  }

  interval = seconds / 86400; // seconds in a day
  if (interval > 1) {
    const value = Math.floor(interval);
    return isArabic
      ? `منذ ${value} ${value === 1 ? 'يوم' : value === 2 ? 'يومين' : 'أيام'}`
      : `${value} ${value === 1 ? 'day' : 'days'} ago`;
  }

  interval = seconds / 3600; // seconds in an hour
  if (interval > 1) {
    const value = Math.floor(interval);
    return isArabic
      ? `منذ ${value} ${value === 1 ? 'ساعة' : value === 2 ? 'ساعتين' : 'ساعات'}`
      : `${value} ${value === 1 ? 'hour' : 'hours'} ago`;
  }

  interval = seconds / 60; // seconds in a minute
  if (interval > 1) {
    const value = Math.floor(interval);
    return isArabic
      ? `منذ ${value} ${value === 1 ? 'دقيقة' : value === 2 ? 'دقيقتين' : 'دقائق'}`
      : `${value} ${value === 1 ? 'minute' : 'minutes'} ago`;
  }

  const value = Math.floor(seconds);
  return isArabic
    ? `منذ ${value} ${value === 1 ? 'ثانية' : value === 2 ? 'ثانيتين' : 'ثوان'}`
    : `${value} ${value === 1 ? 'second' : 'seconds'} ago`;
};