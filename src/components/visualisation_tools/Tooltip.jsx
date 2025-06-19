// Updated Tooltip.jsx to include logging for category change propagation
import React, { useEffect, useRef, useState } from "react";
import CategorySelector from "./CategorySelector";

const Tooltip = ({
  point,
  isTouch,
  isFirstDay = false,
  isLastDay = false,
  isMobile = false,
  radius,
  margin = { left: 0, right: 0, top: 0, bottom: 0 },
  onClose,
  onCategoryChange,
}) => {
  const tooltipRef = useRef(null);
  const [height, setHeight] = useState(80);

  const isBeforeNoon = point?.fullDate.getHours() < 12;

  useEffect(() => {
    if (tooltipRef.current) {
      setHeight(tooltipRef.current.offsetHeight);
    }
  }, [point]);

  if (!point) return null;

  const tooltipX = isMobile
    ? margin.left * 1.5
    : isFirstDay
    ? point.clusteredX - 5
    : isLastDay
    ? point.clusteredX - 245
    : point.clusteredX - 125;

  const tooltipY = isBeforeNoon
    ? point.clusteredY + radius + 8
    : point.clusteredY - radius - height - 8;

  return (
    <foreignObject
      x={tooltipX}
      y={tooltipY - 20 * (isBeforeNoon ? -1 : 1)}
      width={isMobile ? `calc(100vw - ${margin.left * 2 + margin.right * 2}px)` : "300px"}
      height={height + 200} // increase height to accommodate dropdown
      className="z-90 px-4 overflow-visible"
      onMouseEnter={() => clearTimeout(window.__tooltipLeaveTimeout)}
      onMouseLeave={() => {
        window.__tooltipLeaveTimeout = setTimeout(onClose, 200);
      }}
      onPointerDown={(e) => e.stopPropagation()} // prevent bubbling tap events
  onClick={(e) => e.stopPropagation()}
      style={{ overflow: 'visible' }}
    >
      <div
        ref={tooltipRef}
        className="rounded-md text-xs leading-tight shadow-md z-90 animate-tooltipFadeIn overflow-visible"
        style={{
          backgroundColor: point.category.color,
          transformOrigin: isBeforeNoon ? "top center" : "bottom center",
          overflow: "visible",
        }}
      >
        <div className="py-2 px-8">
          <div className="flex justify-between">
            <p className="text-xs">
              SEARCHED AT {point.fullDate.toLocaleTimeString()}
            </p>

            {isTouch && (
              <div className={`cursor-pointer`} onClick={onClose}>
                <p className="absolute pt-[2px] bg-red-500/90 border-black/50 p-auto text-center rounded-full w-[20px] h-[20px]">
                  ×
                </p>
              </div>
            )}
          </div>
          <p className="text-lg font-medium my-2">"{point.query}"</p>
        </div>
        <div className="h-[0.3px] w-full bg-[#444]" />
        <div className="py-2 px-5">
          <CategorySelector
            value={point.category.id}
            onChange={(newId) => {
              console.log("Calling onCategoryChange with ID:", newId);
              if (point?.id) {
                console.log("Tooltip point with ID:", point.id);
                onCategoryChange?.(point, newId);
              } else {
                console.warn("Tooltip point has no ID:", point);
              }
            }}
            label="Category"
          />
        </div>
      </div>
    </foreignObject>
  );
};

export default Tooltip;
