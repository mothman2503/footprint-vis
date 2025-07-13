import React from "react";
import { IAB_CATEGORIES } from "../assets/constants/iabCategories";

const Legend = () => {
  return (
    <div className="w-full overflow-x-auto py-2 px-4 border-t border-b border-gray-200">
      <div className="flex flex-wrap gap-x-6 gap-y-2 items-center text-sm whitespace-nowrap">
        {IAB_CATEGORIES.map((cat) => (
          <div key={cat.id} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full inline-block"
              style={{ backgroundColor: cat.color }}
            ></span>
            <span className="text-md text-white font-semibold text-center"
        style={{ fontFamily: "Noto Sans JP" }}>{cat.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Legend;
