import {
  Component,
  OnInit,
  OnDestroy,
  OnChanges,
  Input,
  SimpleChanges
} from '@angular/core';
import { Subscription } from 'rxjs';
import { NgIf, NgForOf } from '@angular/common';
import { VendorsService, Vendor } from '../../services/vendors.service';
import { ItemsService, Item } from '../../services/items.service';
import { SignalRService, SyncNotification } from '../../../../services/signalr';
import { HeaderDashboardFilter } from '../../../../layout/header/header.component';

export type TimeframeType = 'Today' | 'MTD' | 'QTD' | 'YTD';

@Component({
  selector: 'app-top-vendors',
  standalone: true,
  imports: [NgIf, NgForOf],
  templateUrl: './top-vendors.component.html',
  styleUrls: ['./top-vendors.component.scss']
})
export class TopVendorsComponent implements OnInit, OnDestroy, OnChanges {
  @Input() dashboardFilter: HeaderDashboardFilter | null = null;

  selectedTimeframe: TimeframeType = 'Today';
  timeframes: TimeframeType[] = ['Today', 'MTD', 'QTD', 'YTD'];

  activeTab: 'vendors' | 'items' = 'vendors';

  topVendors: Vendor[] = [];
  topItems: Item[] = [];
  isLoading = false;
  errorMessage = '';

  private syncSubscription?: Subscription;

  constructor(
    private vendorsService: VendorsService,
    private itemsService: ItemsService,
    private signalRService: SignalRService
  ) {}

  ngOnInit(): void {
    console.log('🚀 Top Vendors Component Initialized');
    this.loadData();
    this.setupSignalR();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dashboardFilter']) {
      console.log('TOP VENDORS dashboardFilter changed', this.dashboardFilter);
      this.loadData();
    }
  }

  ngOnDestroy(): void {
    if (this.syncSubscription) {
      this.syncSubscription.unsubscribe();
    }
  }

  private setupSignalR(): void {
    this.signalRService.startConnection()
      .then(() => {
        this.syncSubscription = this.signalRService.syncCompleted$.subscribe(
          (notification) => this.onSyncCompleted(notification)
        );
      })
      .catch(err => {
        console.error('❌ [Top Vendors] SignalR connection failed:', err);
      });
  }

  private onSyncCompleted(notification: SyncNotification): void {
    if (notification.success) {
      this.loadData();
    }
  }

  loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';

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

      console.log('TOP VENDORS advanced filter payload', filterPayload);

      this.vendorsService.getTopVendorsAdvanced(filterPayload).subscribe({
        next: (vendors) => {
          this.topVendors = vendors;
          this.loadItemsAdvanced(filterPayload);
        },
        error: (error) => {
          console.error('❌ Error loading advanced vendors:', error);
          this.errorMessage = 'Failed to load vendors';
          this.isLoading = false;
        }
      });

      return;
    }

    this.loadTopVendors();
    this.loadTopItems();
  }

  private loadItemsAdvanced(filterPayload: any): void {
    this.itemsService.getTopItemsAdvanced(filterPayload).subscribe({
      next: (items) => {
        this.topItems = items;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error loading advanced items:', error);
        this.errorMessage = 'Failed to load items';
        this.isLoading = false;
      }
    });
  }

  private loadTopVendors(): void {
    this.vendorsService.getTopVendors(this.selectedTimeframe).subscribe({
      next: (vendors) => {
        this.topVendors = vendors;
      },
      error: (error) => {
        console.error('❌ Error loading vendors:', error);
        this.errorMessage = 'Failed to load vendors';
        this.isLoading = false;
      }
    });
  }

  private loadTopItems(): void {
    this.itemsService.getTopItems(this.selectedTimeframe).subscribe({
      next: (items) => {
        this.topItems = items;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error loading items:', error);
        this.errorMessage = 'Failed to load items';
        this.isLoading = false;
      }
    });
  }

  onTimeframeChange(timeframe: TimeframeType): void {
    this.selectedTimeframe = timeframe;

    if (this.dashboardFilter?.mode === 'month' || this.dashboardFilter?.mode === 'range') {
      return;
    }

    this.loadData();
  }

  switchTab(tab: 'vendors' | 'items'): void {
    this.activeTab = tab;
  }

  formatNumber(value: number): string {
    return (value || 0).toLocaleString('en-US');
  }
}