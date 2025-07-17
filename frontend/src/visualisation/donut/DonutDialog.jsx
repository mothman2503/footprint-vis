import DonutChart from "./DonutChart"; // adjust path

const DonutDialog = ({ open, onClose, data }) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-[#1e1e1e] p-6 rounded-xl shadow-2xl max-w-[90vw]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-white text-lg mb-4">Category Breakdown</h2>
        <DonutChart data={data} size={250} strokeWidth={40} disableDialog />
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default DonutDialog;
