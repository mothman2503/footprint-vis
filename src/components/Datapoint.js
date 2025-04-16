import React, { useState } from "react";

const Datapoint = ({ favicon, title, time }) => {
    const [hovered, setHovered] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);

    const handleClick = () => {
        setShowTooltip(prev => !prev);
    };

    const iconClass = (hovered || showTooltip) ? "w-5 h-5 z-50" : "w-4 h-4 mx-[2px]";

    return (
        <>
            <div className={`${iconClass} flex-shrink-0`}>
            {favicon ? (
                <img
                    src={favicon}
                    alt=""
                    className={`${iconClass} flex-shrink-0`}
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                    onClick={handleClick}
                />
            ) : (
                <div
                    className={`${iconClass} bg-indigo-500 rounded-full flex-shrink-0`}
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                    onClick={handleClick}
                />
            )}

{showTooltip && (
                <div className="absolute h-0 w-0">
                    <div className="absolute -left-1/2 font-bold text-sm mt-5 px-2 py-1 bg-slate-100 rounded shadow z-50 whitespace-nowrap  flex flex-col ">
                        "{title}" 
                    </div>
                </div>
            )}
            </div>

{showTooltip && (
  <div
    className={`fixed inset-0 h-dvh w-dvw z-0 bg-white/20 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${
      showTooltip ? "opacity-100" : "opacity-0"
    }`}
    onClick={handleClick}
  />
)}



            
        </>
    );
};

export default Datapoint;
