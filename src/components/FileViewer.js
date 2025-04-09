import React, { useState, useMemo } from "react";

// Microsecond time conversion
const convertMicrosecondsToDate = (microseconds) => {
  const seconds = microseconds / 1000000;
  return new Date(seconds * 1000).toLocaleString();
};

const FileViewer = ({ fileName, rawJson }) => {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  console.log("Raw JSON input:", rawJson);

  const entries = useMemo(() => {
    return rawJson?.["Browser History"] ?? [];
  }, [rawJson]);

  const totalPages = Math.ceil(entries.length / pageSize);

  // Memoized visible data
  const visibleData = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const slice = entries.slice(start, end);

    return slice.map((entry) => ({
      title: entry.title ?? "",
      url: entry.url ?? "",
      time: entry.time_usec ? convertMicrosecondsToDate(entry.time_usec) : "",
    }));
  }, [entries, page]);

  const headers = ["Title", "URL", "Time"];

  if (entries.length === 0) {
    return (
      <div className="p-4">
        <h2 className="font-bold mb-4">Viewing: {fileName}</h2>
        <div>No data</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="font-bold mb-4">Viewing: {fileName}</h2>

      <div className="overflow-x-auto">
        <table className="w-full table-auto border border-gray-300">
          <thead>
            <tr>
              {headers.map((header) => (
                <th key={header} className="border px-4 py-2 bg-gray-200">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleData.map((row, i) => (
              <tr key={i}>
                <td className="border px-4 py-2">{row.title}</td>
                <td
                  className="border px-4 py-2 text-blue-600 hover:underline cursor-pointer"
                  onClick={() => window.open(row.url, "_blank")}
                >
                  {row.url}
                </td>
                <td className="border px-4 py-2">{row.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span>Page {page} of {totalPages}</span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default FileViewer;
