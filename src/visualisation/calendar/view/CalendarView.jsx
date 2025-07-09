import { useMediaQuery } from "react-responsive";
import DailyCalendarView from "./DailyCalendarView";
import WeeklyCalendarView from "./WeeklyCalendarView";

const CalendarView = ({ startDate, entries }) => {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);

  return isMobile ? (
    <DailyCalendarView startDate={startDate} entries={entries} />
  ) : (
    <WeeklyCalendarView
      startDate={startDate}
      endDate={endDate}
      entries={entries}
    />
  );
};

export default CalendarView;
