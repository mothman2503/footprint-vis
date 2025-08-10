import React, { useState, useRef, useEffect } from "react";
import { IAB_CATEGORIES } from "../assets/constants/iabCategories";
import { ChevronDown, ChevronUp, EyeOff, Eye } from "lucide-react";
import { useCategoryFilter } from "../CategoryFilterContext";

const Legend = () => {
  const [expanded, setExpanded] = useState(false);
  const containerRef = useRef();

  const { state, dispatch } = useCategoryFilter();
  const hidden = new Set(state.excludedCategoryIds);

  const toggleCategory = (id) => {
    dispatch({ type: "TOGGLE_CATEGORY", payload: id });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sort: visible first, then hidden
  const sortedCategories = [
    ...IAB_CATEGORIES.filter((cat) => !hidden.has(cat.id)),
    ...IAB_CATEGORIES.filter((cat) => hidden.has(cat.id)),
  ];

  return (
    <div ref={containerRef} className="relative z-40">
      {/* Fake space so layout doesn't shift */}
      <div className="h-12" />

      <div
        className={`absolute bottom-0 left-0 w-full px-4 border-t border-b border-gray-700 bg-gray-900 shadow-xl transition-all duration-300 ${
          expanded ? "py-3" : "py-2 max-h-12"
        } overflow-hidden`}
      >
        {/* Gradient hint at top */}
        {!expanded && (
          <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-b from-gray-900 to-transparent z-10 pointer-events-none" />
        )}

        {/* Categories */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 items-center text-sm whitespace-nowrap pr-10 relative z-20">
          {sortedCategories.map((cat) => {
            const isHidden = hidden.has(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={`flex items-center gap-2 h-[28px] px-2 rounded cursor-pointer transition-all border ${
                  isHidden
                    ? "opacity-40 grayscale border-gray-700"
                    : "border-transparent"
                } hover:border-white`}
                title={isHidden ? "Click to show category" : "Click to hide category"}
              >
                <span
                  className="w-3 h-3 rounded-full inline-block"
                  style={{ backgroundColor: cat.color }}
                ></span>
                <span
                  className="text-sm text-white font-medium"
                  style={{ fontFamily: "Noto Sans JP" }}
                >
                  {cat.name}
                </span>
                <span className="text-white">
                  {isHidden ? <EyeOff size={14} /> : <Eye size={14} />}
                </span>
              </button>
            );
          })}
        </div>

        {/* Expand/collapse button */}
        <button
          className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-400 hover:text-white p-1 bg-gray-800 rounded z-30"
          onClick={() => setExpanded((prev) => !prev)}
          title={expanded ? "Collapse legend" : "Expand legend"}
        >
          {expanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
      </div>
    </div>
  );
};

export default Legend;
