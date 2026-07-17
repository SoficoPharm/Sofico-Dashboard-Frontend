  import {
    Component,
    OnInit,
    OnDestroy,
    OnChanges,
    Input,
    SimpleChanges
  } from '@angular/core';
  import { Subscription } from 'rxjs';
  import { CommonModule } from '@angular/common';
  import { VendorAnalysisService } from '../../services/vendor-analysis.service';
  import { VendorAnalysisExportService } from '../../services/vendor-analysis-export.service';
  import {
    VendorAnalysisDto,
    VendorAnalysisQueryParams,
    VendorGroup,
    DonutSegment
  } from '../../models/vendor-analysis.model';
  import { SignalRService, SyncNotification } from '../../../../services/signalr';
  import { HeaderDashboardFilter } from '../../../../layout/header/header.component';

  export type TimeframeType = 'Today' | 'MTD' | 'QTD' | 'YTD';

  @Component({
    selector: 'app-vendor-analysis',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './vendor-analysis.html',
    styleUrls: ['./vendor-analysis.scss']
  })
  export class VendorAnalysisComponent implements OnInit, OnDestroy, OnChanges {
    @Input() dashboardFilter: HeaderDashboardFilter | null = null;

    selectedTimeframe: TimeframeType = 'Today';
    timeframes: TimeframeType[] = ['Today', 'MTD', 'QTD', 'YTD'];

    rows: VendorAnalysisDto[] = [];
    groups: VendorGroup[] = [];
    maxVendorSales = 1;
    totalSelectedVendorSales = 0;
    totalCustomersAll = 0;

    // ✅ لون ثابت لكل ترتيب فيندور (بيتكرر لو عدد الفيندورز أكبر من طول المصفوفة)
    readonly donutColors: string[] = [
      '#c97843', // orange (primary)
      '#22b573', // green
      '#6366f1', // indigo
      '#ef4444', // red
      '#0ea5e9', // blue
      '#a855f7', // purple
      '#eab308', // yellow
      '#14b8a6'  // teal
    ];
    donutSegments: DonutSegment[] = [];

    isLoading = false;
    errorMessage = '';

    isExporting = false;
    exportError = '';

    private syncSubscription?: Subscription;

    constructor(
      private vendorAnalysisService: VendorAnalysisService,
      private VendorAnalysisExportService: VendorAnalysisExportService,
      private signalRService: SignalRService
    ) {}

    ngOnInit(): void {
      this.loadData();
      this.setupSignalR();
    }

    ngOnChanges(changes: SimpleChanges): void {
      if (changes['dashboardFilter']) {
        this.loadData();
      }
    }

    ngOnDestroy(): void {
      this.syncSubscription?.unsubscribe();
    }

    private setupSignalR(): void {
      this.signalRService.startConnection()
        .then(() => {
          this.syncSubscription = this.signalRService.syncCompleted$.subscribe(
            (notification) => this.onSyncCompleted(notification)
          );
        })
        .catch(err => {
          console.error('❌ [Vendor Analysis] SignalR connection failed:', err);
        });
    }

    private onSyncCompleted(notification: SyncNotification): void {
      if (notification.success) {
        this.loadData();
      }
    }

    private buildQuery(): VendorAnalysisQueryParams {
      const query: VendorAnalysisQueryParams = {};

      if (this.dashboardFilter?.mode === 'month') {
        query.timeframe = 'MTD';
        query.filterMode = 'monthly';
        query.month = Number(this.dashboardFilter.month);
        query.year = Number(this.dashboardFilter.year);
      } else if (this.dashboardFilter?.mode === 'range') {
        query.timeframe = 'Today';
        query.filterMode = 'range';
        query.fromDate = this.dashboardFilter.fromDate;
        query.toDate = this.dashboardFilter.toDate;
      } else {
        query.timeframe = this.selectedTimeframe;
      }

      // Optional: reuse branchCode from the header filter if present, without
      // requiring changes to HeaderDashboardFilter's type definition.
      const branchCode = (this.dashboardFilter as any)?.branchCode;
      if (branchCode) {
        query.branchCode = branchCode;
      }

      return query;
    }

    loadData(): void {
      this.isLoading = true;
      this.errorMessage = '';

      const query = this.buildQuery();

      this.vendorAnalysisService.getVendorAnalysis(query).subscribe({
        next: (response) => {
          if (!response.success) {
            this.errorMessage = response.error || 'Failed to load vendor analysis';
            this.rows = [];
            this.groups = [];
            this.donutSegments = [];
            this.totalCustomersAll = 0;
            this.isLoading = false;
            return;
          }

          this.rows = response.data || [];
          this.totalSelectedVendorSales = this.rows.length
            ? Number(this.rows[0].totalSelectedVendorSales || 0)
            : 0;

          this.groups = this.buildGroups(this.rows);
          this.maxVendorSales = this.groups.length
            ? Math.max(...this.groups.map(g => g.totalSales), 1)
            : 1;

          this.totalCustomersAll = this.groups.reduce((sum, g) => sum + g.totalCustomers, 0);
          this.donutSegments = this.buildDonutSegments(this.groups);

          this.isLoading = false;
        },
        error: (error) => {
          console.error('❌ Error loading vendor analysis:', error);
          this.errorMessage = 'Failed to load vendor analysis';
          this.isLoading = false;
        }
      });
    }

    // ✅ Groups the flat area-level rows returned by the backend into one entry
    // per vendor. No vendor codes are hardcoded here — whatever vendors the
    // backend returns get their own group/chart automatically.
    private buildGroups(data: VendorAnalysisDto[]): VendorGroup[] {
      const map = new Map<string, VendorGroup>();
      const totalCompanySales = data.length ? Number(data[0].totalCompanySales || 0) : 0;

      for (const row of data) {
        const key = row.vendorCode || 'UNKNOWN';

        if (!map.has(key)) {
          map.set(key, {
            vendorCode: row.vendorCode,
            vendorName: row.vendorName || row.vendorCode,
            totalSales: 0,
            salesPercentage: 0,
            companySalesPercentage: 0,
            totalCustomers: 0,
            totalInvoices: 0,
            maxAreaSales: 0,
            areas: []
          });
        }

        const g = map.get(key)!;
        g.totalSales += Number(row.sales || 0);
        g.totalCustomers += Number(row.customers || 0);
        g.totalInvoices += Number(row.invoices || 0);
        g.areas.push(row);
      }

      const groups = Array.from(map.values());

      for (const g of groups) {
        // نسبة الفيندور من إجمالي مبيعات الفيندورز المختارين (Total Value / TotalSelectedVendorSales)
        g.salesPercentage = this.totalSelectedVendorSales > 0
          ? Math.round((g.totalSales / this.totalSelectedVendorSales) * 10000) / 100
          : 0;

        // نسبته من مبيعات الشركة بالكامل
        g.companySalesPercentage = totalCompanySales > 0
          ? Math.round((g.totalSales / totalCompanySales) * 10000) / 100
          : 0;

        g.areas.sort((a, b) => Number(b.sales || 0) - Number(a.sales || 0));
        g.maxAreaSales = g.areas.length
          ? Math.max(...g.areas.map(a => Number(a.sales || 0)), 1)
          : 1;
      }

      groups.sort((a, b) => b.totalSales - a.totalSales);
      return groups;
    }

    // ✅ بيحول كل group لـ segment على الـ donut، بالترتيب اللي هو أصلاً مرتب بيه
    // (الأكبر مبيعات الأول)، ودايرة نصف قطرها 80 (radius) زي اللي في الـ SVG.
    private buildDonutSegments(groups: VendorGroup[]): DonutSegment[] {
      const radius = 80;
      const circumference = 2 * Math.PI * radius;
      let cumulative = 0;

      return groups.map((g, i) => {
        const pct = g.salesPercentage > 0 ? g.salesPercentage : 0;
        const dash = (pct / 100) * circumference;

        const segment: DonutSegment = {
          vendorCode: g.vendorCode,
          vendorName: g.vendorName,
          color: this.donutColors[i % this.donutColors.length],
          percentage: pct,
          dashArray: `${dash} ${circumference - dash}`,
          dashOffset: -cumulative
        };

        cumulative += dash;
        return segment;
      });
    }

    // دالة صغيرة عشان الـ template ياخد لون أي فيندور حسب ترتيبه (نفس ترتيب الـ groups)
    donutColorFor(index: number): string {
      return this.donutColors[index % this.donutColors.length];
    }

    trackBySegment(_index: number, seg: DonutSegment): string {
      return seg.vendorCode;
    }

    onTimeframeChange(timeframe: TimeframeType): void {
      this.selectedTimeframe = timeframe;

      if (this.dashboardFilter?.mode === 'month' || this.dashboardFilter?.mode === 'range') {
        return;
      }

      this.loadData();
    }

    areaLabel(row: VendorAnalysisDto): string {
      return row.cityCode?.trim()
        || row.governorate?.trim()
        || row.postalCode?.trim()
        || 'Unknown Area';
    }

    formatNumber(value: number | null | undefined): string {
      return (value || 0).toLocaleString('en-US');
    }

    formatPercentage(value: number | null | undefined): string {
      return `${(value || 0).toFixed(2)}%`;
    }

    barWidth(value: number, max: number): number {
      if (!max || max <= 0) return 0;
      return Math.max(2, Math.round((Math.max(0, value) / max) * 100));
    }

    trackByVendor(_index: number, group: VendorGroup): string {
      return group.vendorCode;
    }

    trackByArea(_index: number, row: VendorAnalysisDto): string {
      return `${row.vendorCode}-${row.governorate}-${row.postalCode}-${row.cityCode}`;
    }

    // ===== Export =====

    onExportClick(): void {
      this.exportError = '';
      const query = this.buildQuery();
      this.isExporting = true;

      this.VendorAnalysisExportService.export(query).subscribe({
        next: (blob: Blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;

          const today = new Date().toISOString().slice(0, 10);
          a.download = `VendorAnalysis_${today}.xlsx`;

          document.body.appendChild(a);
          a.click();
          a.remove();

          window.URL.revokeObjectURL(url);
          this.isExporting = false;
        },
        error: (err: any) => {
          console.error('❌ Error exporting vendor analysis:', err);
          this.exportError = 'Failed to export. Please try again.';
          this.isExporting = false;
        }
      });
    }
  }