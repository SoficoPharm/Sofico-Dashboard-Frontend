import { ScientificOfficeExportService, ExportFilterPayload } from './../../services/scientific-office-export.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { delay } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import {
  HeaderComponent,
  HeaderDashboardFilter
} from '../../../../layout/header/header.component';

import { OursWidgetComponent } from '../../components/kpi-widgets/ours-widget/ours-widget.component';
import { ScientificTopVendorsComponent } from '../../components/scientific-top-vendors/scientific-top-vendors';
import { CustomerSalesDetailComponent } from '../../components/customer-sales-detail/customer-sales-detail';

import { DashboardService } from '../../services/dashboard.service';
import { SignalRService, SyncNotification } from '../../../../services/signalr';
import { OursRow, TimeframeType } from '../../models/dashboard.model';
import { VendorAnalysisComponent } from '../../components/vendor-analysis/vendor-analysis';
@Component({
  selector: 'app-scientific-office',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    OursWidgetComponent,
    ScientificTopVendorsComponent,
    CustomerSalesDetailComponent,
    VendorAnalysisComponent  
  ],
  templateUrl: './scientific-office.html',
  styleUrls: ['./scientific-office.scss']
})
export class ScientificOfficeComponent implements OnInit, OnDestroy {

  dashboardFilter: HeaderDashboardFilter | null = null;

  globalTimeframe: TimeframeType = 'Today';

  oursRows: OursRow[] = [];
  oursLoading = false;

  oursSummary = {
    totalClients: 0,
    totalValue: 0,
    totalPercentage: 0
  };

  isExporting = false;
  exportError = '';

  private subStarted?: Subscription;
  private subCompleted?: Subscription;
  private subFailed?: Subscription;

  constructor(
    private dashboardService: DashboardService,
    private exportService: ScientificOfficeExportService,
    private signalRService: SignalRService
  ) {}

  ngOnInit(): void {
    this.loadOurs();

    this.subStarted = this.signalRService.syncStarted$.subscribe(() => {
      this.oursLoading = true;
    });

    this.subCompleted = this.signalRService.syncCompleted$.subscribe((n: SyncNotification) => {
      if (n && n.success) {
        setTimeout(() => this.loadOurs(), 500);
      } else {
        this.oursLoading = false;
      }
    });

    this.subFailed = this.signalRService.syncFailed$.subscribe(() => {
      this.oursLoading = false;
    });
  }

  ngOnDestroy(): void {
    this.subStarted?.unsubscribe();
    this.subCompleted?.unsubscribe();
    this.subFailed?.unsubscribe();
  }

  onFiltersChange(filter: HeaderDashboardFilter): void {
    console.log('Scientific Office Filter:', filter);

    this.dashboardFilter = { ...filter };

    this.loadOurs();
  }

  onTimeframeChange(timeframe: TimeframeType): void {
    this.globalTimeframe = timeframe;

    if (
      this.dashboardFilter?.mode === 'month' ||
      this.dashboardFilter?.mode === 'range'
    ) {
      return;
    }

    this.loadOurs();
  }

  private loadOurs(): void {

    this.oursLoading = true;

    // ===== Month / Range =====
    if (
      this.dashboardFilter?.mode === 'month' ||
      this.dashboardFilter?.mode === 'range'
    ) {

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
        .getAdvancedOurs(filterPayload)
        .pipe(delay(300))
        .subscribe({
          next: (rows) => {

            this.oursRows = rows ?? [];

            this.oursSummary = {
              totalClients: this.oursRows.reduce((s, x) => s + Number(x.clients ?? 0), 0),
              totalValue: this.oursRows.reduce((s, x) => s + Number(x.value ?? 0), 0),
              totalPercentage: this.oursRows.reduce((s, x) => s + Number(x.percentage ?? 0), 0)
            };

            this.oursLoading = false;
          },
          error: () => {
            this.oursRows = [];
            this.oursLoading = false;
          }
        });

      return;
    }

    // ===== Today / MTD / QTD / YTD =====
    this.dashboardService
      .getOurs(this.globalTimeframe, new Date())
      .pipe(delay(300))
      .subscribe({
        next: (rows) => {

          this.oursRows = rows ?? [];

          this.oursSummary = {
            totalClients: this.oursRows.reduce((s, x) => s + Number(x.clients ?? 0), 0),
            totalValue: this.oursRows.reduce((s, x) => s + Number(x.value ?? 0), 0),
            totalPercentage: this.oursRows.reduce((s, x) => s + Number(x.percentage ?? 0), 0)
          };

          this.oursLoading = false;
        },
        error: () => {
          this.oursRows = [];
          this.oursLoading = false;
        }
      });
  }

  // ===== Export =====

  get canExport(): boolean {
    return this.dashboardFilter?.mode === 'month' || this.dashboardFilter?.mode === 'range';
  }

  onExportClick(): void {
    this.exportError = '';

    if (!this.dashboardFilter) {
      this.exportError = 'Please select a Monthly or Date Range filter first.';
      return;
    }

    let filterPayload: ExportFilterPayload;

    if (this.dashboardFilter.mode === 'month') {
      filterPayload = {
        mode: 'month',
        month: Number(this.dashboardFilter.month),
        year: Number(this.dashboardFilter.year)
      };
    } else if (this.dashboardFilter.mode === 'range') {
      filterPayload = {
        mode: 'range',
        fromDate: this.dashboardFilter.fromDate,
        toDate: this.dashboardFilter.toDate
      };
    } else {
      this.exportError = 'Please select a Monthly or Date Range filter first.';
      return;
    }

    this.isExporting = true;

    this.exportService.export(filterPayload).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        const today = new Date().toISOString().slice(0, 10);
        a.download = `ScientificOffice_${today}.xlsx`;

        document.body.appendChild(a);
        a.click();
        a.remove();

        window.URL.revokeObjectURL(url);
        this.isExporting = false;
      },
      error: (err: any) => {
        console.error('❌ Error exporting Scientific Office data:', err);
        this.exportError = 'Failed to export. Please try again.';
        this.isExporting = false;
      }
    });
  }

}