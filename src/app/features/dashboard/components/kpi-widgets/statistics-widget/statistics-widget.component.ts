import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  OnDestroy,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { delay } from 'rxjs/operators';

import { StatisticsWidgetData, TimeframeType } from './../../../models/dashboard.model';
import { DashboardService } from '../../../services/dashboard.service';
import { SignalRService, SyncNotification } from '../../../../../services/signalr';
import { HeaderDashboardFilter } from '../../../../../layout/header/header.component';

@Component({
  selector: 'app-statistics-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './statistics-widget.component.html',
  styleUrls: ['./statistics-widget.component.scss']
})
export class StatisticsWidgetComponent implements OnInit, OnChanges, OnDestroy {
  @Input() selectedTimeframe: TimeframeType = 'Today';
  @Input() selectedBranchCode: string | null = null;
  @Input() dashboardFilter: HeaderDashboardFilter | null = null;

  @Output() timeframeChange = new EventEmitter<TimeframeType>();

  data: StatisticsWidgetData = this.getMockData();

  loading = false;
  syncing = false;

  timeframes: TimeframeType[] = ['Today', 'MTD', 'QTD', 'YTD'];

  private subStarted?: Subscription;
  private subCompleted?: Subscription;
  private subFailed?: Subscription;

  constructor(
    private dashboardService: DashboardService,
    private signalRService: SignalRService
  ) {}

  ngOnInit(): void {
    this.loadData(true);

    this.subStarted = this.signalRService.syncStarted$.subscribe(() => {
      this.syncing = true;
      this.loading = true;
    });

    this.subCompleted = this.signalRService.syncCompleted$.subscribe((n: SyncNotification) => {
      this.syncing = false;
      if (n && n.success) {
        setTimeout(() => this.loadData(true), 500);
      } else {
        this.loading = false;
      }
    });

    this.subFailed = this.signalRService.syncFailed$.subscribe(() => {
      this.syncing = false;
      this.loading = false;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('STATISTICS WIDGET ngOnChanges', {
      selectedTimeframe: this.selectedTimeframe,
      selectedBranchCode: this.selectedBranchCode,
      dashboardFilter: this.dashboardFilter,
      changes
    });

    if (
      changes['selectedTimeframe'] ||
      changes['selectedBranchCode'] ||
      changes['dashboardFilter']
    ) {
      this.loadData(true);
    }
  }

  ngOnDestroy(): void {
    this.subStarted?.unsubscribe();
    this.subCompleted?.unsubscribe();
    this.subFailed?.unsubscribe();
  }

  loadData(force: boolean = false): void {
    if (this.syncing && !force) return;

    this.loading = true;

    if (this.dashboardFilter?.mode === 'month' || this.dashboardFilter?.mode === 'range') {
      const filterPayload =
        this.dashboardFilter.mode === 'month'
          ? {
              mode: 'month' as const,
              month: Number(this.dashboardFilter.month),
              year: Number(this.dashboardFilter.year)
            }
          : {
              mode: 'range' as const,
              fromDate: this.dashboardFilter.fromDate,
              toDate: this.dashboardFilter.toDate
            };

      console.log('STATISTICS WIDGET advanced payload', filterPayload);

      this.dashboardService
        .getAdvancedStatisticsWidgetData(filterPayload, this.selectedBranchCode)
        .pipe(delay(300))
        .subscribe({
          next: (data) => {
            console.log('STATISTICS WIDGET advanced response', data);
            this.data = data;
            this.loading = false;
          },
          error: (err) => {
            console.error('❌ [Statistics Widget Advanced] Error:', err);
            this.data = this.getMockData();
            this.loading = false;
          }
        });

      return;
    }

    this.dashboardService
      .getStatisticsWidgetData(this.selectedTimeframe, this.selectedBranchCode)
      .pipe(delay(300))
      .subscribe({
        next: (data) => {
          console.log('STATISTICS WIDGET default response', data);
          this.data = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('❌ [Statistics Widget] Error:', err);
          this.data = this.getMockData();
          this.loading = false;
        }
      });
  }

  onTimeframeChange(timeframe: TimeframeType): void {
    this.selectedTimeframe = timeframe;
    this.timeframeChange.emit(timeframe);

    if (this.dashboardFilter?.mode === 'month' || this.dashboardFilter?.mode === 'range') {
      return;
    }

    this.loadData(true);
  }

  formatNumber(value: number): string {
    return (value || 0).toLocaleString('en-US');
  }

  private getMockData(): StatisticsWidgetData {
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

      timeframe: this.selectedTimeframe
    };
  }
  formatShort(value: number): string {
  const n = Number(value || 0);

  if (Math.abs(n) >= 1000000) {
    return `${(n / 1000000).toFixed(1)}M`;
  }

  if (Math.abs(n) >= 1000) {
    return `${(n / 1000).toFixed(0)}K`;
  }

  return n.toLocaleString('en-US');
}

safePercent(value: number): number {
  const n = Number(value || 0);
  if (n < 0) return 0;
  if (n > 100) return 100;
  return n;
}
}