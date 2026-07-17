export interface VendorAnalysisDto {
  vendorCode: string;
  vendorName: string;
  governorate: string | null;
  postalCode: string | null;
  cityCode: string | null;

  sales: number;
  totalSelectedVendorSales: number | null;
  totalCompanySales: number | null;
  salesPercentage: number | null;
  companySalesPercentage: number | null;

  customers: number;
  customerPercentage: number | null;

  invoices: number;
  items: number;
  units: number;
}

export interface VendorAnalysisResponse {
  success: boolean;
  error?: string;
  timeframe?: string;
  filterMode?: string | null;
  startDate?: string;
  endDate?: string;
  branchCode?: string | null;
  totalVendors: number;
  data: VendorAnalysisDto[];
}

export interface VendorAnalysisQueryParams {
  timeframe?: string;
  date?: string | null;
  branchCode?: string | null;
  filterMode?: 'monthly' | 'range' | null;
  month?: number | null;
  year?: number | null;
  fromDate?: string | null;
  toDate?: string | null;
}

// ===== UI-only aggregation model (built on the frontend from the flat API rows) =====
export interface VendorGroup {
  vendorCode: string;
  vendorName: string;
  totalSales: number;
  salesPercentage: number;          // نسبة الفيندور من إجمالي مبيعات الفيندورز المختارين (Total Value)
  companySalesPercentage: number;   // نسبته من مبيعات الشركة بالكامل
  totalCustomers: number;
  totalInvoices: number;
  maxAreaSales: number;
  areas: VendorAnalysisDto[];
}

// ✅ بيانات الـ Donut Chart لكل فيندور (segment على الدائرة)
export interface DonutSegment {
  vendorCode: string;
  vendorName: string;
  color: string;
  percentage: number;   // من 0 لـ 100
  dashArray: string;    // "dash gap" لـ stroke-dasharray
  dashOffset: number;   // نقطة بداية الـ segment على محيط الدائرة
}