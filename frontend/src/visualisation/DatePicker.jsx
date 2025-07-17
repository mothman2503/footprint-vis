import * as d3 from "d3";

const DatePicker = ({ startDate, onToggle, numDays = 7 }) => {
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + (numDays - 1));

  const title = startDate
    ? `${d3.timeFormat("%b %d, %Y")(startDate)}${
        numDays > 1 ? ` - ${d3.timeFormat("%b %d, %Y")(endDate)}` : ""
      }`
    : "Select Date";

  return (
    <h3
      onClick={onToggle}
      className="text-md text-white font-semibold text-center cursor-pointer"
      style={{ fontFamily: "Noto Sans JP" }}
    >
      {title}
    </h3>
  );
};

export default DatePicker;
