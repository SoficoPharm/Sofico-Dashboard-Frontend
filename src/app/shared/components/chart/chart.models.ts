export interface ChartDataPoint {
  x: string | number;
  y: number;
}

export interface ChartDataset {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor?: string;
  fill?: boolean;
  tension?: number;
  borderWidth?: number;
  pointRadius?: number;
  pointHoverRadius?: number;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartOptions {
  responsive: boolean;
  maintainAspectRatio: boolean;
  interaction?: {
    mode: string;
    intersect: boolean;
  };
  plugins?: {
    legend?: {
      display: boolean;
      position?: 'top' | 'bottom' | 'left' | 'right';
    };
    tooltip?: {
      enabled: boolean;
      callbacks?: any;
    };
  };
  scales?: {
    x?: any;
    y?: any;
  };
}