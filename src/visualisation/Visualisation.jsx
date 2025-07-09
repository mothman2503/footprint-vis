import { useState } from "react";
import { useDataset } from "../DataContext";
import CalendarView from "./calendar/view/CalendarView";
import DatePicker from "./date-picker/DatePicker";

const Visualisation = () => {
  const { dataset } = useDataset();
  const [selectedDate, setSelectedDate] = useState(() => new Date());


  if (!dataset?.records?.length) {
    return (
      <p className="text-white text-center mt-10">
        ⚠️ No dataset selected. Please select or upload a dataset.
      </p>
    );
  }

  return (
    <>
      <CalendarView
        startDate={selectedDate}
        entries={dataset.records}
      />

      <div className="w-full h-8 bg-indigo-400" />

      <DatePicker
        startDate={selectedDate}
        onSelectDate={setSelectedDate}
      />
    </>
  );
};

export default Visualisation;
