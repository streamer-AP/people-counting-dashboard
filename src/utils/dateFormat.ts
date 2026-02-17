import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Convert UTC timestamp to local time
 * @param utcTimestamp - UTC timestamp string
 * @param format - Output format (default: 'YYYY-MM-DD HH:mm:ss')
 * @returns Formatted local time string
 */
export const formatUTCToLocal = (
  utcTimestamp: string,
  format: string = 'YYYY-MM-DD HH:mm:ss'
): string => {
  return dayjs.utc(utcTimestamp).local().format(format);
};

/**
 * Format timestamp to relative time (e.g., "2 minutes ago")
 * @param timestamp - Timestamp string
 * @returns Relative time string
 */
export const formatRelativeTime = (timestamp: string): string => {
  const now = dayjs();
  const time = dayjs(timestamp);
  const diffInSeconds = now.diff(time, 'second');

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
};

/**
 * Format duration in seconds to human-readable format
 * @param seconds - Duration in seconds
 * @returns Formatted duration string
 */
export const formatDuration = (seconds: number): string => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(' ');
};
