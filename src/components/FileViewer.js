import React from "react";

const FileViewer = ({ fileName, data }) => {
  if (!data) return null;

  const renderData = () => {
    if (typeof data === "object") {
      // JSON format (pretty print)
      return <pre className="p-2 bg-gray-100 border">{JSON.stringify(data, null, 2)}</pre>;
    } else {
      // CSV format (render table)
      const rows = data.split("\n").map((row) => row.split(","));
      return (
        <table className="w-full border-collapse border border-gray-300 mt-2">
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border">
                {row.map((cell, j) => (
                  <td key={j} className="border p-2">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
  };

  return (
    <div className="mt-4 p-4 max-h-svh overflow-y-auto border border-gray-300">
      <h3 className="font-bold mb-2">Viewing: {fileName}</h3>
      {renderData()}
    </div>
  );
};

export default FileViewer;
