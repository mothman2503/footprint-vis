import React from "react";
import { useCategoryFilter } from "../../CategoryFilterContext";

const ProportionalBarChartDiv = ({
  data = [],
  height = 16,
  onClick,
  disableDialog = false,
}) => {
  const { state } = useCategoryFilter();
  const hiddenIds = new Set(state.excludedCategoryIds);

  const visibleData = data.filter((d) => !hiddenIds.has(d.id));
  const total = visibleData.reduce((sum, d) => sum + (d.value || 0), 0);
  if (total === 0) return null;

  return (
    <div
      className="w-full flex overflow-hidden gap-[1px] rounded cursor-pointer"
      onClick={(e) => {
        if (!disableDialog && typeof onClick === "function") {
          e.stopPropagation();
          onClick();
        }
      }}
      style={{ height }}
    >
      {visibleData.map((d, i) => {
        const percent = (d.value / total) * 100;
        if (percent < 0.5) return null;

        return (
          <div
            key={i}
            title={`${d.label}: ${d.value}`}
            style={{
              width: `${percent}%`,
              backgroundColor: d.color || "#999",
            }}
          />
        );
      })}
    </div>
  );
};

export default ProportionalBarChartDiv;
