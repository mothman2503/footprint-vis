import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { GripVertical, ChevronLeft, ChevronRight } from "lucide-react";

const EDGE_OFFSET = 0;
const MENU_WIDTH = 160;

const MovableViewMenu = ({ viewMode, setViewMode }) => {
  const [top, setTop] = useState(100);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const dragHandleRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setViewportHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleDragEnd = (_, info) => {
    const newTop = Math.max(
      0,
      Math.min(viewportHeight - 100, top + info.offset.y)
    );
    setTop(newTop);
  };

  if (isCollapsed) {
    return (
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: viewportHeight - 40 }}
        onDragEnd={handleDragEnd}
        style={{
          position: "fixed",
          top,
          right: EDGE_OFFSET,
          width: "40px",
          height: "40px",
          zIndex: 50,
          cursor: "grab",
        }}
        className="bg-gray-800 text-white flex items-center justify-center rounded-l hover:opacity-90 opacity-70"
        onClick={() => setIsCollapsed(false)}
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <ChevronLeft size={20} />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 60 }}
      transition={{ duration: 0.3 }}
      drag="y"
      dragListener={false} // disables drag from full component
      dragConstraints={{ top: 0, bottom: viewportHeight - 100 }}
      dragControls={undefined}
      onDragEnd={handleDragEnd}
      style={{
        position: "fixed",
        top,
        right: EDGE_OFFSET,
        width: MENU_WIDTH,
        zIndex: 50,
      }}
      className="bg-black bg-opacity-70 text-white rounded-l shadow-lg"
    >
      <div className="flex justify-between items-center px-2 py-2 bg-gray-900 rounded-tl">
        <div
          ref={dragHandleRef}
          className="cursor-grab p-1"
          onMouseDown={(e) => {
            const el = e.currentTarget.parentElement?.parentElement;
            if (el && el instanceof HTMLElement) {
              el.dispatchEvent(new MouseEvent("mousedown", e.nativeEvent));
            }
          }}
        >

          <GripVertical size={18} />
        </div>
        View 
        <button
          onClick={() => setIsCollapsed(true)}
          className="text-xs hover:text-gray-400 p-1"
        >
          <ChevronRight size={18} />
        </button>
      </div>
      {["By Day", "By Month", "Overview", "Table"].map((mode) => (
        <button
          key={mode}
          onClick={() => setViewMode(mode)}
          className={`w-full px-3 py-1 text-left hover:bg-white hover:text-black ${
            viewMode === mode ? "bg-white text-black font-bold" : ""
          }`}
        >
          {mode}
        </button>
      ))}
    </motion.div>
  );
};

export default MovableViewMenu;
