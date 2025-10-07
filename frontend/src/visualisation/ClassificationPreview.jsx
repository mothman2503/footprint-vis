// components/ClassificationPreview.jsx
import React from "react";

const ClassificationPreview = ({ results, onApply, onCancel }) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
      <div className="bg-white p-6 rounded shadow-md text-black w-[400px] max-h-[80vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-3">Classification Preview</h2>
        <ul className="space-y-2 text-sm">
          {results.map((res, i) => (
            <li key={i} className="flex justify-between border-b pb-1">
              <span className="text-gray-800 font-mono">{res.query}</span>
              <span className="font-semibold" style={{ color: res.category.color }}>
                {res.category.name}
              </span>
            </li>
          ))} 
        </ul>

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onCancel} className="px-3 py-1 bg-gray-300 rounded">
            Cancel
          </button>
          <button
            onClick={onApply}
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClassificationPreview;
