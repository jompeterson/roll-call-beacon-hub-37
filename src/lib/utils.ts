import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date string to MM/DD/YYYY format.
 * Optionally include time (HH:MM AM/PM).
 */
export function formatDate(dateString: string | null, options?: { includeTime?: boolean }): string {
  if (!dateString) return "Not specified";
  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  
  let result = `${month}/${day}/${year}`;
  
  if (options?.includeTime) {
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    result += ` ${displayHours}:${minutes} ${ampm}`;
  }
  
  return result;
}

/**
 * Convert a date-only input value ("YYYY-MM-DD") to an ISO timestamp anchored
 * at local noon, so the calendar day never shifts across timezones.
 */
export function dateInputToISO(value: string): string | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return new Date(value).toISOString();
  const [, y, m, d] = match;
  return new Date(Number(y), Number(m) - 1, Number(d), 12, 0, 0).toISOString();
}

/** Convert a stored timestamp to a "YYYY-MM-DD" value for date inputs (local time). */
export function isoToDateInput(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}
