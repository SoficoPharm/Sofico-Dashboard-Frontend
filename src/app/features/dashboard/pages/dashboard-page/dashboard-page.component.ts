import { DashboardService } from './../../services/dashboard.service';
import { Component, OnDestroy, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OursRow, TimeframeType } from '../../models/dashboard.model';

import { KpiCardsComponent } from '../../components/kpi-cards/kpi-cards.component';
import { SalesChartComponent } from '../../components/sales-chart/sales-chart.component';
import { SalesWidgetComponent } from '../../components/kpi-widgets/sales-widget/sales-widget.component';
import { StatisticsWidgetComponent } from '../../components/kpi-widgets/statistics-widget/statistics-widget.component';
import { BreakEvenWidgetComponent } from '../../components/kpi-widgets/break-even-widget/break-even-widget.component';
import { OursWidgetComponent } from '../../components/kpi-widgets/ours-widget/ours-widget.component';
import { InfoBoxComponent } from '../../components/info-box/info-box.component';
import { TopVendorsComponent } from '../../components/top-vendors/top-vendors.component';
import { DchlTargetWidgetComponent } from '../../components/kpi-widgets/dchl-target-widget/dchl-target-widget';
import { Subscription } from 'rxjs';
import { delay } from 'rxjs/operators';
import { SignalRService, SyncNotification } from '../../../../services/signalr';
import { HeaderDashboardFilter } from '../../../../layout/header/header.component';
import { InventoryCardComponent } from "../../components/inventory-card/inventory-card";

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
 imports: [
    CommonModule,
    KpiCardsComponent,
    SalesChartComponent,
    SalesWidgetComponent,
    StatisticsWidgetComponent,
    BreakEvenWidgetComponent,
    OursWidgetComponent,
    TopVendorsComponent,
    // ✅ ضيف ده
    DchlTargetWidgetComponent,
],
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss']
})
export class DashboardPageComponent implements OnInit, OnDestroy, OnChanges {
  @Input() dashboardFilter: HeaderDashboardFilter | null = null;

  globalTimeframe: TimeframeType = 'Today';

  oursRows: OursRow[] = [];
  oursLoading = false;

  private subStarted?: Subscription;
  private subCompleted?: Subscription;
  private subFailed?: Subscription;

  constructor(
    private dashboardService: DashboardService,
    private signalRService: SignalRService
  ) {}

  ngOnInit(): void {
    this.loadOurs(true);

    this.subStarted = this.signalRService.syncStarted$.subscribe(() => {
      this.oursLoading = true;
    });

    this.subCompleted = this.signalRService.syncCompleted$.subscribe((n: SyncNotification) => {
      if (n && n.success) {
        setTimeout(() => this.loadOurs(true), 500);
      } else {
        this.oursLoading = false;
      }
    });

    this.subFailed = this.signalRService.syncFailed$.subscribe(() => {
      this.oursLoading = false;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('PAGE received dashboardFilter 🔥', this.dashboardFilter, changes);

    if (changes['dashboardFilter']) {
      this.loadOurs(true);
    }
  }

  ngOnDestroy(): void {
    this.subStarted?.unsubscribe();
    this.subCompleted?.unsubscribe();
    this.subFailed?.unsubscribe();
  }

onTimeframeChange(timeframe: TimeframeType): void {
  this.globalTimeframe = timeframe;

  if (this.dashboardFilter?.mode === 'month' || this.dashboardFilter?.mode === 'range') {
    return;
  }

  this.loadOurs(true);
}

  onTimeframeChangeOurs(tf: TimeframeType): void {
    this.globalTimeframe = tf;

    if (this.dashboardFilter?.mode === 'month' || this.dashboardFilter?.mode === 'range') {
      return;
    }

    this.loadOurs(true);
  }

  private loadOurs(force: boolean = false): void {
    this.oursLoading = true;

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

      console.log('PAGE advanced OURS payload', filterPayload);

      this.dashboardService
        .getAdvancedOurs(filterPayload)
        .pipe(delay(300))
        .subscribe({
          next: (rows) => {
            console.log('PAGE advanced OURS response', rows);
            this.oursRows = rows ?? [];
            this.oursLoading = false;
          },
          error: (err) => {
            console.error('❌ [OURS Advanced] Error:', err);
            this.oursRows = [];
            this.oursLoading = false;
          }
        });

      return;
    }

    this.dashboardService
      .getOurs(this.globalTimeframe, new Date())
      .pipe(delay(300))
      .subscribe({
        next: (rows) => {
          this.oursRows = rows ?? [];
          this.oursLoading = false;
        },
        error: () => {
          this.oursRows = [];
          this.oursLoading = false;
        }
      });
  }
}