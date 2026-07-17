export type PeriodType = 'monthly' | 'daily';
export type YearType = 2022 | 2023 | 2024 | 2025 | 2026;
export type TimeframeType = 'Today' | 'MTD' | 'QTD' | 'YTD';

export interface DashboardFilters {
  period: PeriodType;
  year: YearType;
  selectedDate: Date;
  branchId: string | null;
  searchQuery: string;
}

export interface ClientsKpiData {
  all: number;
  active: number;
  inactive: number;
  activePct: number;
}

export interface ClientsKpiResponse {
  success: boolean;
  data: ClientsKpiData;
}

export interface SalesDataPoint {
  date: string;
  sales: number | null;
  target: number | null;
}

export interface Branch {
  id: string;
  name: string;
}

export interface OursRow {
  code: string;
  name: string;
  clients: number;
  value: number;
  percentage: number;
}
export interface OursResponse {
  success: boolean;
  timeframe: TimeframeType;
  startDate: string;
  endDate: string;
  branchCode?: string | null;
  summary?: {  // 👈 Add this optional field
    totalClients: number;
    totalValue: number;
    totalPercentage: number;
  };
  data: OursRow[];
}

export interface SalesWidgetData {
  invoiceCount: number;
  totalSales: number;
  invoicetotalSales: number;
  grossSales: number;
  sd: number;
  allSales: number;

  totalDiscount: number;
  discountPercentage: number;

  return: number;
  returnPercentage: number;
  subTotal2: number;
  subTotal4: number;

  returnExpired: number;
  returnExpiredPctFromInvoice: number;
  returnExpiredPctFromReturn: number;

  target: number;
  achievedPercentage: number;

  remaining: number;
  remainingPercentage: number;

  stp: number;
  stpPercentage: number;

  targetRetail: number;
  achievedRetailValue: number;
  pactTargetRetail: number;

  targetHospital: number;
  achievedHospitalValue: number;
  pactTargetHospital: number;

  targetCosmetics: number;
  achievedCosmeticsValue: number;
  pactTargetCosmetics: number;

  timeframe: TimeframeType;
  details: number;
cashDiscounts: number;
}

export interface SectorTriplet {
  gross: number;
  sales: number;
  bl: number;
  totalDiscount: number;
  vendorDiscount: number;
  soficoDiscount: number;
}

export interface SectorPct {
  gross: number;
  sales: number;
  bl: number;
  totalDiscount: number;
  vendorDiscount: number;
  soficoDiscount: number;
}

export interface StatisticsWidgetData {
  retail: SectorTriplet;
  sd: SectorTriplet;
  cosmetics: SectorTriplet;
  hospital: SectorTriplet;
  tender: SectorTriplet;
  clinic: SectorTriplet;

  retailPct?: SectorPct;
  sdPct?: SectorPct;
  cosmeticsPct?: SectorPct;
  hospitalPct?: SectorPct;
  tenderPct?: SectorPct;
  clinicPct?: SectorPct;

  timeframe: TimeframeType;
}

export interface DashboardData {
  sales: SalesDataPoint[];
  branches: Branch[];
  lastSync: Date;
}

/* =========================
   Collections Widget Models
   ========================= */

export interface CollectionChannelDto {
  code: string;
  name: string;
  value: number;
}

export interface CollectionDistributionDto {
  total: number;
  channels: CollectionChannelDto[];
}

export interface CollectionWidgetResponse {
  total: number;
  cash: CollectionDistributionDto;
  check: CollectionDistributionDto;
  transfer: CollectionDistributionDto;
  details: number;
cashDiscounts: number;
}

/* =========================
   Inventory Widget Models
   ========================= */

export interface InventoryItemDto {
  itemCode: string;
  itemName: string;
  quantity: number;
  value: number;
}

export interface InventoryVendorDto {
  vendorCode: string;
  vendorName: string;
  value: number;
}
/* =========================
   Inventory Widget Models
   ========================= */

export interface InventoryWidgetResponse {
  retail: number;
  hospital: number;
  cosmetics: number;
  sd: number;

  mainStore: number;
  rawMat: number;
  tender: number;

  damage: number;
  expiredStorage: number;
  noTrade: number;
  stockInTransit: number;

  normal: number;
  expired: number;

  totalStock: number;
}