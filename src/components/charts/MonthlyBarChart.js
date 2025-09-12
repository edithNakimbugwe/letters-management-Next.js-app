'use client';

import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function MonthlyBarChart({ monthlyData = [] }) {
  const chartRef = useRef();

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: '#28b4b4',
        borderWidth: 1,
        cornerRadius: 6,
        displayColors: true,
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          font: {
            size: 11
          },
          stepSize: 1,
        }
      },
    },
    elements: {
      bar: {
        borderRadius: 4,
      }
    }
  };

  const data = {
    labels: monthlyData.map(item => item.month),
    datasets: [
      {
        label: 'Total Letters',
        data: monthlyData.map(item => item.total),
        backgroundColor: 'rgba(59, 130, 246, 0.8)', // Blue
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
      {
        label: 'Pending',
        data: monthlyData.map(item => item.pending),
        backgroundColor: 'rgba(245, 158, 11, 0.8)', // Amber/Orange
        borderColor: 'rgba(245, 158, 11, 1)',
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
      {
        label: 'Sent',
        data: monthlyData.map(item => item.sent),
        backgroundColor: 'rgba(34, 197, 94, 0.8)', // Green
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  if (monthlyData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            📊
          </div>
          <p className="text-sm">No data available for chart</p>
          <p className="text-xs text-gray-400 mt-1">Add some letters to see statistics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <Bar ref={chartRef} options={options} data={data} />
    </div>
  );
}
