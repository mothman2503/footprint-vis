import clsx from "clsx";

const areSameDay = (a, b) => a?.toDateString() === b?.toDateString();

const MonthGrid = ({ monthStart, startDate, numDays, annotations, onSelectDate }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const month = monthStart.getMonth();
  const year = monthStart.getFullYear();

  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  const firstDayIndex = start.getDay();

  const days = [];

  for (let i = firstDayIndex; i > 0; i--) {
    const d = new Date(start);
    d.setDate(d.getDate() - i);
    days.push({ date: d, isCurrentMonth: false });
  }

  for (let i = 1; i <= end.getDate(); i++) {
    days.push({ date: new Date(year, month, i), isCurrentMonth: true });
  }

  while (days.length % 7 !== 0) {
    const last = days[days.length - 1].date;
    const next = new Date(last);
    next.setDate(last.getDate() + 1);
    days.push({ date: next, isCurrentMonth: false });
  }

  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + (numDays - 1));

  return (
    <div className="w-full max-w-xs border rounded p-2">
      <div className="text-center font-semibold mb-1">
        {start.toLocaleString("default", { month: "long", year: "numeric" })}
      </div>
      <div className="grid grid-cols-7 text-xs font-medium text-gray-500 mb-1">
        {["S", "M", "T", "W", "T", "F", "S"].map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map(({ date, isCurrentMonth }, i) => {
          const key = date.toISOString().split("T")[0];
          const isStart = areSameDay(date, startDate);
          const inRange = date > startDate && date < endDate;
          const isEnd = areSameDay(date, endDate);
          const strength = annotations[key]?.strength ?? 0;

          const outlineStyle = isStart
            ? "border-l border-t border-b rounded-l"
            : isEnd
            ? "border-r border-t border-b rounded-r"
            : inRange
            ? "border-t border-b"
            : "";

          return (
            <button
              key={i}
              onClick={() => onSelectDate(date)}
              disabled={date > today || date < new Date(2020, 0, 1)}
              className={clsx(
                "text-xs p-1 border text-center transition font-semibold",
                {
                  "text-gray-400": !isCurrentMonth,
                  "hover:bg-indigo-100": isCurrentMonth,
                },
                outlineStyle
              )}
              style={{
                backgroundColor: strength
                  ? `rgba(79, 70, 229, ${Math.min(strength, 1)})`
                  : undefined,
              }}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MonthGrid;
