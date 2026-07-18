import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Chart } from "react-chartjs-2";
import type { ChartData, ChartOptions } from "chart.js"; // Import proper types
// Import proper types

// Register required Chart.js components
ChartJS.register(
  ChartDataLabels,
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface Props {
  heat: (number | null)[];
  labels: (string | null)[];
  win_pcts: (number | null)[];
  outcomes: (number | null)[];
  records_all: string[];
  records: string[];
  colors_1: string[];
  colors_2: string[];
}

export default function CoachChart({
  heat,
  labels,
  win_pcts,
  outcomes,
  records,
  records_all,
  colors_1,
  colors_2,
}: Props) {
  // Define the data object with the correct type
  const data: ChartData<"bar" | "line"> = {
    labels: labels,
    datasets: [
      // Heat Index bar chart
      {
        type: "bar",
        label: "Heat Index",
        data: heat,
        backgroundColor: outcomes.map((outcome, i) =>
          outcome != null && heat[i] != null
            ? outcome == 0
              ? `rgba(220, 20, 60, ${Math.sqrt(heat[i] || 0.1)})`
              : "rgba(0, 0, 0, 1)"
            : `rgba(220, 20, 60, ${Math.sqrt(heat[i] || 0.1)})`
        ),
        minBarLength: 5,
        yAxisID: "y1",
        datalabels: {
          display: false,
        },
        barPercentage: 1.0,
        categoryPercentage: 0.8,
      },
      // Records dummy bar chart
      {
        type: "bar",
        label: "Winning Pct",
        data: win_pcts,
        backgroundColor: "rgba(0,0,0,0)", // Transparent bars
        yAxisID: "y2",
        datalabels: {
          anchor: "end",
          align: "center",
          offset: 10,
          color: "gray",
          formatter: (value, context) => records[context.dataIndex],
        },
        barPercentage: 1.0,
        categoryPercentage: 0.8,
      },
      // Threshold line
      {
        type: "line",
        label: "Threshold",
        data: Array(labels.length).fill(0.5),
        borderColor: "gray",
        borderWidth: 2,
        pointRadius: 0,
        yAxisID: "y1",
        order: -1,
        spanGaps: true,
        segment: {
          borderColor: "gray",
        },
        fill: false,
        tension: 0,
        borderDash: [5, 5],
        borderCapStyle: "round",
        borderJoinStyle: "round",
        datalabels: {
          display: false,
        },
      },
    ],
  };

  // Define the options object with the correct type
  const options: ChartOptions<"bar" | "line"> = {
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: "Season",
        },
        ticks: {
          callback: function (val, index) {
            return labels[index];
          },
        },
        stacked: true,
        grid: {
          display: false,
        },
      },
      y1: {
        type: "linear",
        position: "left",
        min: 0,
        max: 1,
        ticks: {
          stepSize: 0.5,
        },
        title: {
          display: true,
          text: "Heat",
        },
        grid: {
          drawOnChartArea: false,
        },
        stacked: true,
      },
      y2: {
        type: "linear",
        position: "right",
        min: 0,
        max: 1,
        reverse: true,
        ticks: {
          callback: function (val, index) {
            return records[index];
          },
          display: false,
        },
        grid: {
          drawOnChartArea: false,
        },
        display: false,
        stacked: true,
      },
    },
    plugins: {
      legend: {
        position: "top",
        align: "center",
        labels: {
          filter: function (item) {
            item.fillStyle = "rgba(220, 20, 60, 0.5)"; // Medium red (Tailwind red-600)
            return item.text == "Heat Index"; // Hide Records from legend
          },
        },
      },
      tooltip: {
        mode: "index",
        intersect: false,
        filter: function (tooltipItem) {
          return tooltipItem.dataset.label !== "Threshold";
        },
        callbacks: {
          label: function (context) {
            if (context.dataset.label === "Winning Pct") {
              return `Record: ${records_all[context.dataIndex]}`;
            }
            return `${context.dataset.label}: ${context.formattedValue}`;
          },
        },
      },
    },
  };
  return (
    // TODO: get rid of 2025 data in chart
    <div className="w-full flex justify-center">
      <Chart type="bar" data={data} options={options} />
    </div>
  );
}
