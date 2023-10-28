'use client'

import React from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from "chart.js";
import { Bar } from 'react-chartjs-2';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip);

interface BarChartProps {
  labels: string[],
  data: number[]
};

const BarChart = ({
  labels,
  data
}: BarChartProps) => {
  const maxNumber = Math.max(...data);
  const totalNumber = Number((maxNumber + 5)?.toFixed(0));

  const chartData = {
    labels,
    datasets: [
      {
        data: data,
        backgroundColor: '#63B690',
        borderRadius: 3,
        borderSkipped: false,
        categoryPercentage: 0.4,
      },
    ],
  };
  
  const chartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: false,
        text: "",
      },
    },
    scale: {
      ticks: {
        precision: 0,
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          drawOnChartArea: false,
          drawTicks: false,
        },
        border: {
          color: "#F1F2F4",
        },
        ticks: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          drawOnChartArea: false,
          drawTicks: false,
        },
        max: totalNumber,
        min: 0,
        grace: 1,
        ticks: {
          display: false,
        },
        border: {
          display: false,
          width: 0,
        },
      },
    },
  };

  return (
    <div className='w-full h-full barchart-style'>
      <Bar 
        data={chartData} 
        options={chartOptions} 
      />
    </div>
  )
}

export default BarChart