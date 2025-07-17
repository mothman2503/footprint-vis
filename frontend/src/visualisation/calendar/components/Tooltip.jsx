import React, { useEffect, useRef, useState } from "react";
import CategoryDropdown from "../../../components/CategoryDropdown";
// Tooltip.jsx
const Tooltip = ({ point, radius, position, onClose, onCategoryChange }) => {
  const tooltipRef = useRef(null);
  const [height, setHeight] = useState(80);

  useEffect(() => {
    if (tooltipRef.current) {
      setHeight(tooltipRef.current.offsetHeight);
    }
  }, [point]);

  if (!point || !position) return null;

  const { x, y, isBeforeNoon } = position;

  const top = isBeforeNoon ? y + 4*radius : y - 4*radius - height;
  const left = x - 150;

  return (
    <div
      ref={tooltipRef}
      className="absolute z-50 w-[300px] pointer-events-auto rounded"
      style={{
        top,
        left,
        backgroundColor: point.category.color,
        transformOrigin: isBeforeNoon ? "top center" : "bottom center",
      }}
      onMouseEnter={() => clearTimeout(window.__tooltipLeaveTimeout)}
      onMouseLeave={() =>
        (window.__tooltipLeaveTimeout = setTimeout(onClose, 300))
      }
    >
      <div className="rounded-md text-xs leading-tight shadow-md animate-tooltipFadeIn overflow-visible">
        <div className="py-2 px-2">
          <div className="flex justify-between">
            <p className="text-xs px-6">
              SEARCHED AT {point.fullDate?.toLocaleTimeString()}
            </p>
            <button
              onClick={onClose}
              className="text-white bg-red-600 w-5 h-5 text-xs rounded-full text-center"
            >
              ×
            </button>
          </div>
          <p className="text-lg font-medium my-2 px-6">"{point.query}"</p>
          <p className="px-6">{point.category?.name}</p>
        </div>
        <div className="h-[0.3px] w-full bg-[#444]" />
        <div className="py-2 px-8">
          <CategoryDropdown
            value={point.category?.id}
            onChange={(newId) => {
              if (point?.id) onCategoryChange?.(point, newId);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Tooltip;
