import { motion } from "framer-motion";
import MonthlyCalendarView from "./calendar/months/MonthlyCalendarView";
import DailyCalendarView from "./calendar/days/DailyCalendarView";
import OverviewDashboard from "./OverviewDashboard";
import Viewer from "./datasets/Viewer";
import { IAB_CATEGORIES } from "../../assets/constants/iabCategories";

const ViewContentSwitcher = ({
  viewMode,
  showGridLoading,
  dataset,
  selectedDate,
  setSelectedDate,
  numDays,
  setViewMode,
  searchCounts,
}) => {

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className={`flex-grow relative h-full ${
        viewMode === "By Day" ? "overflow-hidden" : "overflow-auto"
      }`}
    >
      {viewMode === "By Month" ? (
        showGridLoading ? (
          <div className="h-full flex items-center justify-center text-white text-xl animate-pulse">
            Loading month view...
          </div>
        ) : (
          <MonthlyCalendarView
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            numDays={numDays}
            searchCounts={searchCounts}
            onClose={() => setViewMode("calendar")}
            records={dataset.records}
            IAB_CATEGORIES={IAB_CATEGORIES}
          />
        )
      ) : viewMode === "By Day" ? (
        <DailyCalendarView
          startDate={selectedDate}
          entries={dataset.records}
          numDays={numDays}
        />
      ) : viewMode === "Overview" ? (
        <OverviewDashboard
          dataset={dataset}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          setViewMode={setViewMode}
        />
      ) : viewMode === "Table" ? (
        <Viewer />
      ) : (
        <div className="h-full flex items-center justify-center text-white text-xl">
          Placeholder for {viewMode}
        </div>
      )}
    </motion.div>
  );
};

export default ViewContentSwitcher;
