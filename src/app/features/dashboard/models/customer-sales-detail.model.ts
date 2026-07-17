export interface CustomerSalesDetailRow {
  inventSiteId: string | null;
  itemId: string | null;
  itemName: string | null;
  vendorId: string | null;
  orderAccount: string | null;
  customerName: string | null;
  partyState: string | null;
  zipCode: string | null;
  address: string | null;

  salesQty: number;
  bonusQty: number;
  salesReturnQty: number;
  bonusReturnQty: number;

  periodFrom: string;
  periodTo: string;

  invoiceId: string | null;
  invoiceAmount: number;
  invoiceDate: string | null;

  batch: string | null;
  lineValue: number;

  salesMonth: number;
  salesYear: number;
}

// شكل الرد الجديد من الـ backend (Pagination)
export interface CustomerSalesDetailPagedResponse {
  success: boolean;
  error?: string;
  totalRecords: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  data: CustomerSalesDetailRow[];
}

// كل الفلاتر + البحث + الترتيب + الـ paging اللي بنبعتها للباك اند
export interface CustomerSalesDetailQueryParams {
  // Date range (نفس الموجود قبل كده)
  timeframe?: string;
  date?: string | null;
  filterMode?: 'monthly' | 'range' | null;
  month?: number | null;
  year?: number | null;
  fromDate?: string | null;
  toDate?: string | null;

  // Global search
  search?: string;

  // Column filters (text)
  site?: string;
  itemCode?: string;
  itemName?: string;
  vendor?: string;
  customerCode?: string;
  customerName?: string;
  state?: string;
  zipCode?: string;
  address?: string;
  invoiceId?: string;
  batch?: string;

  // Column filters (range)
  invoiceDateFrom?: string | null;
  invoiceDateTo?: string | null;
  invoiceAmountMin?: number | null;
  invoiceAmountMax?: number | null;
  salesQtyMin?: number | null;
  salesQtyMax?: number | null;
  bonusQtyMin?: number | null;
  bonusQtyMax?: number | null;
  salesReturnQtyMin?: number | null;
  salesReturnQtyMax?: number | null;
  bonusReturnQtyMin?: number | null;
  bonusReturnQtyMax?: number | null;

  rowMonth?: number | null;
  rowYear?: number | null;

  // Sorting
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';

  // Pagination
  page?: number;
  pageSize?: number;
}

export const PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50];