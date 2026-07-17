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
      backgroundColor: 'rgba(6, 41, 31, 0.92)',
      titleColor: '#ffffff',
      bodyColor: '#ffffff',
      borderColor: 'rgba(255, 255, 255, 0.12)',
      borderWidth: 1,
      padding: 10,
      cornerRadius: 8,
      displayColors: true,

      callbacks: {
        label: (context: any) => {
          const label = context.dataset.label || '';
          const value = context.parsed.y?.toLocaleString();
          return `${label}: ${value}`;
        },
      },
    } as any,
  },

  scales: {
    x: {
      grid: {
        display: true,
        color: 'rgba(7, 41, 31, 0.05)',
      },
      ticks: {
        color: '#8a9a94',
        font: {
          size: 11,
          family: 'Arial',
        },
      },
    },

    y: {
      beginAtZero: true,
      grid: {
        display: true,
        color: 'rgba(7, 41, 31, 0.06)',
      },
      ticks: {
        color: '#8a9a94',
        font: {
          size: 11,
          family: 'Arial',
        },
        callback: (value: number) => {
          return value.toLocaleString();
        },
      },
    },
  },
};

export const CHART_COLORS = {
  sales: '#c97843',
  target: '#d7c4b5',
  success: '#10b981',
  warning: '#f59e0b',
  info: '#06b6d4',
};