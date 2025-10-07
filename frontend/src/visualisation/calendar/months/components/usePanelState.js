import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import useMonthSummaries from "../../../../hooks/useMonthSummaries";
import { getDateArray } from "./dateRange";

export default function usePanelState({
  records = [],
  searchCounts = {},
  selectedDate,
  onSelectDate,
  numDays = 1,
  IAB_CATEGORIES = [],
  programmaticSettleMs = 840,
}) {
  // refs shared across layouts
  const monthRefs = useRef({});
  const dateRefs = useRef([]);
  const scrollRef = useRef();
  const gridComponentRef = useRef(null);

  // date window
  const minAllowedDate = useMemo(() => new Date(2000, 0, 1), []);
  const recordDates = useMemo(
    () =>
      records
        .map((r) => new Date(r.timestamp))
        .filter((d) => d > minAllowedDate),
    [records, minAllowedDate]
  );

  const minDate = useMemo(
    () => (recordDates.length ? new Date(Math.min(...recordDates)) : null),
    [recordDates]
  );
  const maxDate = useMemo(
    () => (recordDates.length ? new Date(Math.max(...recordDates)) : null),
    [recordDates]
  );

  const allDates = useMemo(
    () => (minDate && maxDate ? getDateArray(minDate, maxDate) : []),
    [minDate, maxDate]
  );

  const selectedStartDate = useMemo(
    () => (selectedDate ? new Date(selectedDate) : new Date()),
    [selectedDate]
  );

  const selectedEndDate = useMemo(() => {
    return selectedStartDate && numDays > 1
      ? new Date(selectedStartDate.getTime() + (numDays - 1) * 86400000)
      : selectedStartDate;
  }, [selectedStartDate, numDays]);

  // current month
  const [currentMonth, setCurrentMonth] = useState("");
  useEffect(() => {
    if (!allDates || allDates.length === 0) return;
    const selectedMonthKey = selectedDate
      ? format(selectedStartDate, "MMMM yyyy")
      : format(allDates[0], "MMMM yyyy");
    // keep old behavior: only set once on first mount
    setCurrentMonth((prev) => prev || selectedMonthKey);
  }, [allDates, selectedDate, selectedStartDate]);

  // summaries
  const monthSummaries = useMonthSummaries(
    records,
    IAB_CATEGORIES,
    minDate,
    maxDate
  );

  // programmatic scroll lock
  const programmaticRef = useRef(false);
  const scrollDebounceRef = useRef(null);
  const releaseTimerRef = useRef(null);

  const scrollToMonth = useCallback(
    (monthKey, { animated = true } = {}) => {
      if (!monthKey) return;
      programmaticRef.current = true;
      setCurrentMonth(monthKey);
      gridComponentRef.current?.scrollToMonth?.(monthKey, { animated });

      if (scrollDebounceRef.current) clearTimeout(scrollDebounceRef.current);
      if (releaseTimerRef.current) clearTimeout(releaseTimerRef.current);
      releaseTimerRef.current = setTimeout(() => {
        programmaticRef.current = false;
      }, programmaticSettleMs);
    },
    [programmaticSettleMs]
  );

  // run once guard
  const didInitialScroll = useRef(false);

  // if dataset window or selectedDate changes, allow one fresh initial snap
  useEffect(() => {
    didInitialScroll.current = false;
  }, [minDate, maxDate, selectedDate]);

  // *** INITIAL auto-scroll ***
  // on first render, scroll to the START of the month derived from selectedDate (if provided),
  // otherwise the dataset's first month. Use double rAF so GridContainer has measured.
  // *** INITIAL auto-scroll ***// Add dimensions state to know when grid has measured
const [gridReady, setGridReady] = useState(false);

// Inside usePanelState, after scrollRef setup:
useEffect(() => {
  function checkReady() {
    if (scrollRef.current?.offsetWidth > 0 && scrollRef.current?.offsetHeight > 0) {
      setGridReady(true);
    }
  }
  checkReady();
  window.addEventListener("resize", checkReady);
  return () => window.removeEventListener("resize", checkReady);
}, [scrollRef]);

// Initial auto-scroll — only run when grid is ready
useEffect(() => {
  if (didInitialScroll.current) return;
  if (!allDates || allDates.length === 0) return;
  if (!gridReady) return; // ⬅ wait for measurement

  const targetMonthKey = selectedDate
    ? format(selectedStartDate, "MMMM yyyy")
    : format(allDates[0], "MMMM yyyy");

  didInitialScroll.current = true;

  // double rAF to ensure react-window finishes layout
  let raf1, raf2;
  raf1 = requestAnimationFrame(() => {
    raf2 = requestAnimationFrame(() => {
      scrollToMonth(targetMonthKey, { animated: true });
    });
  });

  return () => {
    if (raf1) cancelAnimationFrame(raf1);
    if (raf2) cancelAnimationFrame(raf2);
  };
}, [allDates, selectedDate, selectedStartDate, scrollToMonth, gridReady]);


  // visible month handler
  const handleVisibleMonthChange = useCallback(
    (visibleMonthKeys) => {
      if (programmaticRef.current) return;
      if (!visibleMonthKeys || !visibleMonthKeys.length) return;

      if (scrollDebounceRef.current) clearTimeout(scrollDebounceRef.current);
      scrollDebounceRef.current = setTimeout(() => {
        const [firstVisibleMonth] = [...visibleMonthKeys].sort(
          (a, b) => new Date("1 " + a) - new Date("1 " + b)
        );
        if (firstVisibleMonth && firstVisibleMonth !== currentMonth) {
          setCurrentMonth(firstVisibleMonth);
        }
      }, 120);
    },
    [currentMonth]
  );

  useEffect(() => {
    return () => {
      if (scrollDebounceRef.current) clearTimeout(scrollDebounceRef.current);
      if (releaseTimerRef.current) clearTimeout(releaseTimerRef.current);
    };
  }, []);

  // mobile-only UI state
  const [isMonthModalOpen, setIsMonthModalOpen] = useState(false);
  const [expandChart, setExpandChart] = useState(false);

  return {
    // data
    recordDates,
    minDate,
    maxDate,
    allDates,
    selectedStartDate,
    selectedEndDate,
    monthSummaries,
    currentMonth,
    setCurrentMonth,

    // refs
    monthRefs,
    dateRefs,
    scrollRef,
    gridComponentRef,

    // handlers
    scrollToMonth,
    handleVisibleMonthChange,
    onSelectDate,

    // mobile ui state
    isMonthModalOpen,
    setIsMonthModalOpen,
    expandChart,
    setExpandChart,

    // passthrough
    searchCounts,
    records,
    IAB_CATEGORIES,
  };
}
