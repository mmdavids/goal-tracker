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

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`;
  if (seconds < 31536000) return `${Math.floor(seconds / 2592000)}mo ago`;
  return `${Math.floor(seconds / 31536000)}y ago`;
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
