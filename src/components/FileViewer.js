import React, { useState, useMemo } from "react";
import { convertMicrosecondsToDate, parseBrowserHistory, getDomainFromUrl } from "../utils/fileParser"; // adjust path

// Components for Row, Group, and Pagination
import Row from "./Row";
import Group from "./Group";
import PaginationControls from "./PaginationControls";

const FileViewer = ({ fileName, rawJson }) => {
  const [expandedGroups, setExpandedGroups] = useState({});
  const [page, setPage] = useState(1);
  const pageSize = 50;

  const entries = useMemo(() => parseBrowserHistory(rawJson), [rawJson]);
  const totalPages = Math.ceil(entries.length / pageSize);

  const groupedVisibleData = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const slice = entries.slice(start, end).map(entry => ({
      title: entry.title ?? "",
      url: entry.url ?? "",
      time: entry.time_usec ? convertMicrosecondsToDate(entry.time_usec) : "",
      icon_url: entry.favicon_url ?? "",
      domain: getDomainFromUrl(entry.url),
    }));

    const grouped = [];
    let currentGroup = [];

    for (let i = 0; i < slice.length; i++) {
      const current = slice[i];
      const prev = slice[i - 1];

      if (i === 0 || current.domain === prev.domain) {
        currentGroup.push(current);
      } else {
        if (currentGroup.length > 1) {
          grouped.push({ type: "group", icon_url: currentGroup[0].icon_url, items: currentGroup, groupName: currentGroup[0].domain });
        } else {
          grouped.push({ type: "item", data: currentGroup[0] });
        }
        currentGroup = [current];
      }
    }

    if (currentGroup.length > 1) {
      grouped.push({ type: "group", icon_url: currentGroup[0].icon_url, items: currentGroup, groupName: currentGroup[0].domain });
    } else if (currentGroup.length === 1) {
      grouped.push({ type: "item", data: currentGroup[0] });
    }

    return grouped;
  }, [entries, page]);

  if (entries.length === 0) {
    return (
      <div className="p-4">
        <h2 className="font-bold mb-4">Viewing: {fileName}</h2>
        <div>No data</div>
      </div>
    );
  }

  return (
    <div className="py-4">
      <h2 className="font-bold mb-4">Viewing: {fileName}</h2>

      <div className="overflow-x-auto h-[500px] border">
        <div className="w-full border border-gray-300">
          {/* Column Headers (Using divs instead of table headers) */}
          <div className="flex bg-gray-200/85 backdrop-blur-sm sticky top-[-3px] z-10">
            <div className="border px-4 py-2 w-3/4">URL</div>
            <div className="border px-4 py-2 w-1/4">Time</div>
          </div>

          {/* Rows */}
          <div>
            {groupedVisibleData.map((entry, i) => {
              if (entry.type === "item") {
                return <Row key={`item-${i}`} row={entry.data} />;
              } else if (entry.type === "group") {
                return (
                  <Group
                    key={`group-${i}`}
                    entry={entry}
                    isExpanded={expandedGroups[i]}
                    toggleExpand={() =>
                      setExpandedGroups(prev => ({ ...prev, [i]: !prev[i] }))
                    }
                  />
                );
              }
              return null;
            })}
          </div>
        </div>
      </div>

      {/* Pagination Controls */}
      <PaginationControls
        page={page}
        totalPages={totalPages}
        setPage={setPage}
      />
    </div>
  );
};

export default FileViewer;
