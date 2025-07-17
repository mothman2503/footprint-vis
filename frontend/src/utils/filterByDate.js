// utils/filterByDate.js
import { DateTime } from "luxon";

/**
 * Filters records by ISO timestamp to fall within [startDate, startDate + numDays)
 */
export function filterRecordsByDate(records, startDate, numDays) {
  const start = DateTime.fromJSDate(startDate).startOf("day");
  const end = start.plus({ days: numDays });

  return records.filter((record) => {
    if (!record.timestamp) return false;
    const time = DateTime.fromISO(record.timestamp);
    return time >= start && time < end;
  });
}
