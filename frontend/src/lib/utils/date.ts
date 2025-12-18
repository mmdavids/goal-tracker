function parseDate(date: string | Date): Date {
  if (typeof date === 'string') {
    // If the string doesn't contain timezone info, append 'Z' to treat it as UTC
    // SQLite CURRENT_TIMESTAMP returns UTC datetime strings like "2024-01-15 10:30:00"
    if (!date.includes('Z') && !date.includes('+') && !date.includes('-', 10)) {
      return new Date(date.replace(' ', 'T') + 'Z');
    }
    return new Date(date);
  }
  return date;
}

export function formatDate(date: string | Date): string {
  const d = parseDate(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  const d = parseDate(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function timeAgo(date: string | Date): string {
  const d = parseDate(date);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  // Check if the date is today
  const dateDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const todayDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const isToday = dateDay.getTime() === todayDay.getTime();

  // Only show relative time for today, otherwise show absolute date
  if (!isToday) {
    return formatDate(d);
  }

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;

  // Fallback for edge cases
  return formatDate(d);
}

// Convert a UTC date string to datetime-local input format (YYYY-MM-DDTHH:mm) in local timezone
export function toDateTimeLocalString(date: string | Date): string {
  const d = parseDate(date);
  // Get local date/time components
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Calculate the percentage of time elapsed between start date and target date
export function calculateTimeProgress(startDate: string | Date, targetDate: string | Date): number {
  const start = parseDate(startDate).getTime();
  const target = parseDate(targetDate).getTime();
  const now = new Date().getTime();

  // If target is in the past, return 100%
  if (now >= target) return 100;

  // If start is in the future, return 0%
  if (now <= start) return 0;

  // Calculate percentage
  const totalTime = target - start;
  const elapsedTime = now - start;
  const percentage = (elapsedTime / totalTime) * 100;

  return Math.min(Math.max(Math.round(percentage), 0), 100);
}
