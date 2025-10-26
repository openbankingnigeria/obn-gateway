import { formatDateLabel, formatTimeLabel } from "./dateUtils";

export const timestampFormatter = (dt: unknown) => {
  const date = formatDateLabel(dt);
  const time = formatTimeLabel(dt);

  if (date && time) {
    return `${date} @ ${time}`;
  }

  if (date || time) {
    return date || time || '';
  }

  return '-';
}