import React, { useEffect, useRef, useState } from "react";

const DatapointMobile = ({
  x,
  y,
  query,
  fullDate,
  radius,
  color,
  selectedQuery,
  selectedFullDate,
  onSelect,
}) => {
  const isSelected =
    selectedQuery === query &&
    selectedFullDate?.getTime() === fullDate.getTime();

  const isBeforeNoon = fullDate.getHours() < 12;
  const tooltipRef = useRef(null);
  const [tooltipHeight, setTooltipHeight] = useState(80);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(isSelected);
  }, [isSelected]);

  useEffect(() => {
    if (tooltipRef.current) {
      setTooltipHeight(tooltipRef.current.offsetHeight);
    }
  }, [visible]);

  const tooltipY = isBeforeNoon
    ? y + radius + 8
    : y - radius - tooltipHeight - 8;

  const handleClick = () => {
    onSelect({ query, fullDate, x, y });
  };

  return (
    <>
      <g onClick={handleClick} className="cursor-pointer">
        {isSelected && (
          <circle
            cx={x}
            cy={y}
            r={radius * 2.5}
            fill="none"
            stroke={color}
            strokeWidth={2}
            className="animate-growRing"
          />
        )}
        <circle
          cx={x}
          cy={y}
          r={isSelected ? radius * 1.2 : radius}
          fill={color}
          opacity={isSelected ? 0.85 : 0.6}
          style={{ filter: isSelected ? "none" : "blur(0.5px)" }}
        />
      </g>

      {visible && (
        <foreignObject
          x={x - 125}
          y={tooltipY}
          width={250}
          height={tooltipHeight + 20}
          className="z-90"
        >
          <div
            ref={tooltipRef}
            className="rounded-md text-xs leading-tight shadow-md bg-white text-black"
          >
            <div className="py-2 px-5">
              <p>SEARCHED AT {fullDate.toLocaleTimeString()}</p>
              <p className="text-lg font-medium my-2">"{query}"</p>
            </div>
          </div>
        </foreignObject>
      )}
    </>
  );
};

export default DatapointMobile;
