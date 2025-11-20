import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const BarChart = ({ year, records, size = 120 }) => {
  const monthlyCounts = Array(12).fill(0);

  records.forEach((rec) => {
    const date = new Date(rec.timestamp);
    if (date.getFullYear() === year) {
      const month = date.getMonth();
      monthlyCounts[month]++;
    }
  });

  const maxValue = Math.max(...monthlyCounts);
  const roundedMax = Math.ceil(maxValue / 100) * 100 || 100; // e.g. 312 → 400

  const data = {
    labels: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
    datasets: [
      {
        label: `Searches in ${year}`,
        data: monthlyCounts,
        backgroundColor: "rgba(96, 165, 250, 0.7)",
        borderRadius: 1,
        barPercentage: 0.9,
        categoryPercentage: 0.9,
      },
    ],
  };

  const options = {
    layout: {
      padding: {
        top: 0,
        bottom: 0,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: roundedMax,
        ticks: {
          stepSize: 100,
          callback: (value) => `${value}`, // clean labels
          padding: 0,
        },
        grid: { display: false },
      },
      x: {
        ticks: {
          display: true,
          maxRotation: 0,
          minRotation: 0,
          padding: 0,
          font: {
            size: size < 100 ? 8 : 10,
          },
        },
        grid: { display: false },
      },
    },
    plugins: {
      legend: { display: false },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div
      className="block mx-auto pt-2"
      style={{ width: `${size}px`, height: `${size * 0.8}px` }}
    >
      <Bar data={data} options={options} />
    </div>
  );
};

export default BarChart;
