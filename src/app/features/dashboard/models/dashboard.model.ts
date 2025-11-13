export type PeriodType = 'monthly' | 'daily';
export type YearType = 2022 | 2023 | 2024 | 2025;

export interface DashboardFilters {
  period: PeriodType;
  year: YearType;
  selectedDate: Date;
  branchId: string | null;
  searchQuery: string;
}

export interface SalesDataPoint {
  date: string;
  sales: number;
  target: number;
}

export interface Branch {
  id: string;
  name: string;
}

export interface DashboardData {
  sales: SalesDataPoint[];
  branches: Branch[];
  lastSync: Date;
}