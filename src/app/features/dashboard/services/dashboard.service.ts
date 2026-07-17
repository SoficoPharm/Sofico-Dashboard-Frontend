import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  ClientsKpiData,
  ClientsKpiResponse,
  DashboardFilters,
  OursResponse,
  OursRow,
  SalesDataPoint,
  SalesWidgetData,
  StatisticsWidgetData,
  TimeframeType,
  CollectionWidgetResponse,
  InventoryWidgetResponse
} from '../models/dashboard.model';
import { HttpClient } from '@angular/common/http';
import { BranchMappingService } from './branch-mapping.service';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  apiUrl = environment.apiBaseUrl;

  constructor(
    private http: HttpClient,
    private branchMapping: BranchMappingService
  ) {}

  getClientsKpi(timeframe: TimeframeType, date?: Date, branchCode?: string | null) {
    const params: any = { timeframe };

    if (timeframe === 'Today' && date) {
      params.date = this.formatLocalDate(date);
    }

    if (branchCode && branchCode.trim() !== '') {
      params.branchCode = branchCode;
    }

    return this.http
      .get<ClientsKpiResponse>(`${this.apiUrl}/widget/kpi/clients`, { params })
      .pipe(
        map(res =>
          (res?.success && res?.data
            ? res.data
            : { all: 0, active: 0, inactive: 0, activePct: 0 } as ClientsKpiData)
        )
      );
  }

  // 👈 UPDATED: Returns full OursResponse with summary
  getOursResponse(timeframe: TimeframeType, date?: Date, branchCode?: string | null): Observable<OursResponse> {
    const params: any = { timeframe };

    if (timeframe === 'Today' && date) {
      params.date = this.formatLocalDate(date);
    }

    if (branchCode && branchCode.trim() !== '') {
      params.branchCode = branchCode;
    }

    return this.http
      .get<OursResponse>(`${this.apiUrl}/sales/ours`, { params })
      .pipe(
        map(res => {
          if (!res?.success) {
            return {
              success: false,
              timeframe,
              startDate: '',
              endDate: '',
              data: []
            };
          }

          // Calculate summary if not provided by backend
          if (!res.summary && res.data?.length) {
            res.summary = {
              totalClients: res.data.reduce((sum, item) => sum + (item.clients || 0), 0),
              totalValue: res.data.reduce((sum, item) => sum + (item.value || 0), 0),
              totalPercentage: res.data.reduce((sum, item) => sum + (item.percentage || 0), 0)
            };
          }

          return res;
        })
      );
  }

  // 👈 LEGACY: Keep for backward compatibility (rows only)
  getOurs(timeframe: TimeframeType, date?: Date): Observable<OursRow[]> {
    const params: any = { timeframe };

    if (timeframe === 'Today' && date) {
      params.date = this.formatLocalDate(date);
    }

    return this.http
      .get<OursResponse>(`${this.apiUrl}/sales/ours`, { params })
      .pipe(map(res => (res?.success && Array.isArray(res?.data) ? res.data : [])));
  }

  getCollectionsWidget(timeframe: TimeframeType, date?: Date): Observable<CollectionWidgetResponse> {
    const params: any = { timeframe };

    if (date) {
      params.date = this.formatLocalDate(date);
    }

    return this.http
      .get<CollectionWidgetResponse>(`${environment.apiUrl}/Collection`, { params })
      .pipe(
        map(res => res ?? this.getMockCollectionsData())
      );
  }

  private getMockCollectionsData(): CollectionWidgetResponse {
    return {
      total: 0,
      details: 0,
      cashDiscounts: 0,
      cash: { total: 0, channels: [] },
      check: { total: 0, channels: [] },
      transfer: { total: 0, channels: [] }
    };
  }

  private formatLocalDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  getStatisticsWidgetData(timeframe: TimeframeType, branchCode?: string | null): Observable<StatisticsWidgetData> {
    const params: any = { timeframe };

    if (branchCode && branchCode.trim() !== '') {
      params.branchCode = branchCode;
    }

    return this.http.get<any>(`${this.apiUrl}/widget/statistics`, { params }).pipe(
      map(res => {
        if (!res?.success || !res?.data) {
          return this.getMockStatisticsData(timeframe);
        }
        return { ...res.data, timeframe } as StatisticsWidgetData;
      })
    );
  }

  private getMockStatisticsData(timeframe: TimeframeType): StatisticsWidgetData {
    return {
      retail: { gross: 0, sales: 0, bl: 0, totalDiscount: 0, vendorDiscount: 0, soficoDiscount: 0 },
      sd: { gross: 0, sales: 0, bl: 0, totalDiscount: 0, vendorDiscount: 0, soficoDiscount: 0 },
      cosmetics: { gross: 0, sales: 0, bl: 0, totalDiscount: 0, vendorDiscount: 0, soficoDiscount: 0 },
      hospital: { gross: 0, sales: 0, bl: 0, totalDiscount: 0, vendorDiscount: 0, soficoDiscount: 0 },
      tender: { gross: 0, sales: 0, bl: 0, totalDiscount: 0, vendorDiscount: 0, soficoDiscount: 0 },
      clinic: { gross: 0, sales: 0, bl: 0, totalDiscount: 0, vendorDiscount: 0, soficoDiscount: 0 },

      retailPct: { gross: 0, sales: 0, bl: 0, totalDiscount: 0, vendorDiscount: 0, soficoDiscount: 0 },
      sdPct: { gross: 0, sales: 0, bl: 0, totalDiscount: 0, vendorDiscount: 0, soficoDiscount: 0 },
      cosmeticsPct: { gross: 0, sales: 0, bl: 0, totalDiscount: 0, vendorDiscount: 0, soficoDiscount: 0 },
      hospitalPct: { gross: 0, sales: 0, bl: 0, totalDiscount: 0, vendorDiscount: 0, soficoDiscount: 0 },
      tenderPct: { gross: 0, sales: 0, bl: 0, totalDiscount: 0, vendorDiscount: 0, soficoDiscount: 0 },
      clinicPct: { gross: 0, sales: 0, bl: 0, totalDiscount: 0, vendorDiscount: 0, soficoDiscount: 0 },

      timeframe
    };
  }

  getSalesWidgetData(timeframe: TimeframeType, branchCode?: string | null): Observable<SalesWidgetData> {
    const today = new Date();

    switch (timeframe) {
      case 'Today':
        return this.getTodaySalesWidgetFromPeriodEndpoint(today, branchCode);
      case 'MTD':
        return this.getPeriodSalesWidgetData('MTD', branchCode);
      case 'QTD':
        return this.getPeriodSalesWidgetData('QTD', branchCode);
      case 'YTD':
        return this.getPeriodSalesWidgetData('YTD', branchCode);
      default:
        return this.getTodaySalesWidgetFromPeriodEndpoint(today, branchCode);
    }
  }

  private getTodaySalesWidgetFromPeriodEndpoint(date: Date, branchCode?: string | null): Observable<SalesWidgetData> {
    const params: any = {
      timeframe: 'Today',
      date: this.formatLocalDate(date)
    };

    if (branchCode && branchCode.trim() !== '') {
      params.branchCode = branchCode;
    }

    return this.http.get<any>(`${this.apiUrl}/widget/sales/period`, { params }).pipe(
      map(res => {
        if (!res?.success || !res?.data) {
          return this.getMockSalesWidgetData('Today');
        }

        return {
          ...this.getMockSalesWidgetData('Today'),
          ...res.data,

          details: 0,
          cashDiscounts: 0,

          targetRetail: Number(res.data?.targetRetail ?? 0),
          achievedRetailValue: Number(res.data?.achievedRetailValue ?? 0),
          pactTargetRetail: Number(res.data?.pactTargetRetail ?? 0),

          returnExpired: Number(res.data?.expiredReturn ?? 0),
          returnExpiredPctFromInvoice: Number(res.data?.expiredReturnPctFromInvoice ?? 0),
          returnExpiredPctFromReturn: 0,

          targetHospital: Number(res.data?.targetHospital ?? 0),
          achievedHospitalValue: Number(res.data?.achievedHospitalValue ?? 0),
          pactTargetHospital: Number(res.data?.pactTargetHospital ?? 0),

          targetCosmetics: Number(res.data?.targetCosmetics ?? 0),
          achievedCosmeticsValue: Number(res.data?.achievedCosmeticsValue ?? 0),
          pactTargetCosmetics: Number(res.data?.pactTargetCosmetics ?? 0),

          timeframe: 'Today'
        } as SalesWidgetData;
      })
    );
  }

  private getPeriodSalesWidgetData(
    timeframe: 'MTD' | 'QTD' | 'YTD',
    branchCode?: string | null
  ): Observable<SalesWidgetData> {
    const params: any = { timeframe };

    if (branchCode && branchCode.trim() !== '') {
      params.branchCode = branchCode;
    }

    return this.http.get<any>(`${this.apiUrl}/widget/sales/period`, { params }).pipe(
      map(res => {
        if (!res?.success || !res?.data) {
          return this.getMockSalesWidgetData(timeframe);
        }

        return {
          ...this.getMockSalesWidgetData(timeframe),
          ...res.data,

          details: 0,
          cashDiscounts: 0,

          targetRetail: Number(res.data?.targetRetail ?? 0),
          achievedRetailValue: Number(res.data?.achievedRetailValue ?? 0),
          pactTargetRetail: Number(res.data?.pactTargetRetail ?? 0),

          returnExpired: Number(res.data?.expiredReturn ?? 0),
          returnExpiredPctFromInvoice: Number(res.data?.expiredReturnPctFromInvoice ?? 0),
          returnExpiredPctFromReturn: 0,

          targetHospital: Number(res.data?.targetHospital ?? 0),
          achievedHospitalValue: Number(res.data?.achievedHospitalValue ?? 0),
          pactTargetHospital: Number(res.data?.pactTargetHospital ?? 0),

          targetCosmetics: Number(res.data?.targetCosmetics ?? 0),
          achievedCosmeticsValue: Number(res.data?.achievedCosmeticsValue ?? 0),
          pactTargetCosmetics: Number(res.data?.pactTargetCosmetics ?? 0),

          timeframe
        } as SalesWidgetData;
      })
    );
  }

  getAdvancedSalesWidgetData(
    filter: {
      mode: 'month' | 'range';
      month?: number | null;
      year?: number | null;
      fromDate?: string | null;
      toDate?: string | null;
    },
    branchCode?: string | null
  ): Observable<SalesWidgetData> {
    const params: any = {};

    if (filter.mode === 'month') {
      params.timeframe = 'MTD';
      params.filterMode = 'monthly';
      params.month = Number(filter.month);
      params.year = Number(filter.year);
    } else {
      params.timeframe = 'Today';
      params.filterMode = 'range';
      params.fromDate = filter.fromDate;
      params.toDate = filter.toDate;
    }

    if (branchCode && branchCode.trim() !== '') {
      params.branchCode = branchCode;
    }

    return this.http.get<any>(`${this.apiUrl}/widget/sales/period`, { params }).pipe(
      map(res => {
        if (!res?.success || !res?.data) {
          return this.getMockSalesWidgetData('Today');
        }

        return {
          invoiceCount: Number(res.data.invoiceCount ?? 0),
          totalSales: Number(res.data.totalSales ?? 0),
          invoicetotalSales: Number(res.data.invoicetotalSales ?? 0),
          grossSales: Number(res.data.grossSales ?? 0),
          sd: Number(res.data.sd ?? 0),
          allSales: Number(res.data.allSales ?? 0),
          subTotal2: Number(res.data.subTotal2 ?? 0),
          subTotal4: Number(res.data.subTotal4 ?? 0),

          details: 0,
          cashDiscounts: 0,

          totalDiscount: Number(res.data.totalDiscount ?? 0),
          discountPercentage: Number(res.data.discountPercentage ?? 0),
          return: Number(res.data.return ?? 0),
          returnPercentage: Number(res.data.returnPercentage ?? 0),

          returnExpired: Number(res.data.expiredReturn ?? 0),
          returnExpiredPctFromInvoice: Number(res.data.expiredReturnPctFromInvoice ?? 0),
          returnExpiredPctFromReturn: 0,

          target: Number(res.data.target ?? 0),
          achievedPercentage: Number(res.data.achievedPercentage ?? 0),
          remaining: Number(res.data.remaining ?? 0),
          remainingPercentage: Number(res.data.remainingPercentage ?? 0),
          stp: Number(res.data.stp ?? 0),
          stpPercentage: Number(res.data.stpPercentage ?? 0),

          targetRetail: Number(res.data.targetRetail ?? 0),
          achievedRetailValue: Number(res.data.achievedRetailValue ?? 0),
          pactTargetRetail: Number(res.data.pactTargetRetail ?? 0),

          targetHospital: Number(res.data.targetHospital ?? 0),
          achievedHospitalValue: Number(res.data.achievedHospitalValue ?? 0),
          pactTargetHospital: Number(res.data.pactTargetHospital ?? 0),

          targetCosmetics: Number(res.data.targetCosmetics ?? 0),
          achievedCosmeticsValue: Number(res.data.achievedCosmeticsValue ?? 0),
          pactTargetCosmetics: Number(res.data.pactTargetCosmetics ?? 0),

          timeframe: 'Today' as TimeframeType
        } as SalesWidgetData;
      })
    );
  }

  getAdvancedStatisticsWidgetData(
    filter: {
      mode: 'month' | 'range';
      month?: number | null;
      year?: number | null;
      fromDate?: string | null;
      toDate?: string | null;
    },
    branchCode?: string | null
  ): Observable<StatisticsWidgetData> {
    const params: any = {};

    if (filter.mode === 'month') {
      params.timeframe = 'MTD';
      params.filterMode = 'monthly';
      params.month = Number(filter.month);
      params.year = Number(filter.year);
    } else {
      params.timeframe = 'Today';
      params.filterMode = 'range';
      params.fromDate = filter.fromDate;
      params.toDate = filter.toDate;
    }

    if (branchCode && branchCode.trim() !== '') {
      params.branchCode = branchCode;
    }

    return this.http.get<any>(`${this.apiUrl}/widget/statistics`, { params }).pipe(
      map(res => {
        if (!res?.success || !res?.data) {
          return this.getMockStatisticsData('Today');
        }

        return {
          retail: {
            gross: Number(res.data.retail?.gross ?? 0),
            sales: Number(res.data.retail?.sales ?? 0),
            bl: Number(res.data.retail?.bl ?? 0),
            totalDiscount: Number(res.data.retail?.totalDiscount ?? 0),
            vendorDiscount: Number(res.data.retail?.vendorDiscount ?? 0),
            soficoDiscount: Number(res.data.retail?.soficoDiscount ?? 0)
          },
          sd: {
            gross: Number(res.data.sd?.gross ?? 0),
            sales: Number(res.data.sd?.sales ?? 0),
            bl: Number(res.data.sd?.bl ?? 0),
            totalDiscount: Number(res.data.sd?.totalDiscount ?? 0),
            vendorDiscount: Number(res.data.sd?.vendorDiscount ?? 0),
            soficoDiscount: Number(res.data.sd?.soficoDiscount ?? 0)
          },
          cosmetics: {
            gross: Number(res.data.cosmetics?.gross ?? 0),
            sales: Number(res.data.cosmetics?.sales ?? 0),
            bl: Number(res.data.cosmetics?.bl ?? 0),
            totalDiscount: Number(res.data.cosmetics?.totalDiscount ?? 0),
            vendorDiscount: Number(res.data.cosmetics?.vendorDiscount ?? 0),
            soficoDiscount: Number(res.data.cosmetics?.soficoDiscount ?? 0)
          },
          hospital: {
            gross: Number(res.data.hospital?.gross ?? 0),
            sales: Number(res.data.hospital?.sales ?? 0),
            bl: Number(res.data.hospital?.bl ?? 0),
            totalDiscount: Number(res.data.hospital?.totalDiscount ?? 0),
            vendorDiscount: Number(res.data.hospital?.vendorDiscount ?? 0),
            soficoDiscount: Number(res.data.hospital?.soficoDiscount ?? 0)
          },
          tender: {
            gross: Number(res.data.tender?.gross ?? 0),
            sales: Number(res.data.tender?.sales ?? 0),
            bl: Number(res.data.tender?.bl ?? 0),
            totalDiscount: Number(res.data.tender?.totalDiscount ?? 0),
            vendorDiscount: Number(res.data.tender?.vendorDiscount ?? 0),
            soficoDiscount: Number(res.data.tender?.soficoDiscount ?? 0)
          },
          clinic: {
            gross: Number(res.data.clinic?.gross ?? 0),
            sales: Number(res.data.clinic?.sales ?? 0),
            bl: Number(res.data.clinic?.bl ?? 0),
            totalDiscount: Number(res.data.clinic?.totalDiscount ?? 0),
            vendorDiscount: Number(res.data.clinic?.vendorDiscount ?? 0),
            soficoDiscount: Number(res.data.clinic?.soficoDiscount ?? 0)
          },

          retailPct: {
            gross: Number(res.data.retailPct?.gross ?? 0),
            sales: Number(res.data.retailPct?.sales ?? 0),
            bl: Number(res.data.retailPct?.bl ?? 0),
            totalDiscount: Number(res.data.retailPct?.totalDiscount ?? 0),
            vendorDiscount: Number(res.data.retailPct?.vendorDiscount ?? 0),
            soficoDiscount: Number(res.data.retailPct?.soficoDiscount ?? 0)
          },
          sdPct: {
            gross: Number(res.data.sdPct?.gross ?? 0),
            sales: Number(res.data.sdPct?.sales ?? 0),
            bl: Number(res.data.sdPct?.bl ?? 0),
            totalDiscount: Number(res.data.sdPct?.totalDiscount ?? 0),
            vendorDiscount: Number(res.data.sdPct?.vendorDiscount ?? 0),
            soficoDiscount: Number(res.data.sdPct?.soficoDiscount ?? 0)
          },
          cosmeticsPct: {
            gross: Number(res.data.cosmeticsPct?.gross ?? 0),
            sales: Number(res.data.cosmeticsPct?.sales ?? 0),
            bl: Number(res.data.cosmeticsPct?.bl ?? 0),
            totalDiscount: Number(res.data.cosmeticsPct?.totalDiscount ?? 0),
            vendorDiscount: Number(res.data.cosmeticsPct?.vendorDiscount ?? 0),
            soficoDiscount: Number(res.data.cosmeticsPct?.soficoDiscount ?? 0)
          },
          hospitalPct: {
            gross: Number(res.data.hospitalPct?.gross ?? 0),
            sales: Number(res.data.hospitalPct?.sales ?? 0),
            bl: Number(res.data.hospitalPct?.bl ?? 0),
            totalDiscount: Number(res.data.hospitalPct?.totalDiscount ?? 0),
            vendorDiscount: Number(res.data.hospitalPct?.vendorDiscount ?? 0),
            soficoDiscount: Number(res.data.hospitalPct?.soficoDiscount ?? 0)
          },
          tenderPct: {
            gross: Number(res.data.tenderPct?.gross ?? 0),
            sales: Number(res.data.tenderPct?.sales ?? 0),
            bl: Number(res.data.tenderPct?.bl ?? 0),
            totalDiscount: Number(res.data.tenderPct?.totalDiscount ?? 0),
            vendorDiscount: Number(res.data.tenderPct?.vendorDiscount ?? 0),
            soficoDiscount: Number(res.data.tenderPct?.soficoDiscount ?? 0)
          },
          clinicPct: {
            gross: Number(res.data.clinicPct?.gross ?? 0),
            sales: Number(res.data.clinicPct?.sales ?? 0),
            bl: Number(res.data.clinicPct?.bl ?? 0),
            totalDiscount: Number(res.data.clinicPct?.totalDiscount ?? 0),
            vendorDiscount: Number(res.data.clinicPct?.vendorDiscount ?? 0),
            soficoDiscount: Number(res.data.clinicPct?.soficoDiscount ?? 0)
          },

          timeframe: 'Today' as TimeframeType
        } as StatisticsWidgetData;
      })
    );
  }

  // 👈 UPDATED: Returns full OursResponse with summary for advanced filters
  getAdvancedOursResponse(
    filter: {
      mode: 'month' | 'range';
      month?: number | null;
      year?: number | null;
      fromDate?: string | null;
      toDate?: string | null;
    },
    branchCode?: string | null
  ): Observable<OursResponse> {
    const params: any = {};

    if (filter.mode === 'month') {
      params.timeframe = 'MTD';
      params.filterMode = 'monthly';
      params.month = Number(filter.month);
      params.year = Number(filter.year);
    } else {
      params.timeframe = 'Today';
      params.filterMode = 'range';
      params.fromDate = filter.fromDate;
      params.toDate = filter.toDate;
    }

    if (branchCode && branchCode.trim() !== '') {
      params.branchCode = branchCode;
    }

    return this.http.get<OursResponse>(`${this.apiUrl}/sales/ours`, { params }).pipe(
      map(res => {
        if (!res?.success) {
          return {
            success: false,
            timeframe: 'Today',
            startDate: '',
            endDate: '',
            data: []
          };
        }

        // Calculate summary if not provided by backend
        if (!res.summary && res.data?.length) {
          res.summary = {
            totalClients: res.data.reduce((sum, item) => sum + (item.clients || 0), 0),
            totalValue: res.data.reduce((sum, item) => sum + (item.value || 0), 0),
            totalPercentage: res.data.reduce((sum, item) => sum + (item.percentage || 0), 0)
          };
        }

        return res;
      })
    );
  }

  // 👈 LEGACY: Keep for backward compatibility
  getAdvancedOurs(
    filter: {
      mode: 'month' | 'range';
      month?: number | null;
      year?: number | null;
      fromDate?: string | null;
      toDate?: string | null;
    },
    branchCode?: string | null
  ): Observable<OursRow[]> {
    const params: any = {};

    if (filter.mode === 'month') {
      params.timeframe = 'MTD';
      params.filterMode = 'monthly';
      params.month = Number(filter.month);
      params.year = Number(filter.year);
    } else {
      params.timeframe = 'Today';
      params.filterMode = 'range';
      params.fromDate = filter.fromDate;
      params.toDate = filter.toDate;
    }

    if (branchCode && branchCode.trim() !== '') {
      params.branchCode = branchCode;
    }

    return this.http.get<OursResponse>(`${this.apiUrl}/sales/ours`, { params }).pipe(
      map(res => (res?.success && Array.isArray(res?.data) ? res.data : []))
    );
  }

  getAdvancedClientsKpi(
    filter: {
      mode: 'month' | 'range';
      month?: number | null;
      year?: number | null;
      fromDate?: string | null;
      toDate?: string | null;
    },
    branchCode?: string | null
  ): Observable<ClientsKpiData> {
    const params: any = {};

    if (filter.mode === 'month') {
      params.timeframe = 'MTD';
      params.filterMode = 'monthly';
      params.month = Number(filter.month);
      params.year = Number(filter.year);
    } else {
      params.timeframe = 'Today';
      params.filterMode = 'range';
      params.fromDate = filter.fromDate;
      params.toDate = filter.toDate;
    }

    if (branchCode && branchCode.trim() !== '') {
      params.branchCode = branchCode;
    }

    return this.http
      .get<ClientsKpiResponse>(`${this.apiUrl}/widget/kpi/clients`, { params })
      .pipe(
        map(res =>
          (res?.success && res?.data
            ? res.data
            : { all: 0, active: 0, inactive: 0, activePct: 0 } as ClientsKpiData)
        )
      );
  }

  private getMockSalesWidgetData(timeframe: TimeframeType): SalesWidgetData {
    return {
      invoiceCount: 0,
      totalSales: 0,
      invoicetotalSales: 0,
      grossSales: 0,
      sd: 0,
      allSales: 0,
      subTotal2: 0,
      subTotal4: 0,
      details: 0,
      cashDiscounts: 0,
      totalDiscount: 0,
      discountPercentage: 0,
      return: 0,
      returnPercentage: 0,

      returnExpired: 0,
      returnExpiredPctFromInvoice: 0,
      returnExpiredPctFromReturn: 0,

      target: 0,
      achievedPercentage: 0,
      remaining: 0,
      remainingPercentage: 0,
      stp: 0,
      stpPercentage: 0,

      targetRetail: 0,
      achievedRetailValue: 0,
      pactTargetRetail: 0,

      targetHospital: 0,
      achievedHospitalValue: 0,
      pactTargetHospital: 0,

      targetCosmetics: 0,
      achievedCosmeticsValue: 0,
      pactTargetCosmetics: 0,

      timeframe
    };
  }

  getBranches(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/sales/by-branch`).pipe(
      map(response => {
        if (response.success && response.data) {
          const branches = response.data.map((item: any) => ({
            code: item.branchCode,
            name: item.branchName
          }));
          return { success: true, data: branches };
        }
        return response;
      })
    );
  }

  getSalesData(filters: DashboardFilters): Observable<SalesDataPoint[]> {
    return filters.period === 'monthly'
      ? this.getMonthlyChartData(filters)
      : this.getDailyChartData(filters);
  }

  getAdvancedChartData(
    filter: {
      mode: 'month' | 'range';
      month?: number | null;
      year?: number | null;
      fromDate?: string | null;
      toDate?: string | null;
    },
    branchCode?: string | null
  ): Observable<SalesDataPoint[]> {
    const params: any = {};

    if (filter.mode === 'month') {
      params.filterMode = 'monthly';
      params.month = Number(filter.month);
      params.year = Number(filter.year);
    } else {
      params.filterMode = 'range';
      params.fromDate = filter.fromDate;
      params.toDate = filter.toDate;
    }

    if (branchCode && branchCode.trim() !== '') {
      params.branchCode = branchCode;
    }

    return this.http.get<any>(`${this.apiUrl}/chart/sales-target`, { params }).pipe(
      map(res => {
        if (!res?.success || !Array.isArray(res?.data)) {
          return [];
        }

        return res.data.map((x: any) => ({
          date: String(x.date),
          sales: x.sales,
          target: x.target
        })) as SalesDataPoint[];
      })
    );
  }

  private getMonthlyChartData(filters: DashboardFilters): Observable<SalesDataPoint[]> {
    const params: any = {
      year: filters.year
    };

    if (filters.branchId && filters.branchId.trim() !== '') {
      params.branchCode = filters.branchId;
    }

    return this.http.get<any>(`${this.apiUrl}/chart/sales-target`, { params }).pipe(
      map(res => {
        if (!res?.success || !Array.isArray(res?.data)) {
          return [];
        }

        return res.data.map((x: any) => ({
          date: String(x.date),
          sales: x.sales,
          target: x.target
        })) as SalesDataPoint[];
      })
    );
  }

  private getDailyChartData(filters: DashboardFilters): Observable<SalesDataPoint[]> {
    const date = filters.selectedDate;
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const params: any = { month, year };

    if (filters.branchId && filters.branchId.trim() !== '') {
      params.branchCode = filters.branchId;
    }

    return this.http.get<any>(`${this.apiUrl}/chart/sales-target`, { params }).pipe(
      map(res => {
        if (!res?.success || !Array.isArray(res?.data)) {
          return [];
        }

        return res.data.map((x: any) => ({
          date: String(x.date),
          sales: x.sales,
          target: x.target
        })) as SalesDataPoint[];
      })
    );
  }

  searchByDateAndBranch(
    month: number,
    year: number,
    branchCode?: string | null,
    selectedDate?: Date
  ): Observable<any> {
    const params: any = { month, year };

    if (branchCode && branchCode.trim() !== '') {
      params.branchCode = branchCode;
    }

    return this.http.get<any>(`${this.apiUrl}/chart/sales-target`, { params }).pipe(
      map(res => {
        if (!res?.success || !Array.isArray(res?.data)) {
          return {
            success: false,
            branch: branchCode || null,
            branchName: branchCode
              ? this.branchMapping.getBranchName(branchCode)
              : 'All Branches',
            totalSales: 0,
            totalTarget: 0,
            data: []
          };
        }

        return {
          success: true,
          branch: branchCode || null,
          branchName: branchCode
            ? this.branchMapping.getBranchName(branchCode)
            : 'All Branches',
          totalSales: Number(res.totalSales ?? 0),
          totalTarget: Number(res.totalTarget ?? 0),
          data: res.data.map((x: any) => ({
            day: Number(x.date),
            sales: Number(x.sales ?? 0),
            target: Number(x.target ?? 0)
          }))
        };
      })
    );
  }

  getLastSyncTime(): Observable<Date> {
    return of(new Date());
  }

// dashboard.service.ts

// INVENTORY WIDGET KBERA
// getInventoryWidget(): Observable<InventoryWidgetResponse> {

//   return this.http
//     .get<InventoryWidgetResponse>(`${environment.apiUrl}/ZStock/total-wavrage`)
//     .pipe(
//       map((res: any) => {

//         return {
//           retail: Number(res?.retail ?? 0),
//           hospital: Number(res?.hospital ?? 0),
//           cosmetics: Number(res?.cosmetics ?? 0),
//           sd: Number(res?.sd ?? 0),

//           mainStore: Number(res?.mainStore ?? 0),
//           rawMat: Number(res?.rawMat ?? 0),
//           tender: Number(res?.tender ?? 0),

//           damage: Number(res?.damage ?? 0),
//           expiredStorage: Number(res?.expiredStorage ?? 0),
//           noTrade: Number(res?.noTrade ?? 0),
//           stockInTransit: Number(res?.stockInTransit ?? 0),

//           normal: Number(res?.normal ?? 0),
//           expired: Number(res?.expired ?? 0),

//           totalStock: Number(res?.totalStock ?? 0)
//         };
//       })
//     );
// }


// INVENTORY WIDGET SUMMAERY
getInventoryWidget(): Observable<InventoryWidgetResponse> {
  return this.http
    .get<any>(`${environment.apiUrl}/StockSummary`)
    .pipe(
      map((res: any) => {
        return {
          retail: Number(res?.retail ?? 0),
          hospital: Number(res?.hospital ?? 0),
          cosmetics: Number(res?.cosmetics ?? 0),
          sd: Number(res?.sd ?? 0),

          // 👈 الأسماء زي ما الباك رجعها بالضبط
          mainStore: Number(res?.maiN_STORE ?? 0),
          rawMat: Number(res?.raW_MATERIAL ?? 0),
          tender: Number(res?.tender ?? 0),

          damage: Number(res?.damage ?? 0),
          expiredStorage: Number(res?.expireD_STORE ?? 0),
          noTrade: Number(res?.conS_STORE ?? 0),
          stockInTransit: Number(res?.tranS_STORE ?? 0),

          normal: Number(res?.normal ?? 0),
          expired: Number(res?.expired ?? 0),

          totalStock: Number(res?.totaL_STOCK ?? 0)
        };
      })
    );
}




}