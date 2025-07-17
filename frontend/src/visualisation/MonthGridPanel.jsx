import MonthGrid from "./MonthGrid";

const MonthGridPanel = ({
  startDate,
  searchCounts = {},
  onSelectDate,
  numDays,
  annotations = {},
  onClose,
  records,
}) => {
  const months = [];
  const currentYear = new Date().getFullYear();

  for (let year = 2020; year <= currentYear; year++) {
    for (let month = 0; month < 12; month++) {
      months.push(new Date(year, month, 1));
    }
  }

  return (
    <div className="h-full overflow-y-scroll z-30 shadow-inner px-4 py-6">
      <div className="flex justify-end items-center mb-4">
        <button
          className="text-indigo-600 hover:underline text-sm font-medium"
          onClick={onClose}
        >
          Close
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {months.map((monthStart, i) => (
          <MonthGrid
            key={i}
            monthStart={monthStart}
            searchCounts={searchCounts}
            startDate={startDate}
            numDays={numDays}
            annotations={annotations}
            onSelectDate={onSelectDate}
            records={records} // 👈 pass it down
          />
        ))}
      </div>
    </div>
  );
};

export default MonthGridPanel;
