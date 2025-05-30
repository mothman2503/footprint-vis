import React, { useEffect, useRef, useState } from "react";

const Datapoint = ({
  x,
  y,
  query,
  fullDate,
  radius,
  color,
  selectedQuery,
  selectedFullDate,
  obscure,
  category,
  onSelect,
}) => {
  const isSamePoint =
    selectedQuery === query &&
    selectedFullDate?.getTime() === fullDate.getTime();

  const tooltipRef = useRef(null);
  const [tooltipHeight, setTooltipHeight] = useState(80);
  const [visible, setVisible] = useState(false);
  const [animatingOut, setAnimatingOut] = useState(false);
  const isTouch = window.matchMedia("(pointer: coarse)").matches;
  const isBeforeNoon = fullDate.getHours() < 12;

  // Track visibility state
  useEffect(() => {
    if (isSamePoint) {
      setVisible(true);
      setAnimatingOut(false);
    } else if (visible) {
      setAnimatingOut(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setAnimatingOut(false);
      }, 200); // match fade-out duration
      return () => clearTimeout(timer);
    }
  }, [isSamePoint, visible]);

  useEffect(() => {
    if (tooltipRef.current) {
      setTooltipHeight(tooltipRef.current.offsetHeight);
    }
  }, [visible]);

  const handleMouseEnter = () => {
    if (!isTouch) onSelect({ query, fullDate, x, y });
  };

  const handleMouseLeave = () => {
    if (isSamePoint && !isTouch) onSelect(null);
  };

  const tooltipY = isBeforeNoon
    ? y + radius + 8
    : y - radius - tooltipHeight - 8;

  return (
    <>
      <g
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => {
          if (isTouch) {
            onSelect({ query, fullDate, x, y });
          }
        }}
      >
        {isSamePoint && (
          <circle
            cx={x}
            cy={y}
            r={radius * 3.5}
            fill="none"
            stroke={color}
            strokeWidth={2}
            className="animate-growRing"
            style={{
              transformOrigin: `${x}px ${y}px`,
            }}
          />
        )}

        <circle
          cx={x}
          cy={y}
          r={isSamePoint ? radius * 1.2 : radius}
          fill={color}
          opacity={obscure ? (isSamePoint ? 0.85 : 0.6) : 0.85}
          style={{
            filter: !isSamePoint && obscure ? "blur(1px)" : "none",
          }}
          className="cursor-pointer transition-all duration-200"
        />
      </g>

      {visible && (
        <foreignObject
          x={x - 125}
          y={tooltipY - 20 * (isBeforeNoon ? -1 : 1)}
          width={250}
          height={tooltipHeight + 20}
          className="z-90"
        >
          <div
            ref={tooltipRef}
            className={`rounded-md text-xs leading-tight shadow-md z-90 ${
              animatingOut ? "animate-tooltipFadeOut" : "animate-tooltipFadeIn"
            }`}
            style={{
              backgroundColor: color,
              transformOrigin: isBeforeNoon ? "top center" : "bottom center",
            }}
          >
            {isTouch && (
              <div
                className="relative top-2 right-[-222px] cursor-pointer"
                onClick={() => {
                  onSelect(null);
                }}
              >
                <p
                  className="absolute pt-[2px] bg-red-500/90 border-black/50 p-auto text-center rounded-full  w-[20px] h-[20px]"
                  style={{ fontFamily: "Noto Sans JP" }}
                >
                  ×
                </p>
              </div>
            )}
            <div className="py-2 px-5" style={{ fontFamily: "Noto Sans JP" }}>
              <p className="text-xs ">
                SEARCHED AT {fullDate.toLocaleTimeString()}
              </p>
              <p className="text-lg font-medium my-2">"{query}"</p>
            </div>
            <div className="h-[0.3px] w-full bg-[#444]" />
            <div className="py-2 px-5">
              <p className="text-sm" style={{ fontFamily: "Noto Sans JP" }}>
                {category}
              </p>
            </div>
          </div>
        </foreignObject>
      )}
    </>
  );
};

export default Datapoint;
