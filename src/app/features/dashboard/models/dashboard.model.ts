export type PeriodType = 'monthly' | 'daily';
export type YearType = 2022 | 2023 | 2024 | 2025;
export type TimeframeType = 'Today' | 'MTD' | 'QTD' | 'YTD';

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

// ✅ Sales Widget Data
export interface SalesWidgetData {
  invoiceCount: number;      // عدد الفواتير (21 / 0)
  totalSales: number;         // 5,289,265
  sd: number;                 // S.D: 36,330
  allSales: number;           // All Sales: 5,325,595
  totalDiscount: number;      // Total Discount: 0 (0%)
  discountPercentage: number; // Discount %
  return: number;             // Return: 205,425
  returnPercentage: number;   // Return %: 3.74
  target: number;             // Target: 0
  achievedPercentage: number; // Achieved %: 0
  remaining: number;          // Remaining: 0
  remainingPercentage: number;// Remaining %: 100
  stp: number;                // STP: 416,355
  stpPercentage: number;      // STP%: 1,270.37
  timeframe: TimeframeType;   // Today / MTD / QTD / YTD
}

export interface DashboardData {
  sales: SalesDataPoint[];
  branches: Branch[];
  lastSync: Date;
}