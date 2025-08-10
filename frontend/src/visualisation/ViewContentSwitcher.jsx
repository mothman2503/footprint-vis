import { motion } from "framer-motion";
import MonthCategoryBarChart from "./charts/MonthCategoryBarChart";
import MonthlyCalendarView from "./calendar/months/MonthlyCalendarView";
import DailyCalendarView from "./calendar/days/DailyCalendarView";
import DonutChart from "./charts/Donut";
import CategoryTrendChart from "./charts/CategoryTrendChart";
import Viewer from "./datasets/Viewer";
import { IAB_CATEGORIES } from "../assets/constants/iabCategories";
import WordCloud from "./charts/WordCloud";

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
  const categoryData = Object.entries(
    dataset.records.reduce((acc, rec) => {
      const key = rec.category?.id || "uncategorized";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {})
  ).map(([id, value]) => {
    const cat = IAB_CATEGORIES.find((c) => c.id === id);
    return {
      label: cat?.name || "Uncategorized",
      color: cat?.color || "#888",
      value,
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="flex-grow overflow-auto relative h-full"
    >
      {viewMode === "By Month" ? (
        showGridLoading ? (
          <div className="h-full flex items-center justify-center text-white text-xl animate-pulse">
            Loading month view...
          </div>
        ) : <MonthlyCalendarView
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            numDays={numDays}
            searchCounts={searchCounts}
            onClose={() => setViewMode("calendar")}
            records={dataset.records}
            IAB_CATEGORIES={IAB_CATEGORIES}
          />
      ) : viewMode === "By Day" ? (
        <DailyCalendarView
          startDate={selectedDate}
          entries={dataset.records}
          numDays={numDays}
        />
      ) : viewMode === "Overview" ? (
        <>
          <CategoryTrendChart records={dataset.records} />

          <MonthCategoryBarChart data={categoryData} />
          <DonutChart data={categoryData} size={200} strokeWidth={30} />
          <WordCloud data={dataset.records} />
        </>
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
