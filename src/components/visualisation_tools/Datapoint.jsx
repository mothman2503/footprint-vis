const Datapoint = ({
  point,
  radius,
  obscure,
  onSelect,
 selectedPoint
}) => {
  const isSelected =
    selectedPoint?.query === point.query &&
    selectedPoint?.fullDate?.getTime() === point.fullDate.getTime();

  const isTouch = window.matchMedia("(pointer: coarse)").matches;


  

  const handleMouseEnter = () => {
    if (!isTouch) onSelect(point);
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
            onSelect(point);
          }
        }}
      >
        {isSelected && (
          <circle
            cx={point.clusteredX}
            cy={point.clusteredY}
            r={radius * 3.5}
            fill="none"
            stroke={point.category.color}
            strokeWidth={2}
            className="animate-growRing"
            style={{
              transformOrigin: `${point.clusteredX}px ${point.clusteredY}px`,
            }}
          />
        )}

        <circle
          cx={point.clusteredX}
          cy={point.clusteredY}
          r={isSelected ? radius * 1.2 : radius}
          fill={point.category.color}
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
