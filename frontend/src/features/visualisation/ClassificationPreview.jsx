// components/ClassificationPreview.jsx
import React from "react";

const ClassificationPreview = ({ results, onApply, onCancel }) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-2xl bg-[#0f1718] border border-[#1f2c30] rounded-2xl shadow-2xl text-white">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Classification preview</h2>
            <p className="text-sm text-gray-300">
              Review categories before applying updates to your dataset.
            </p>
          </div>
          <div className="text-sm text-gray-300">
            {results.length} queries
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-6 py-4 space-y-2">
          {results.map((res, i) => (
            <div
              key={`${res.query}-${i}`}
              className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
            >
              <span className="text-xs text-gray-400 font-mono w-10 shrink-0">
                #{i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-sm text-white truncate">{res.query}</p>
                <p
                  className="inline-flex items-center gap-2 text-xs mt-1 px-2 py-1 rounded-full bg-black/30 border border-white/10"
                  style={{ color: res.category.color }}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: res.category.color }}
                  />
                  {res.category.name}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-white/10">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-lg border border-gray-600 text-gray-200 hover:bg-gray-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={onApply}
            className="px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-semibold shadow-lg"
          >
            Apply changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClassificationPreview;

