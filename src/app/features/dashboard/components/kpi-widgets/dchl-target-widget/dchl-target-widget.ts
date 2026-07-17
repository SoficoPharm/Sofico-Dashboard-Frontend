import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import { SalesWidgetData, TimeframeType } from '../../../models/dashboard.model';
import { DashboardService } from '../../../services/dashboard.service';
import { SignalRService, SyncNotification } from '../../../../../services/signalr';
import { HeaderDashboardFilter } from '../../../../../layout/header/header.component';

@Component({
  selector: 'app-dchl-target-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dchl-target-widget.html',
  styleUrls: ['./dchl-target-widget.scss']
})
export class DchlTargetWidgetComponent implements OnInit, OnChanges, OnDestroy {
  @Input() selectedTimeframe: TimeframeType = 'Today';
  @Input() selectedBranchCode: string | null = null;
  @Input() dashboardFilter: HeaderDashboardFilter | null = null;
@Output() timeframeChange = new EventEmitter<TimeframeType>();

timeframes: TimeframeType[] = ['Today', 'MTD', 'QTD', 'YTD'];
  data?: SalesWidgetData;
  loading = false;
  syncing = false;

  private subStarted?: Subscription;
  private subCompleted?: Subscription;
  private subFailed?: Subscription;

  constructor(
    private dashboardService: DashboardService,
    private signalRService: SignalRService
  ) {}

onTimeframeChange(timeframe: TimeframeType): void {
  this.selectedTimeframe = timeframe;
  this.timeframeChange.emit(timeframe);

  if (this.dashboardFilter?.mode === 'month' || this.dashboardFilter?.mode === 'range') {
    return;
  }

  this.loadData(true);
}
  ngOnInit(): void {
    this.loadData(true);

    this.subStarted = this.signalRService.syncStarted$.subscribe(() => {
      this.syncing = true;
    });

    this.subCompleted = this.signalRService.syncCompleted$.subscribe((n: SyncNotification) => {
      this.syncing = false;

      if (n?.success) {
        setTimeout(() => this.loadData(true), 500);
      }
    });

    this.subFailed = this.signalRService.syncFailed$.subscribe(() => {
      this.syncing = false;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
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

      this.dashboardService
        .getAdvancedSalesWidgetData(filterPayload, this.selectedBranchCode)
        .subscribe({
          next: (data) => {
            this.data = data;
            this.loading = false;
          },
          error: () => {
            this.data = this.getMockData();
            this.loading = false;
          }
        });

      return;
    }

    this.dashboardService
      .getSalesWidgetData(this.selectedTimeframe, this.selectedBranchCode)
      .subscribe({
        next: (data) => {
          this.data = data;
          this.loading = false;
        },
        error: () => {
          this.data = this.getMockData();
          this.loading = false;
        }
      });
  }

  formatNumber(value: number): string {
    return (value || 0).toLocaleString('en-US');
  }

  safePercent(value: number): number {
    const n = Number(value || 0);
    if (n < 0) return 0;
    if (n > 100) return 100;
    return n;
  }

  private getMockData(): SalesWidgetData {
    return {
      invoiceCount: 0,
      totalSales: 0,
      invoicetotalSales: 0,
      grossSales: 0,
      sd: 0,
      allSales: 0,
      totalDiscount: 0,
      discountPercentage: 0,
      return: 0,
      returnPercentage: 0,
      subTotal2: 0,
      subTotal4: 0,
      returnExpired: 0,
      returnExpiredPctFromInvoice: 0,
      returnExpiredPctFromReturn: 0,
      target: 0,
      achievedPercentage: 0,
      remaining: 0,
      remainingPercentage: 100,
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

      timeframe: this.selectedTimeframe
    } as SalesWidgetData;
  }
}