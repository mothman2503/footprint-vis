const ClassificationDialog = ({
  open,
  onClose,
  onClassify,
  loading,
  errorInfo,
  progress = 0,
}) => {
  if (!open) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-[420px] bg-gradient-to-br from-[#0f1718] via-[#111c1f] to-[#17242a] border border-[#1f2c30] shadow-2xl rounded-2xl text-white p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold">Classify queries?</p>
            <p className="text-sm text-gray-300">
              We will send your queries to the classifier and update categories.
            </p>
          </div>
        </div>

        {loading && (
          <div className="space-y-2 bg-white/5 border border-white/10 rounded-lg p-3">
            <div className="flex items-center justify-between text-xs text-gray-200">
              <span>Contacting classifier…</span>
              <span className="font-mono">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-blue-500 transition-all duration-200"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        )}

        {errorInfo && (
          <div className="bg-red-500/10 border border-red-500/40 text-red-100 text-xs rounded-lg p-3 overflow-auto max-h-40">
            <strong>Error:</strong> {errorInfo.message}
            <pre className="mt-2 text-[11px] leading-tight text-red-200">
              {JSON.stringify(errorInfo.input, null, 2).slice(0, 1000)}
            </pre>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-3 py-2 text-sm rounded-lg border border-gray-600 text-gray-200 hover:bg-gray-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={onClassify}
            className="px-3 py-2 text-sm rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-semibold shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
