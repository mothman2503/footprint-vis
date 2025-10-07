const ClassificationDialog = ({ open, onClose, onClassify, loading, errorInfo }) => {
  if (!open) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white p-6 rounded shadow-md text-black space-y-4 w-[360px] max-h-[80vh] overflow-y-auto">
        <p>Classify queries in the selected date range?</p>

        {errorInfo && (
          <div className="bg-red-50 border border-red-400 text-red-700 text-xs rounded p-2 overflow-auto max-h-40">
            <strong>Error:</strong> {errorInfo.message}
            <pre className="mt-1 text-[11px] leading-tight">
              {JSON.stringify(errorInfo.input, null, 2).slice(0, 1000)} {/* just print more of it */}
            </pre>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 bg-gray-300 rounded">
            Cancel
          </button>
          <button
            onClick={onClassify}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Classifying..." : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClassificationDialog;
