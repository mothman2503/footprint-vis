import { cluster } from "d3";

const Datapoint = ({
  x,
  y,
  query,
  fullDate,
  radius,
  color,
  obscure,
  category,
  onSelect,
 selectedPoint
}) => {
  const isSelected =
    selectedPoint?.query === query &&
    selectedPoint?.fullDate?.getTime() === fullDate.getTime();

  const isTouch = window.matchMedia("(pointer: coarse)").matches;


  

  const handleMouseEnter = () => {
    if (!isTouch) onSelect({ query, fullDate, x, y, category });
  };

  const handleMouseLeave = () => {
    if (isSelected && !isTouch) onSelect(null);
  };
  return (
    <>
      <g
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => {
          if (isTouch) {
            onSelect({ query, fullDate, x, y, cluster });
          }
        }}
      >
        {isSelected && (
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
          r={isSelected ? radius * 1.2 : radius}
          fill={color}
          opacity={obscure ? (isSelected ? 0.85 : 0.6) : 0.85}
          style={{
            filter: !isSelected && obscure ? "blur(1px)" : "none",
          }}
          className="cursor-pointer transition-all duration-200"
        />
      </g>
    </>
  );
};

export default Datapoint;
