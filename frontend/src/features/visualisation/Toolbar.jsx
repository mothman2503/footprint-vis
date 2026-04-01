import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import DatasetDropdown from "./DatasetDropdown";
import LanguageSwitch from "../../shared/components/LanguageSwitch";
import {
  Sparkles,
  CalendarDays,
  CalendarRange,
  LineChart,
  LayoutDashboard,
  Table2,
} from "lucide-react";

const VIEW_OPTIONS = [
  { key: "Overview", icon: LineChart },
  { key: "Dashboard", icon: LayoutDashboard },
  { key: "By Month", icon: CalendarRange },
  { key: "By Day", icon: CalendarDays },
  { key: "Table", icon: Table2 },
];

const getViewLabel = (viewKey, t) => {
  switch (viewKey) {
    case "Overview":
      return t("views.overview", { defaultValue: "Overview" });
    case "Dashboard":
      return t("views.dashboard", { defaultValue: "Dashboard" });
    case "By Month":
      return t("views.byMonth", { defaultValue: "By Month" });
    case "By Day":
      return t("views.byDay", { defaultValue: "By Day" });
    case "Table":
      return t("views.table", { defaultValue: "Table" });
    default:
      return viewKey;
  }
};

const DatasetToolbar = ({
  datasetLabel,
  onSetDataset,
  onStartClassification,
  savedDatasets,
  sampleDatasets,
  onRefreshDatasets,
  onDatasetSaved,
  viewMode,
  onChangeViewMode,
  promptOpen = false,
}) => {
  const { t } = useTranslation();
  const [mobileViewsOpen, setMobileViewsOpen] = useState(false);
  const [desktopViewsOpen, setDesktopViewsOpen] = useState(false);
  const desktopDropdownRef = useRef(null);
  const translatedViewOptions = VIEW_OPTIONS.map((option) => ({
    ...option,
    label: getViewLabel(option.key, t),
  }));
  const activeView = translatedViewOptions.find((v) => v.key === viewMode) || translatedViewOptions[0];
  const viewLabel = t("toolbar.viewLabel", { defaultValue: "View" });

  useEffect(() => {
    const handlePointerOutside = (e) => {
      if (
        desktopDropdownRef.current &&
        !desktopDropdownRef.current.contains(e.target)
      ) {
        setDesktopViewsOpen(false);
      }
    };

    const canUsePointerEvents =
      typeof window !== "undefined" && "PointerEvent" in window;

    if (canUsePointerEvents) {
      document.addEventListener("pointerdown", handlePointerOutside);
      return () => document.removeEventListener("pointerdown", handlePointerOutside);
    }

    document.addEventListener("mousedown", handlePointerOutside);
    document.addEventListener("touchstart", handlePointerOutside, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handlePointerOutside);
      document.removeEventListener("touchstart", handlePointerOutside);
    };
  }, []);

  return (
    <div className="w-full bg-[#131a1b]/90 backdrop-blur border-b border-white/10 relative z-50 py-1 sm:py-2 px-2 sm:px-6">
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-2 sm:gap-3">
        {/* Desktop / tablet */}
        <div className="hidden md:flex items-center justify-between gap-2 overflow-visible flex-wrap lg:flex-nowrap min-h-[56px]">
          <div className="flex-1 min-w-[220px] md:min-w-[280px]">
            <DatasetDropdown
              value={datasetLabel}
              datasets={[...sampleDatasets, ...savedDatasets]}
              onChange={onSetDataset}
              onRefresh={onRefreshDatasets}
              onDatasetSaved={onDatasetSaved}
              promptOpen={promptOpen}
              className="w-full h-full"
            />
          </div>

          <div className="flex items-center gap-3 min-w-0 w-full lg:w-auto lg:min-w-[240px] relative" ref={desktopDropdownRef}>
            <div className="relative flex-1">
              <button
                onClick={() => setDesktopViewsOpen((o) => !o)}
                className="w-full h-10 flex items-center justify-between rounded-md bg-white/5 border border-white/10 px-3 text-sm text-white touch-manipulation"
              >
                <span className="flex items-center gap-2">
                  <activeView.icon size={16} />
                  {activeView.label}
                </span>
                <span className="text-[11px] ml-3 uppercase tracking-[0.16em] text-white/70">
                  {viewLabel}
                </span>
              </button>
              {desktopViewsOpen && (
                <div className="absolute mt-1 w-full rounded-md border border-white/10 bg-[#0f1619] shadow-lg overflow-hidden z-30">
                  {translatedViewOptions.map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => {
                        onChangeViewMode?.(key);
                        setDesktopViewsOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition ${
                        viewMode === key
                          ? "bg-white/10 text-white"
                          : "text-white/80 hover:bg-white/5"
                      } touch-manipulation`}
                    >
                      <Icon size={14} />
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 ml-auto flex-none">
              <LanguageSwitch />
              <button
                onClick={onStartClassification}
                className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-pink-500 via-violet-500 to-blue-500 hover:from-pink-400 hover:to-blue-400 text-white shadow-lg transition-all duration-200"
                title="Classify queries"
              >
                <Sparkles className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile */}
        <div className="flex md:hidden flex-col gap-2">
          <DatasetDropdown
            value={datasetLabel}
            datasets={[...sampleDatasets, ...savedDatasets]}
            onChange={onSetDataset}
            onRefresh={onRefreshDatasets}
            onDatasetSaved={onDatasetSaved}
            promptOpen={promptOpen}
            className="w-full"
          />

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <button
                onClick={() => setMobileViewsOpen((o) => !o)}
                className="w-full h-9 flex items-center justify-between rounded-lg bg-white/5 border border-white/10 px-3 text-sm text-white shadow-[0_8px_20px_rgba(0,0,0,0.35)] touch-manipulation"
              >
                <span className="flex items-center gap-2">
                  <activeView.icon size={16} />
                  {activeView.label}
                </span>
                <span className="text-[11px] uppercase tracking-[0.16em] text-white/70">
                  {viewLabel}
                </span>
              </button>

              {mobileViewsOpen && (
                <>
                  <div className="absolute mt-1 w-full rounded-xl border border-white/10 bg-[#0f1619] shadow-2xl overflow-hidden z-20">
                    {translatedViewOptions.map(({ key, label, icon: Icon }) => (
                      <button
                        key={key}
                        onClick={() => {
                          onChangeViewMode?.(key);
                          setMobileViewsOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition ${
                          viewMode === key
                            ? "bg-white/10 text-white"
                            : "text-white/80 hover:bg-white/5"
                        } touch-manipulation`}
                      >
                        <Icon size={14} />
                        {label}
                      </button>
                    ))}
                  </div>
                  <button
                    className="fixed inset-0 z-10 cursor-default"
                    aria-label="Close view menu"
                    onClick={() => setMobileViewsOpen(false)}
                  />
                </>
              )}
            </div>
            <div className="flex items-center gap-1 flex-none">
              <LanguageSwitch />
              <button
                onClick={onStartClassification}
                className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-pink-500 via-violet-500 to-blue-500 hover:from-pink-400 hover:to-blue-400 text-white shadow-lg transition-all duration-200"
                title="Classify queries"
              >
                <Sparkles className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default DatasetToolbar;
