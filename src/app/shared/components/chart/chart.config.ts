import { ChartOptions } from './chart.models';

export const DEFAULT_CHART_OPTIONS: ChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: true,
      callbacks: {
        label: (context: any) => {
          const label = context.dataset.label || '';
          const value = context.parsed.y.toLocaleString();
          return `${label}: ${value}`;
        },
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: true,
        color: '#f0f0f0',
      },
      ticks: {
        font: {
          size: 11,
        },
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        display: true,
        color: '#f0f0f0',
      },
      ticks: {
        font: {
          size: 11,
        },
        callback: (value: number) => {
          return value.toLocaleString();
        },
      },
    },
  },
};

export const CHART_COLORS = {
  sales: '#3b82f6',
  target: '#ef4444',
  success: '#10b981',
  warning: '#f59e0b',
  info: '#06b6d4',
};