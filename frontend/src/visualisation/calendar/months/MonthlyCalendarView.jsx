import React, { useEffect } from "react";
import useIsMobile from "../../../hooks/useIsMobile";
import usePanelState from "./components/usePanelState";

import DesktopPanel from "./components/desktop/DesktopPanel";
import MobilePanel from "./components/mobile/MobilePanel";

export default function MonthlyCalendarView(props) {
  const isMobile = useIsMobile(768);

  const state = usePanelState(props);

  useEffect(() => {
    if (!isMobile) return;
    document.body.style.overflow = state.expandChart ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobile, state.expandChart]);

  if (!state.recordDates.length) {
    return (
      <div className="p-8 text-gray-400 bg-[#181e22] mt-5">
        No records after 2000.
      </div>
    );
  }

  return isMobile ? (
    <MobilePanel isMobile {...state} />
  ) : (
    <DesktopPanel {...state} />
  );
}
