// Tooltip.jsx
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import CategoryDropdown from "../../../../../shared/components/CategoryDropdown";
import { IAB_CATEGORIES } from "../../../../../assets/constants/iabCategories";
import { useTranslation } from "react-i18next";

const getLocalizedCategoryLabel = (category, t) => {
  const fallbackName = category?.name || "uncategorized";
  const canonical =
    IAB_CATEGORIES.find((c) => c.id === String(category?.id))?.name || fallbackName;
  const bare = String(canonical).trim().replace(/^categories\./, "");
  const key = bare.toLowerCase() === "uncategorized" ? "uncategorized" : bare;
  const defaultLabel = key.replaceAll("_", " ");
  return t(`categories.${key}`, { defaultValue: defaultLabel });
};

const Tooltip = ({ point, radius, position, screen, onClose, onCategoryChange }) => {
  const tooltipRef = useRef(null);
  const [size, setSize] = useState({ width: 300, height: 80 });
  const { t } = useTranslation();

  useEffect(() => {
    if (tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      setSize({ width: rect.width || 300, height: rect.height || 80 });
    }
  }, [point]);

  if (!point || !position || !screen) return null;
  const { isBeforeNoon, isFirstDay, isLastDay } = position;

  // Base anchor at the screen coordinates of the point
  const hGap = 8;
  const vGap = 4 * radius;
  let left, top, origin;

  if (isFirstDay) {
    if (isBeforeNoon) {
      // bottom-right
      left = screen.x + hGap;
      top  = screen.y + vGap;
      origin = "top left";
    } else {
      // top-right
      left = screen.x + hGap;
      top  = screen.y - size.height - vGap;
      origin = "bottom left";
    }
  } else if (isLastDay) {
    if (isBeforeNoon) {
      // bottom-left
      left = screen.x - size.width - hGap;
      top  = screen.y + vGap;
      origin = "top right";
    } else {
      // top-left
      left = screen.x - size.width - hGap;
      top  = screen.y - size.height - vGap;
      origin = "bottom right";
    }
  } else {
    // middle days
    left = screen.x - size.width / 2;
    if (isBeforeNoon) {
      top = screen.y + vGap;
      origin = "top center";
    } else {
      top = screen.y - size.height - vGap;
      origin = "bottom center";
    }
  }

  // Clamp to viewport so it never goes off-screen (and never forces layout)
  const pad = 8;
  left = Math.max(pad, Math.min(left, window.innerWidth - size.width - pad));
  top  = Math.max(pad, Math.min(top,  window.innerHeight - size.height - pad));

  // Decide if the dropdown should open upwards
  const MENU_EST = 240; // approx menu height
  const wouldOverflowBottom = top + size.height + MENU_EST + pad > window.innerHeight;
  const effectiveDropUp = wouldOverflowBottom;

  const node = (
    <div
      ref={tooltipRef}
      // NOTE: fixed + portal means this element does not affect your container's scroll size
      style={{ position: "fixed", left, top, transformOrigin: origin, zIndex: 9999 }}
      className="w-[300px] pointer-events-auto rounded"
      onMouseEnter={() => clearTimeout(window.__tooltipLeaveTimeout)}
      onMouseLeave={() => (window.__tooltipLeaveTimeout = setTimeout(onClose, 300))}
    >
      <div
        className="rounded-md text-xs leading-tight shadow-md animate-tooltipFadeIn overflow-visible"
        style={{ backgroundColor: point.category.color }}
      >
        <div className="py-2 px-2">
          <div className="flex justify-between items-start gap-2 px-2">
            <p className="text-[11px] px-4 leading-snug">
              SEARCHED AT{" "}
              {point.fullDate
                ? `${point.fullDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · ${point.fullDate.toLocaleDateString("de-DE")}`
                : "—"}
            </p>
            <button
              onClick={onClose}
              className="text-white bg-red-600 w-5 h-5 text-xs rounded-full text-center"
              aria-label="Close tooltip"
            >
              ×
            </button>
          </div>
          <p className="text-lg font-medium my-2 px-6">"{point.query}"</p>
          <p className="px-6">{getLocalizedCategoryLabel(point.category, t)}</p>
        </div>

        <div className="h-[0.3px] w-full bg-[#444]" />

        <div className="py-2 px-8">
          <CategoryDropdown
            value={point.category?.id}
            onChange={(newId) => point?.id && onCategoryChange?.(point, newId)}
            dropUp={effectiveDropUp}     // open upwards when near bottom
            lockBodyScroll={false}       // don't toggle body overflow (prevents page shift)
          />
        </div>
      </div>
    </div>
  );

  return createPortal(node, document.body);
};

export default Tooltip;
