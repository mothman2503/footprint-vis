import React from "react";
import Row from "./Row";

const Group = ({ entry, isExpanded, toggleExpand }) => {
  return (
    <React.Fragment>
      <div className="flex cursor-pointer bg-gray-100" onClick={toggleExpand}>
        <div className="border px-3 py-2 flex items-center gap-2 w-full">
          <span className={`transform transition-transform ${isExpanded ? "rotate-90" : ""}`}>▶</span>
          {entry.icon_url  && (
          <img className="w-[20px] h-[20px] inline mr-4" src={entry.icon_url} alt="" />
        )}
          <span className="font-semibold">{entry.groupName ? `${entry.groupName} (${entry.items.length})` : `Group of ${entry.items.length} items`}</span>
        </div>
      </div>

      {/* Group Expansion */}
      <div
        style={{
          maxHeight: isExpanded ? `${entry.items.length * 65}px` : "0",
          opacity: isExpanded ? 1 : 0,
          transform: isExpanded ? "translateY(0)" : "translateY(-5px)",
          transition: "all 0.5s ease-in-out",
        }}
        className="overflow-hidden"
      >
        {entry.items.map((row, j) => (
          <Row key={`group-item-${j}`} row={row} />
        ))}
      </div>
    </React.Fragment>
  );
};

export default Group;
