import React, { useMemo, useRef, useState, useEffect } from "react";
import { scaleLinear, scaleTime, line } from "d3";
import {
    eachDayOfInterval,
    format,
    startOfDay,
} from "date-fns";

const UsageTimelineChart = ({ onDateSelect, selectedDate, markers = [] }) => {
    const svgRef = useRef(null);
    const [svgWidth, setSvgWidth] = useState(0);

    const height = 100;
    const margin = { top: 10, right: 10, bottom: 30, left: 30 };

    const currentYear = 2024;

    const yearStart = useMemo(() => new Date(currentYear, 0, 1), [currentYear]);
    const yearEnd = useMemo(() => new Date(currentYear, 11, 31), [currentYear]);

    // Group markers by date and count per day
    const data = useMemo(() => {
        const dayMap = {};

        markers.forEach(({ date }) => {
            const dayKey = new Date(date).toISOString().split("T")[0];
            if (!dayMap[dayKey]) {
                dayMap[dayKey] = 0;
            }
            dayMap[dayKey] += 1;
        });

        const days = eachDayOfInterval({ start: yearStart, end: yearEnd });

        return days.map((date) => {
            const key = date.toISOString().split("T")[0];
            return {
                date,
                usage: dayMap[key] || 0,
            };
        });
    }, [markers, yearStart, yearEnd]);

    // Resize on mount and window resize
    useEffect(() => {
        const handleResize = () => {
            if (svgRef.current) {
                setSvgWidth(svgRef.current.clientWidth);
            }
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const x = scaleTime()
        .domain([yearStart, yearEnd])
        .range([margin.left, svgWidth - margin.right]);

    const y = scaleLinear()
        .domain([0, Math.max(...data.map((d) => d.usage), 10)]) // scale to max usage
        .range([height - margin.bottom, margin.top]);

    const usageLine = line()
        .x((d) => x(d.date))
        .y((d) => y(d.usage));

    const handleClick = (e) => {
        const rect = e.target.getBoundingClientRect();
        const xPos = e.clientX - rect.left;
        const clickedDate = x.invert(xPos);
        const roundedDate = startOfDay(clickedDate);
        onDateSelect(roundedDate);
    };

    return (
        <div ref={svgRef} className="w-full overflow-x-auto border-t">
            <svg
                width={svgWidth}
                height={height}
                className="cursor-pointer"
                onClick={handleClick}
            >
                {/* X-axis labels */}
                {[1, 60, 120, 180, 240, 300].map((d) => (
                    <text
                        key={d}
                        x={x(new Date(currentYear, 0, d))}
                        y={height - 10}
                        fontSize={10}
                        textAnchor="middle"
                        fill="#555"
                    >
                        {format(new Date(currentYear, 0, d), "dd MMM")}
                    </text>
                ))}

                {/* Usage line */}
                <path d={usageLine(data)} fill="none" stroke="#3b82f6" strokeWidth={2} />

                {/* Selected date marker */}
                {selectedDate && (
                    <line
                        x1={x(selectedDate)}
                        x2={x(selectedDate)}
                        y1={margin.top}
                        y2={height - margin.bottom}
                        stroke="red"
                        strokeWidth={2}
                    />
                )}
            </svg>
        </div>
    );
};

export default UsageTimelineChart;
