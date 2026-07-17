import {
  Component,
  OnInit,
  OnDestroy,
  OnChanges,
  Input,
  SimpleChanges,
  HostListener
} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerSalesDetailService } from '../../services/customer-sales-detail.service';
import {
  CustomerSalesDetailRow,
  CustomerSalesDetailQueryParams,
  PAGE_SIZE_OPTIONS
} from '../../models/customer-sales-detail.model';
import { SignalRService, SyncNotification } from '../../../../services/signalr';
import { HeaderDashboardFilter } from '../../../../layout/header/header.component';
import { CustomerSalesDetailExportService } from '../../services/customer-sales-detail-export.service';
import { AutofocusDirective } from '../../../../directives/autofocus';
export type TimeframeType = 'Today' | 'MTD' | 'QTD' | 'YTD';

interface ColumnFilters {
  site: string;
  itemCode: string;
  itemName: string;
  vendor: string;
  customerCode: string;
  customerName: string;
  state: string;
  zipCode: string;
  address: string;
  invoiceId: string;
  batch: string;
  invoiceDateFrom: string;
  invoiceDateTo: string;
  invoiceAmountMin: string;
  invoiceAmountMax: string;
  salesQtyMin: string;
  salesQtyMax: string;
  bonusQtyMin: string;
  bonusQtyMax: string;
  salesReturnQtyMin: string;
  salesReturnQtyMax: string;
  bonusReturnQtyMin: string;
  bonusReturnQtyMax: string;
  rowMonth: string;
  rowYear: string;
}

function emptyFilters(): ColumnFilters {
  return {
    site: '', itemCode: '', itemName: '', vendor: '', customerCode: '', customerName: '',
    state: '', zipCode: '', address: '', invoiceId: '', batch: '',
    invoiceDateFrom: '', invoiceDateTo: '',
    invoiceAmountMin: '', invoiceAmountMax: '',
    salesQtyMin: '', salesQtyMax: '',
    bonusQtyMin: '', bonusQtyMax: '',
    salesReturnQtyMin: '', salesReturnQtyMax: '',
    bonusReturnQtyMin: '', bonusReturnQtyMax: '',
    rowMonth: '', rowYear: ''
  };
}

@Component({
  selector: 'app-customer-sales-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, AutofocusDirective],
  templateUrl: './customer-sales-detail.html',
  styleUrls: ['./customer-sales-detail.scss']
})
export class CustomerSalesDetailComponent implements OnInit, OnDestroy, OnChanges {
  @Input() dashboardFilter: HeaderDashboardFilter | null = null;

  selectedTimeframe: TimeframeType = 'Today';
  timeframes: TimeframeType[] = ['Today', 'MTD', 'QTD', 'YTD'];

  rows: CustomerSalesDetailRow[] = [];
  isLoading = false;
  errorMessage = '';

  isExporting = false;
  exportError = '';

  filters: ColumnFilters = emptyFilters();

  // اسم العمود اللي الـ popup بتاعه مفتوح دلوقتي (null = مفيش حاجة مفتوحة)
  activeFilterColumn: string | null = null;

  sortBy = 'invoiceId';
  sortDirection: 'asc' | 'desc' = 'asc';

  currentPage = 1;
  pageSize = 10;
  totalRecords = 0;
  totalPages = 0;
  pageSizeOptions = PAGE_SIZE_OPTIONS;

  private filtersSubject = new Subject<void>();
  private filtersSub?: Subscription;
  private syncSubscription?: Subscription;

  constructor(
    private customerSalesDetailService: CustomerSalesDetailService,
    private signalRService: SignalRService,
    private exportService: CustomerSalesDetailExportService
  ) {}

  ngOnInit(): void {
    this.filtersSub = this.filtersSubject
      .pipe(debounceTime(400))
      .subscribe(() => {
        this.currentPage = 1;
        this.loadData();
      });

    this.loadData();
    this.setupSignalR();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dashboardFilter']) {
      this.currentPage = 1;
      this.loadData();
    }
  }

  ngOnDestroy(): void {
    this.syncSubscription?.unsubscribe();
    this.filtersSub?.unsubscribe();
  }

  private setupSignalR(): void {
    this.signalRService.startConnection()
      .then(() => {
        this.syncSubscription = this.signalRService.syncCompleted$.subscribe(
          (notification) => this.onSyncCompleted(notification)
        );
      })
      .catch(err => {
        console.error('❌ [Customer Sales Detail] SignalR connection failed:', err);
      });
  }

  private onSyncCompleted(notification: SyncNotification): void {
    if (notification.success) {
      this.loadData();
    }
  }

  // ===== Filter popup handling =====

  toggleFilterPopup(column: string, event: MouseEvent): void {
    event.stopPropagation();
    this.activeFilterColumn = this.activeFilterColumn === column ? null : column;
  }

  closeFilterPopup(): void {
    this.activeFilterColumn = null;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.filter-icon-btn') && !target.closest('.filter-popup')) {
      this.activeFilterColumn = null;
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.activeFilterColumn = null;
  }

  isColumnFiltered(...keys: (keyof ColumnFilters)[]): boolean {
    return keys.some(k => !!this.filters[k]);
  }

  private buildQuery(): CustomerSalesDetailQueryParams {
    const query: CustomerSalesDetailQueryParams = {
      page: this.currentPage,
      pageSize: this.pageSize,
      sortBy: this.sortBy,
      sortDirection: this.sortDirection
    };

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

    const f = this.filters;
    if (f.site) query.site = f.site;
    if (f.itemCode) query.itemCode = f.itemCode;
    if (f.itemName) query.itemName = f.itemName;
    if (f.vendor) query.vendor = f.vendor;
    if (f.customerCode) query.customerCode = f.customerCode;
    if (f.customerName) query.customerName = f.customerName;
    if (f.state) query.state = f.state;
    if (f.zipCode) query.zipCode = f.zipCode;
    if (f.address) query.address = f.address;
    if (f.invoiceId) query.invoiceId = f.invoiceId;
    if (f.batch) query.batch = f.batch;
    if (f.invoiceDateFrom) query.invoiceDateFrom = f.invoiceDateFrom;
    if (f.invoiceDateTo) query.invoiceDateTo = f.invoiceDateTo;
    if (f.invoiceAmountMin) query.invoiceAmountMin = Number(f.invoiceAmountMin);
    if (f.invoiceAmountMax) query.invoiceAmountMax = Number(f.invoiceAmountMax);
    if (f.salesQtyMin) query.salesQtyMin = Number(f.salesQtyMin);
    if (f.salesQtyMax) query.salesQtyMax = Number(f.salesQtyMax);
    if (f.bonusQtyMin) query.bonusQtyMin = Number(f.bonusQtyMin);
    if (f.bonusQtyMax) query.bonusQtyMax = Number(f.bonusQtyMax);
    if (f.salesReturnQtyMin) query.salesReturnQtyMin = Number(f.salesReturnQtyMin);
    if (f.salesReturnQtyMax) query.salesReturnQtyMax = Number(f.salesReturnQtyMax);
    if (f.bonusReturnQtyMin) query.bonusReturnQtyMin = Number(f.bonusReturnQtyMin);
    if (f.bonusReturnQtyMax) query.bonusReturnQtyMax = Number(f.bonusReturnQtyMax);
    if (f.rowMonth) query.rowMonth = Number(f.rowMonth);
    if (f.rowYear) query.rowYear = Number(f.rowYear);

    return query;
  }

  loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const query = this.buildQuery();

    this.customerSalesDetailService.getPaged(query).subscribe({
      next: (response) => {
        if (!response.success) {
          this.errorMessage = response.error || 'Failed to load report';
          this.rows = [];
          this.totalRecords = 0;
          this.totalPages = 0;
          this.isLoading = false;
          return;
        }

        this.rows = response.data;
        this.totalRecords = response.totalRecords;
        this.totalPages = response.totalPages;
        this.currentPage = response.currentPage;
        this.pageSize = response.pageSize;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error loading customer sales detail:', error);
        this.errorMessage = 'Failed to load report';
        this.isLoading = false;
      }
    });
  }

  onTimeframeChange(timeframe: TimeframeType): void {
    this.selectedTimeframe = timeframe;

    if (this.dashboardFilter?.mode === 'month' || this.dashboardFilter?.mode === 'range') {
      return;
    }

    this.currentPage = 1;
    this.loadData();
  }

  formatNumber(value: number): string {
    return (value || 0).toLocaleString('en-US');
  }

  onFilterChange(): void {
    this.filtersSubject.next();
  }

  clearColumnFilter(...keys: (keyof ColumnFilters)[]): void {
    keys.forEach(k => (this.filters[k] = ''));
    this.currentPage = 1;
    this.loadData();
  }

  clearFilters(): void {
    this.filters = emptyFilters();
    this.activeFilterColumn = null;
    this.currentPage = 1;
    this.loadData();
  }

  get hasActiveFilters(): boolean {
    return Object.values(this.filters).some(v => v !== '');
  }

  onSort(column: string): void {
    if (this.sortBy === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDirection = 'asc';
    }
    this.currentPage = 1;
    this.loadData();
  }

  sortIcon(column: string): string {
    if (this.sortBy !== column) return 'ti-arrows-sort';
    return this.sortDirection === 'asc' ? 'ti-sort-ascending' : 'ti-sort-descending';
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    start = Math.max(1, end - maxVisible + 1);

    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
    this.loadData();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadData();
  }

  get canExport(): boolean {
    return this.dashboardFilter?.mode === 'month' || this.dashboardFilter?.mode === 'range';
  }

  onExportClick(): void {
    this.exportError = '';

    if (!this.canExport || !this.dashboardFilter) {
      this.exportError = 'Select a Monthly or Date Range filter to export.';
      return;
    }

    const query = this.buildQuery();
    this.isExporting = true;

    this.exportService.export(query).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        const today = new Date().toISOString().slice(0, 10);
        a.download = `CustomerSalesDetail_${today}.xlsx`;

        document.body.appendChild(a);
        a.click();
        a.remove();

        window.URL.revokeObjectURL(url);
        this.isExporting = false;
      },
      error: (err: any) => {
        console.error('❌ Error exporting customer sales detail:', err);
        this.exportError = 'Failed to export. Please try again.';
        this.isExporting = false;
      }
    });
  }
}