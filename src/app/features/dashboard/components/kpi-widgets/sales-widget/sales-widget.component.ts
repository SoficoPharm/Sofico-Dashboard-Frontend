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
import { forkJoin, Subscription } from 'rxjs';

import { SalesWidgetData, TimeframeType } from '../../../models/dashboard.model';
import { DashboardService } from '../../../services/dashboard.service';
import { SignalRService, SyncNotification } from '../../../../../services/signalr';
import { HeaderDashboardFilter } from '../../../../../layout/header/header.component';

@Component({
  selector: 'app-sales-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sales-widget.component.html',
  styleUrls: ['./sales-widget.component.scss']
})
export class SalesWidgetComponent implements OnInit, OnChanges, OnDestroy {
  @Input() selectedTimeframe: TimeframeType = 'Today';
  @Input() selectedBranchCode: string | null = null;
  @Input() dashboardFilter: HeaderDashboardFilter | null = null;

  @Output() timeframeChange = new EventEmitter<TimeframeType>();

  data?: SalesWidgetData;
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

    const collectionDate = this.resolveCollectionDate();
    const collectionTimeframe = this.resolveCollectionTimeframe();

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

      forkJoin({
        sales: this.dashboardService.getAdvancedSalesWidgetData(
          filterPayload,
          this.selectedBranchCode
        ),
        collections: this.dashboardService.getCollectionsWidget(
          collectionTimeframe,
          collectionDate
        )
      }).subscribe({
        next: ({ sales, collections }) => {
          this.data = {
            ...sales,
            details: Number(collections.details ?? 0),
            cashDiscounts: Number(collections.cashDiscounts ?? 0)
          };
          this.loading = false;
        },
        error: (err) => {
          console.error('❌ [Sales Widget Advanced] Error:', err);
          this.data = this.getMockData();
          this.loading = false;
        }
      });

      return;
    }

    forkJoin({
      sales: this.dashboardService.getSalesWidgetData(
        this.selectedTimeframe,
        this.selectedBranchCode
      ),
      collections: this.dashboardService.getCollectionsWidget(
        this.selectedTimeframe,
        collectionDate
      )
    }).subscribe({
      next: ({ sales, collections }) => {
        this.data = {
          ...sales,
          details: Number(collections.details ?? 0),
          cashDiscounts: Number(collections.cashDiscounts ?? 0)
        };
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ [Sales Widget] Error:', err);
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

  private resolveCollectionTimeframe(): TimeframeType {
    if (this.dashboardFilter?.mode === 'month') {
      return 'MTD';
    }

    return this.selectedTimeframe;
  }

  private resolveCollectionDate(): Date {
    if (
      this.dashboardFilter?.mode === 'month' &&
      this.dashboardFilter.year &&
      this.dashboardFilter.month
    ) {
      const year = Number(this.dashboardFilter.year);
      const month = Number(this.dashboardFilter.month);
      return new Date(year, month, 0);
    }

    if (this.dashboardFilter?.mode === 'range' && this.dashboardFilter.fromDate) {
      return new Date(this.dashboardFilter.fromDate);
    }

    const possibleSelectedDate = (this.dashboardFilter as any)?.selectedDate;
    if (possibleSelectedDate) {
      return new Date(possibleSelectedDate);
    }

    return new Date();
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
      details: 0,
      cashDiscounts: 0,
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