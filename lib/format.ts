import type { TransactionType } from '@/lib/types';

// Formats a number as a signed amount, e.g. "+1,250.00" / "-9.99".
export function formatAmount(type: TransactionType, amount: number) {
  const sign = type === 'income' ? '+' : '-';
  const value = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${sign}${value}`;
}

// Turns an ISO 'YYYY-MM-DD' date into something short, e.g. "Jun 19, 2026".
// Falls back to the raw string if it isn't a valid date.
export function formatDate(date: string) {
  const d = parseISODate(date);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// A Date → 'YYYY-MM-DD' using LOCAL parts (not UTC), so the day can't shift
// across a timezone offset the way toISOString() can.
export function toISODate(d: Date) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Parse 'YYYY-MM-DD' into a LOCAL Date (midnight local), avoiding the UTC
// parsing of new Date('YYYY-MM-DD') which can render as the previous day.
export function parseISODate(date: string) {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}
