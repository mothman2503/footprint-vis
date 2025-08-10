// hooks/useMonthSummaries.js
import { useMemo } from "react";
import { format } from "date-fns";

export default function useMonthSummaries(records, IAB_CATEGORIES, minDate, maxDate) {
  return useMemo(() => {
    const monthMap = {};
    if (!minDate || !maxDate) return monthMap;
    let date = new Date(minDate);
    date.setDate(1);
    while (date <= maxDate) {
      const key = format(date, "MMMM yyyy");
      const month = date.getMonth();
      const year = date.getFullYear();

      const monthRecords = records.filter((r) => {
        const d = new Date(r.timestamp);
        return d.getFullYear() === year && d.getMonth() === month;
      });

      const categoryCounts = Object.entries(
        monthRecords.reduce((acc, rec) => {
          const catId = rec.category?.id || "uncategorized";
          acc[catId] = (acc[catId] || 0) + 1;
          return acc;
        }, {})
      ).map(([id, value]) => {
        const cat = IAB_CATEGORIES.find((c) => c.id === id);
        return {
            id,
          label: cat?.name || "Uncategorized",
          color: cat?.color || "#888",
          value,
        };
      });

      monthMap[key] = {
        searchCount: monthRecords.length,
        categoryCounts,
        date: new Date(date),
      };

      date.setMonth(date.getMonth() + 1);
      date.setDate(1);
    }
    return monthMap;
  }, [records, IAB_CATEGORIES, minDate, maxDate]);
}
