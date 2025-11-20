import { useEffect, useState } from "react";
import { motion, useDragControls } from "framer-motion";
import {
  GripVertical,
  PanelRight,
  CalendarRange,
  CalendarDays,
  BarChart3,
  Table2,
} from "lucide-react";

const EDGE_OFFSET = 4;
const MENU_WIDTH = 190;

const VIEWS = [
  { key: "Overview", label: "Overview", icon: BarChart3 },
  { key: "By Month", label: "By Month", icon: CalendarRange },
  { key: "By Day", label: "By Day", icon: CalendarDays },
  { key: "Table", label: "Table", icon: Table2 },
];

const MovableViewMenu = ({ viewMode, setViewMode }) => {
  const [top, setTop] = useState(120);
  const [viewportHeight, setViewportHeight] = useState(() => window.innerHeight);
  const dragControls = useDragControls();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => setViewportHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const clampTop = (next) =>
    Math.max(12, Math.min(viewportHeight - 140, next));

  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 60 }}
      transition={{ duration: 0.25 }}
      drag="y"
      dragListener={false}
      dragControls={dragControls}
      dragConstraints={{ top: 12, bottom: viewportHeight - 140 }}
      onDragEnd={(_, info) => setTop((t) => clampTop(t + info.offset.y))}
      style={{
        position: "fixed",
        top: clampTop(top),
        right: EDGE_OFFSET,
        width: collapsed ? 44 : MENU_WIDTH,
        zIndex: 50,
      }}
      className="text-white"
    >
      {collapsed ? (
        <button
          onMouseDown={(e) => dragControls.start(e)}
          onClick={() => setCollapsed(false)}
          className="w-full h-12 flex items-center justify-center rounded-l-xl bg-[#0f171c] border border-white/10 shadow-lg hover:border-white/20 transition"
          title="Open view switcher"
        >
          <PanelRight size={18} />
        </button>
      ) : (
        <div className="rounded-2xl bg-gradient-to-br from-[#0f171c] via-[#111f26] to-[#0c1418] border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.45)] overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
            <button
              onMouseDown={(e) => dragControls.start(e)}
              className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/60 cursor-grab"
            >
              <GripVertical size={16} />
              Views
            </button>
            <button
              onClick={() => setCollapsed(true)}
              className="text-white/70 hover:text-white"
              title="Collapse"
            >
              <PanelRight size={16} />
            </button>
          </div>

          <div className="flex flex-col divide-y divide-white/5">
            {VIEWS.map(({ key, label, icon: Icon }) => {
              const active = viewMode === key;
              return (
                <button
                  key={key}
                  onClick={() => setViewMode(key)}
                  className={`flex items-center gap-3 px-3 py-2 text-sm text-left transition ${
                    active
                      ? "bg-white text-black font-semibold"
                      : "hover:bg-white/10 text-white"
                  }`}
                >
                  <span
                    className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                      active ? "bg-black/10" : "bg-white/5"
                    }`}
                  >
                    <Icon size={16} />
                  </span>
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default MovableViewMenu;
