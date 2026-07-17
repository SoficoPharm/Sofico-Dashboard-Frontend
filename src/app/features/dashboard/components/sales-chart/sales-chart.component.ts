import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, finalize } from 'rxjs';
import { LineChartComponent } from '../../../../shared/components/chart/line-chart/line-chart.component';
import { DEFAULT_CHART_OPTIONS, CHART_COLORS } from '../../../../shared/components/chart/chart.config';
import { PeriodFilterComponent } from '../filters/period-filter/period-filter.component';
import { YearFilterComponent } from '../filters/year-filter/year-filter.component';
import { DateFilterComponent } from '../filters/date-filter/date-filter.component';
import { BranchFilterComponent } from '../filters/branch-filter/branch-filter.component';
import { SearchFilterComponent } from '../filters/search-filter/search-filter.component';
import { DashboardService } from '../../services/dashboard.service';
import { SignalRService, SyncNotification } from '../../../../services/signalr';
import { DashboardFilters, PeriodType, SalesDataPoint, YearType } from '../../models/dashboard.model';
import { HeaderDashboardFilter } from '../../../../layout/header/header.component';
import { UiLoadingService } from '../../services/ui-loading.service';

@Component({
  selector: 'app-sales-chart',
  standalone: true,
  imports: [
    CommonModule,
    LineChartComponent,
    PeriodFilterComponent,
    YearFilterComponent,
    DateFilterComponent,
    BranchFilterComponent,
    SearchFilterComponent
  ],
  templateUrl: './sales-chart.component.html',
  styleUrls: ['./sales-chart.component.scss']
})
export class SalesChartComponent implements OnInit, OnDestroy, OnChanges {
  @Input() dashboardFilter: HeaderDashboardFilter | null = null;

  chartData: any;

  chartOptions: any = {
    ...DEFAULT_CHART_OPTIONS,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      ...(DEFAULT_CHART_OPTIONS as any)?.plugins,
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(6, 41, 31, 0.92)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        padding: 10,
        cornerRadius: 8,
        displayColors: true
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#8a9a94',
          font: {
            size: 11,
            family: 'Arial'
          }
        },
        border: {
          display: false
        }
      },
      y: {
        grid: {
          color: 'rgba(7, 41, 31, 0.06)'
        },
        ticks: {
          color: '#8a9a94',
          font: {
            size: 11,
            family: 'Arial'
          }
        },
        border: {
          display: false
        }
      }
    }
  };

  lastSync: Date = new Date();
  loading = false;
  syncing = false;

  totalSales = 0;
  totalTarget = 0;
  achievementPercentage = 0;

  selectedBranchCode = '';
  selectedBranchName = '';

  legendSalesLabel = 'Total Sales Today';
  legendTargetLabel = 'Target Today';
  legendAchievementLabel = 'Achievement Today';

  private subStarted?: Subscription;
  private subCompleted?: Subscription;
  private subFailed?: Subscription;

  filters: DashboardFilters = {
    period: 'daily',
    year: new Date().getFullYear() as YearType,
    selectedDate: new Date(),
    branchId: null,
    searchQuery: ''
  };

  constructor(
    private dashboardService: DashboardService,
    private signalRService: SignalRService,
    public uiLoadingService: UiLoadingService
  ) {}

  get isLoading(): boolean {
    return this.uiLoadingService.isLoading;
  }

  private getSalesDataset(label: string, data: any[]): any {
    return {
      label,
      data,
      borderColor: '#c97843',
      backgroundColor: 'rgba(201, 120, 67, 0.18)',
      fill: true,
      tension: 0.45,
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 5,
      pointBackgroundColor: '#c97843',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      spanGaps: true
    };
  }
private getTargetDataset(label: string, data: any[]): any {
  return {
    label,
    data,
    borderColor: '#bfa28c',
    backgroundColor: 'transparent',
    fill: false,
    tension: 0.35,

    // ✅ يخلي خط التارجت أوضح وأعرض
    borderWidth: 3,

    pointRadius: 0,
    pointHoverRadius: 5,
    pointBackgroundColor: '#bfa28c',
    pointBorderColor: '#ffffff',
    pointBorderWidth: 2,

    // ✅ dash أوضح وأقل تقطيع
    borderDash: [8, 5],

    spanGaps: true
  };
}

  ngOnInit(): void {
    this.setLegendLabels();
    this.loadData();

    this.subStarted = this.signalRService.syncStarted$.subscribe(() => {
      this.syncing = true;
      this.uiLoadingService.start();
    });

    this.subCompleted = this.signalRService.syncCompleted$.subscribe((n: SyncNotification) => {
      this.syncing = false;
      this.lastSync = new Date(n.syncTime);

      if (n.success) {
        setTimeout(() => {
          if (this.dashboardFilter?.mode === 'month' || this.dashboardFilter?.mode === 'range') {
            this.loadAdvancedFilteredChart();
          } else {
            this.loadData();
          }
        }, 500);
      } else {
        this.uiLoadingService.stop();
      }
    });

    this.subFailed = this.signalRService.syncFailed$.subscribe(() => {
      this.syncing = false;
      this.loading = false;
      this.uiLoadingService.stop();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dashboardFilter'] && !changes['dashboardFilter'].firstChange) {
      if (this.isLoading) return;

      console.log('SALES CHART dashboardFilter changed', this.dashboardFilter);

      if (this.dashboardFilter?.mode === 'month' || this.dashboardFilter?.mode === 'range') {
        this.loadAdvancedFilteredChart();
        return;
      }

      if (this.dashboardFilter?.mode === 'default') {
        this.resetToTodayDefault();
        this.setLegendLabels();
        this.loadData();
      }
    }
  }

  ngOnDestroy(): void {
    this.subStarted?.unsubscribe();
    this.subCompleted?.unsubscribe();
    this.subFailed?.unsubscribe();
  }

  private resetToTodayDefault(): void {
    const today = new Date();

    this.filters.period = 'daily';
    this.filters.selectedDate = today;
    this.filters.year = today.getFullYear() as YearType;
    this.filters.searchQuery = '';

    this.totalSales = 0;
    this.totalTarget = 0;
    this.achievementPercentage = 0;
  }

  private updateAchievementPercentage(): void {
    this.achievementPercentage =
      this.totalTarget > 0
        ? Number(((this.totalSales / this.totalTarget) * 100).toFixed(2))
        : 0;
  }

  private setLegendLabels(): void {
    if (this.dashboardFilter?.mode === 'month') {
      this.legendSalesLabel = 'Total Sales Selected Month';
      this.legendTargetLabel = 'Target Selected Month';
      this.legendAchievementLabel = 'Achievement Selected Month';
      return;
    }

    if (this.dashboardFilter?.mode === 'range') {
      this.legendSalesLabel = 'Total Sales Selected Range';
      this.legendTargetLabel = 'Target Selected Range';
      this.legendAchievementLabel = 'Achievement Selected Range';
      return;
    }

if (this.filters.period === 'monthly') {
this.legendSalesLabel = 'Total Sales YTD';
this.legendTargetLabel = 'Target YTD';
this.legendAchievementLabel = 'Achievement YTD';
  return;
}

    this.legendSalesLabel = 'Total Sales Today';
    this.legendTargetLabel = 'Target Today';
    this.legendAchievementLabel = 'Achievement Today';
  }

  loadData(): void {
    if (this.syncing || this.isLoading) return;

    this.setLegendLabels();
    this.loading = true;
    this.uiLoadingService.start();

    this.dashboardService.getSalesData(this.filters)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.uiLoadingService.stop();
        })
      )
      .subscribe({
        next: (data) => {
          if (!data || data.length === 0) {
            this.chartData = { labels: [], datasets: [] };
            this.totalSales = 0;
            this.totalTarget = 0;
            this.achievementPercentage = 0;
            return;
          }

          this.chartData = {
            labels: data.map(d => d.date || 'N/A'),
            datasets: [
              this.getSalesDataset(
                `Total Invoice ${this.filters.year}`,
                data.map(d => d.sales)
              ),
              this.getTargetDataset(
                `Target ${this.filters.year}`,
                data.map(d => d.target)
              )
            ]
          };

          if (this.filters.period === 'daily') {
            const selectedDay = this.filters.selectedDate.getDate();
            const selectedPoint = data.find(d => Number(d.date) === selectedDay);

            this.totalSales = Number(selectedPoint?.sales ?? 0);
            this.totalTarget = Number(selectedPoint?.target ?? 0);
          } else {
            const validSales = data
              .map(d => d.sales)
              .filter(s => s !== null && s !== undefined) as number[];

            const validTargets = data
              .map(d => d.target)
              .filter(t => t !== null && t !== undefined) as number[];

            this.totalSales = Number(validSales.reduce((sum, s) => sum + s, 0).toFixed(2));
            this.totalTarget = Number(validTargets.reduce((sum, t) => sum + t, 0).toFixed(2));
          }

          this.updateAchievementPercentage();
        },
        error: (err) => {
          console.error('❌ [Sales Chart] Error:', err);
          this.chartData = { labels: [], datasets: [] };
          this.totalSales = 0;
          this.totalTarget = 0;
          this.achievementPercentage = 0;
        }
      });
  }

  private loadAdvancedFilteredChart(): void {
    if (!this.dashboardFilter) return;
    if (this.syncing || this.isLoading) return;

    this.loading = true;
    this.uiLoadingService.start();

    if (this.dashboardFilter.mode === 'month') {
      this.filters.period = 'daily';
      this.filters.year = (this.dashboardFilter.year as YearType) ?? this.filters.year;
      this.filters.selectedDate = new Date(
        this.dashboardFilter.year!,
        this.dashboardFilter.month! - 1,
        1
      );
    }

    if (this.dashboardFilter.mode === 'range' && this.dashboardFilter.fromDate) {
      const from = new Date(this.dashboardFilter.fromDate);
      this.filters.period = 'daily';
      this.filters.year = from.getFullYear() as YearType;
      this.filters.selectedDate = from;
    }

    this.setLegendLabels();

    const filterPayload =
      this.dashboardFilter.mode === 'month'
        ? {
            mode: 'month' as const,
            month: this.dashboardFilter.month,
            year: this.dashboardFilter.year
          }
        : {
            mode: 'range' as const,
            fromDate: this.dashboardFilter.fromDate,
            toDate: this.dashboardFilter.toDate
          };

    this.dashboardService
      .getAdvancedChartData(filterPayload, this.selectedBranchCode || null)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.uiLoadingService.stop();
        })
      )
      .subscribe({
        next: (data: SalesDataPoint[]) => {
          if (!data || data.length === 0) {
            this.chartData = { labels: [], datasets: [] };
            this.totalSales = 0;
            this.totalTarget = 0;
            this.achievementPercentage = 0;
            return;
          }

          this.chartData = {
            labels: data.map(d => d.date),
            datasets: [
              this.getSalesDataset(
                `Total Invoice ${this.filters.year}`,
                data.map(d => d.sales)
              ),
              this.getTargetDataset(
                `Target ${this.filters.year}`,
                data.map(d => d.target)
              )
            ]
          };

          const validSales = data
            .map(d => d.sales)
            .filter(s => s !== null && s !== undefined) as number[];

          const validTargets = data
            .map(d => d.target)
            .filter(t => t !== null && t !== undefined) as number[];

          this.totalSales = Number(validSales.reduce((sum, s) => sum + s, 0).toFixed(2));
          this.totalTarget = Number(validTargets.reduce((sum, t) => sum + t, 0).toFixed(2));
          this.updateAchievementPercentage();

          this.lastSync = new Date();
        },
        error: (err) => {
          console.error('❌ Advanced chart error:', err);
          this.chartData = { labels: [], datasets: [] };
          this.totalSales = 0;
          this.totalTarget = 0;
          this.achievementPercentage = 0;
        }
      });
  }

  onPeriodChange(period: PeriodType): void {
    if (this.isLoading) return;

    this.filters.period = period;

    if (this.dashboardFilter?.mode === 'month' || this.dashboardFilter?.mode === 'range') {
      if (period === 'monthly') {
        this.loadAdvancedFilteredChart();
      }
      return;
    }

    this.setLegendLabels();
    this.loadData();
  }

  onYearChange(year: YearType): void {
    if (this.isLoading) return;

    this.filters.year = year;

    if (this.dashboardFilter?.mode === 'month' || this.dashboardFilter?.mode === 'range') {
      return;
    }

    this.setLegendLabels();
    this.loadData();
  }

  onDateChange(date: Date): void {
    if (this.isLoading) return;

    this.filters.selectedDate = date;

    if (this.dashboardFilter?.mode === 'month' || this.dashboardFilter?.mode === 'range') {
      return;
    }

    this.setLegendLabels();

    if (this.filters.period === 'daily') {
      this.loadData();
    }
  }

  onBranchChange(branchCode: string | null): void {
    if (this.isLoading) return;

    this.selectedBranchCode = branchCode || '';
    this.filters.branchId = branchCode;
  }

  onBranchNameChange(branchName: string): void {
    if (this.isLoading) return;
    this.selectedBranchName = branchName;
  }

  onSearchClick(): void {
    if (this.syncing || this.isLoading) return;

    if (this.dashboardFilter?.mode === 'month' || this.dashboardFilter?.mode === 'range') {
      this.loadAdvancedFilteredChart();
      return;
    }

    const date = this.filters.selectedDate;
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    this.loading = true;
    this.uiLoadingService.start();
    this.setLegendLabels();

    this.dashboardService.searchByDateAndBranch(
      month,
      year,
      this.selectedBranchCode || null,
      this.filters.selectedDate
    )
    .pipe(
      finalize(() => {
        this.loading = false;
        this.uiLoadingService.stop();
      })
    )
    .subscribe({
      next: (response) => {
        if (response.success && response.data && response.data.length > 0) {
          const labels = response.data.map((item: any) => `${item.day}`);
          const sales = response.data.map((item: any) => item.sales ?? 0);
          const targets = response.data.map((item: any) => item.target ?? null);

          this.chartData = {
            labels,
            datasets: [
              this.getSalesDataset(
                response.branchName ? `Total Invoice - ${response.branchName}` : 'Total Invoice - All Branches',
                sales
              ),
              this.getTargetDataset(
                response.branchName ? `Target - ${response.branchName}` : 'Target - All Branches',
                targets
              )
            ]
          };

          if (this.filters.period === 'daily') {
            const selectedDay = this.filters.selectedDate.getDate();
            const selectedPoint = response.data.find((item: any) => Number(item.day) === selectedDay);

            this.totalSales = Number(selectedPoint?.sales ?? 0);
            this.totalTarget = Number(selectedPoint?.target ?? 0);
          } else {
            const totalSalesValue = Number(
              response.totalSales ?? sales.reduce((a: number, b: number) => a + b, 0)
            );

            const totalTargetValue = Number(
              response.totalTarget ?? targets
                .filter((x: any) => x != null)
                .reduce((a: number, b: number) => a + b, 0)
            );

            this.totalSales = Number(totalSalesValue.toFixed(2));
            this.totalTarget = Number(totalTargetValue.toFixed(2));
          }

          this.updateAchievementPercentage();
          this.lastSync = new Date();
        } else {
          this.chartData = { labels: [], datasets: [] };
          this.totalSales = 0;
          this.totalTarget = 0;
          this.achievementPercentage = 0;
        }
      },
      error: (err) => {
        console.error('❌ Search error:', err);
        this.chartData = { labels: [], datasets: [] };
        this.totalSales = 0;
        this.totalTarget = 0;
        this.achievementPercentage = 0;
      }
    });
  }
}