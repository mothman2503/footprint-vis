import React, { useEffect, useRef, useState } from "react";
import CategoryDropdown from "../../../components/CategoryDropdown";

const Tooltip = ({
  point,
  radius,
  position,
  onClose,
  onCategoryChange,
}) => {
  const tooltipRef = useRef(null);
  const [height, setHeight] = useState(80);

  useEffect(() => {
    if (tooltipRef.current) {
      setHeight(tooltipRef.current.offsetHeight);
    }
  }, [point]);

  if (!point || !position) return null;

  const { x, y, isBeforeNoon } = position;

  return (
    <foreignObject
      x={x - 125}
      y={isBeforeNoon ? y + radius + 8 : y - radius - height - 8}
      width="300px"
      height={height + 100}
      className="z-90 px-4 overflow-visible"
      onClick={(e) => e.stopPropagation()}
      style={{ overflow: "visible" }}
    >
      <div
        ref={tooltipRef}
        className="rounded-md text-xs leading-tight shadow-md z-90 animate-tooltipFadeIn overflow-visible"
        style={{
          backgroundColor: point.category.color,
          transformOrigin: isBeforeNoon ? "top center" : "bottom center",
        }}
      >
        <div className="py-2 px-8">
          <div className="flex justify-between">
            <p className="text-xs">SEARCHED AT {point.fullDate?.toLocaleTimeString()}</p>
            <button onClick={onClose} className="text-white bg-red-600 w-5 h-5 text-xs rounded-full text-center">
              ×
            </button>
          </div>
          <p className="text-lg font-medium my-2">"{point.query}"</p>
        </div>
        <div className="h-[0.3px] w-full bg-[#444]" />
        <div className="py-2 px-5">
          <CategoryDropdown
            value={point.category?.id}
            onChange={(newId) => {
              if (point?.id) onCategoryChange?.(point, newId);
            }}
            label="Category"
          />
        </div>
      </div>
    </foreignObject>
  );
};

export default Tooltip;
