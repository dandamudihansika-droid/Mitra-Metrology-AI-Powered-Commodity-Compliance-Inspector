/**
 * Centralized Date & Time Utility Module (IST - Asia/Kolkata)
 * Mitra Metrology — Legal Metrology & Packaged Commodity Platform
 */

const IST_TIMEZONE = 'Asia/Kolkata';

/**
 * Returns current ISO timestamp string
 */
export function getCurrentISTIsoString() {
  return new Date().toISOString();
}

/**
 * Formats a Date object or ISO timestamp string into IST date format: "DD MMM YYYY" (e.g., "09 Sep 2026")
 */
export function formatISTDate(dateOrIso) {
  if (!dateOrIso) return '';
  const date = new Date(dateOrIso);
  if (isNaN(date.getTime())) return String(dateOrIso);

  const formatter = new Intl.DateTimeFormat('en-IN', {
    timeZone: IST_TIMEZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return formatter.format(date);
}

/**
 * Formats a Date object or ISO timestamp string into IST time format: "hh:mm A" (e.g., "06:05 PM")
 */
export function formatISTTime(dateOrIso) {
  if (!dateOrIso) return '';
  const date = new Date(dateOrIso);
  if (isNaN(date.getTime())) return String(dateOrIso);

  const formatter = new Intl.DateTimeFormat('en-IN', {
    timeZone: IST_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return formatter.format(date);
}

/**
 * Formats a Date object or ISO timestamp string into IST full timestamp: "DD MMM YYYY, hh:mm A"
 */
export function formatISTDateTime(dateOrIso, separator = ', ') {
  if (!dateOrIso) return '';
  const datePart = formatISTDate(dateOrIso);
  const timePart = formatISTTime(dateOrIso);
  if (!datePart || !timePart) return String(dateOrIso);
  return `${datePart}${separator}${timePart}`;
}

/**
 * Checks if a given Date or ISO timestamp is today in IST (Asia/Kolkata)
 */
export function isTodayIST(dateOrIso) {
  if (!dateOrIso) return false;
  const targetDate = new Date(dateOrIso);
  if (isNaN(targetDate.getTime())) return false;

  const todayStr = formatISTDate(new Date());
  const targetStr = formatISTDate(targetDate);

  return todayStr === targetStr;
}
