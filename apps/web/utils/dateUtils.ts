import { endOfDay, format, isDate, isValid, parseISO, startOfDay } from 'date-fns';

const ISO_WITH_MILLISECONDS = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'";

const toDate = (value: unknown): Date | null => {
  if (!value && value !== 0) {
    return null;
  }

  if (isDate(value)) {
    return isValid(value) ? value : null;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = parseISO(value);
    if (isValid(parsed)) {
      return parsed;
    }

    const fallback = new Date(value);
    return isValid(fallback) ? fallback : null;
  }

  if (typeof value === 'number') {
    const numericDate = new Date(value);
    return isValid(numericDate) ? numericDate : null;
  }

  return null;
};

export const formatDateDisplay = (value: unknown, pattern: string): string => {
  const date = toDate(value);

  if (!date) {
    return '';
  }

  return format(date, pattern);
};

export const formatDateForTable = (value: unknown): string => {
  return formatDateDisplay(value, 'PPpp');
};

export const formatDateLabel = (value: unknown): string => {
  return formatDateDisplay(value, 'PP');
};

export const formatTimeLabel = (value: unknown): string => {
  return formatDateDisplay(value, 'hh:mm:ss a');
};

export const startOfDayIso = (value: unknown): string => {
  const date = toDate(value);

  if (!date) {
    return '';
  }

  return format(startOfDay(date), ISO_WITH_MILLISECONDS);
};

export const endOfDayIso = (value: unknown): string => {
  const date = toDate(value);

  if (!date) {
    return '';
  }

  return format(endOfDay(date), ISO_WITH_MILLISECONDS);
};

export const formatDateRangeLabel = (start: unknown, end: unknown): string => {
  const startLabel = formatDateLabel(start);
  const endLabel = formatDateLabel(end);

  if (startLabel && endLabel) {
    return `${startLabel} - ${endLabel}`;
  }

  return startLabel || endLabel || '';
};
