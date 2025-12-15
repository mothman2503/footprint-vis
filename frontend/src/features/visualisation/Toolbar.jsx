import { useState } from "react";
import { useTranslation } from "react-i18next";
import DatasetDropdown from "./DatasetDropdown";
import LanguageSwitch from "../../shared/components/LanguageSwitch";
import { Sparkles, CalendarDays, CalendarRange, BarChart3, Table2 } from "lucide-react";

const VIEW_OPTIONS = [
  { key: "Overview", labelKey: "views.overview", fallback: "Overview", icon: BarChart3 },
  { key: "By Month", labelKey: "views.byMonth", fallback: "By Month", icon: CalendarRange },
  { key: "By Day", labelKey: "views.byDay", fallback: "By Day", icon: CalendarDays },
  { key: "Table", labelKey: "views.table", fallback: "Table", icon: Table2 },
];

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
  const translatedViewOptions = VIEW_OPTIONS.map(({ labelKey, fallback, ...rest }) => ({
    ...rest,
    label: t(labelKey, { defaultValue: fallback || rest.key }),
  }));
  const activeView = translatedViewOptions.find((v) => v.key === viewMode) || translatedViewOptions[0];
  const viewLabel = t("toolbar.viewLabel", { defaultValue: "View" });

  return (
    <div className="w-full bg-[#131a1b]/90 backdrop-blur border-b border-white/10 relative z-50 py-1 sm:py-2 px-2 sm:px-6">
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-2 sm:gap-3">
        {/* Desktop / tablet */}
        <div className="hidden md:flex items-center justify-between gap-2 overflow-x-auto lg:overflow-visible flex-nowrap no-scrollbar min-h-[56px]">
          <div className="flex-1 min-w-[220px]">
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

          <div className="flex items-center gap-3 min-w-[240px] relative">
            <div className="relative flex-1">
              <button
                onClick={() => setDesktopViewsOpen((o) => !o)}
                className="w-full h-10 flex items-center justify-between rounded-md bg-white/5 border border-white/10 px-3 text-sm text-white"
              >
                <span className="flex items-center gap-2">
                  <activeView.icon size={16} />
                  {activeView.label}
                </span>
                <span className="text-[11px] uppercase tracking-[0.16em] text-white/70">
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
                      }`}
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
                className="w-full h-9 flex items-center justify-between rounded-lg bg-white/5 border border-white/10 px-3 text-sm text-white shadow-[0_8px_20px_rgba(0,0,0,0.35)]"
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
                        }`}
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
