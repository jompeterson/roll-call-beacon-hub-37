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
