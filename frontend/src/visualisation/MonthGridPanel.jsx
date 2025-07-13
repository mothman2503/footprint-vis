import MonthGrid from "./MonthGrid";

const MonthGridPanel = ({ startDate, onSelectDate, numDays, annotations = {}, onClose }) => {
  const months = [];
  const currentYear = new Date().getFullYear();
  for (let year = 2020; year <= currentYear; year++) {
    for (let month = 0; month < 12; month++) {
      months.push(new Date(year, month, 1));
    }
  }

  return (
    <div className="h-full overflow-y-scroll bg-white z-40 shadow-inner px-4 py-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Select Start Date</h2>
        <button
          className="text-indigo-600 hover:underline text-sm font-medium"
          onClick={onClose}
        >
          Close
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {months.map((monthStart, i) => (
          <MonthGrid
            key={i}
            monthStart={monthStart}
            startDate={startDate}
            numDays={numDays}
            annotations={annotations}
            onSelectDate={onSelectDate}
          />
        ))}
      </div>
    </div>
  );
};

export default MonthGridPanel;
