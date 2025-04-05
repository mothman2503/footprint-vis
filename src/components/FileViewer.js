import React, { useState } from "react";
import { parseData } from "../utils/fileParser";

const FileViewer = ({ fileName, data }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [hoveredRowIndex, setHoveredRowIndex] = useState(null);

  if (!data) return null;

  const entriesPerPage = 10;
  const tableData = parseData(data);
  const totalPages = Math.ceil((tableData.length - 1) / entriesPerPage);

  const groupRowsByTitle = () => {
    const groupedData = [];
    let currentGroup = [];
    let previousGroupKey = null;
  
    tableData.slice(1).forEach((row) => {
      const title = row[0]; // Assuming title is the first column
      const groupKeyMatch = title.match(/- ([^-]+)$/);
      const groupKey = groupKeyMatch ? groupKeyMatch[1].trim() : title;
  
      if (groupKey === previousGroupKey) {
        currentGroup.push(row); // Continue grouping if same as previous
      } else {
        if (currentGroup.length > 0) {
          groupedData.push(currentGroup); // Push previous group
        }
        currentGroup = [row]; // Start a new group
      }
  
      previousGroupKey = groupKey;
    });
  
    if (currentGroup.length > 0) {
      groupedData.push(currentGroup); // Push last group
    }
  
    return groupedData;
  };

  const groupedData = groupRowsByTitle();

  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    return groupedData.slice(startIndex, endIndex);
  };

  const toggleGroup = (index) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleRowMouseEnter = (index) => {
    setHoveredRowIndex(index);
  };

  const handleRowMouseLeave = () => {
    setHoveredRowIndex(null);
  };

  const handleCellClick = (url) => {
    if (url) {
      window.open(url, "_blank");
    }
  };

  const renderTable = () => {
    const paginatedData = getPaginatedData();
    return (
      <div className="max-h-svh overflow-y-auto">
        <table className="w-full border-collapse border border-gray-300 mt-2 table-fixed">
          <thead>
            <tr>
              {tableData[0].map((header, index) => (
                <th key={index} className="border p-2 bg-gray-200">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((group, groupIndex) => {
              // Extract the group key for each group
              const title = group[0][0]; // Assuming title is the first column
              const groupKeyMatch = title.match(/- ([^-]+)$/);
              const groupKey = groupKeyMatch ? groupKeyMatch[1].trim() : title;

              return (
                <React.Fragment key={groupIndex}>
                  {group.length > 1 && (
                    <tr>
                      <td colSpan={tableData[0].length} className="text-left p-2">
                        <button
                          onClick={() => toggleGroup(groupIndex)}
                          className="text-blue-500 hover:text-blue-600"
                        >
                          {expandedGroups[groupIndex] ? "▼" : "▶"} {groupKey} ({group.length})
                        </button>
                      </td>
                    </tr>
                  )}

                  {expandedGroups[groupIndex] && group.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className="border"
                      onMouseEnter={() => handleRowMouseEnter(`${groupIndex}-${rowIndex}`)}
                      onMouseLeave={handleRowMouseLeave}
                    >
                      {row.map((cell, cellIndex) => {
                        const url = row[1]; // Assuming URL is in the second column
                        const isHovered = hoveredRowIndex === `${groupIndex}-${rowIndex}`;
                        return (
                          <td
                            key={cellIndex}
                            className="border p-2 overflow-hidden"
                            style={{
                              whiteSpace: isHovered ? "normal" : "nowrap",
                              wordWrap: "break-word",
                              cursor: url ? "pointer" : "default",
                            }}
                            onClick={() => handleCellClick(url)}
                          >
                            {cell}
                          </td>
                        );
                      })}
                    </tr>
                  ))}

                  {group.length === 1 && group.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className="border"
                      onMouseEnter={() => handleRowMouseEnter(`${groupIndex}-${rowIndex}`)}
                      onMouseLeave={handleRowMouseLeave}
                    >
                      {row.map((cell, cellIndex) => {
                        const url = row[1]; // Assuming URL is in the second column
                        const isHovered = hoveredRowIndex === `${groupIndex}-${rowIndex}`;
                        return (
                          <td
                            key={cellIndex}
                            className="border p-2 overflow-hidden"
                            style={{
                              whiteSpace: isHovered ? "normal" : "nowrap",
                              wordWrap: "break-word",
                              cursor: url ? "pointer" : "default",
                            }}
                            onClick={() => handleCellClick(url)}
                          >
                            {cell}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="mt-4 p-4 border border-gray-300">
      <h3 className="font-bold mb-2">Viewing: {fileName}</h3>
      {renderTable()}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={`p-2 rounded ${currentPage === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"}`}
        >
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className={`p-2 rounded ${currentPage === totalPages ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"}`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default FileViewer;
