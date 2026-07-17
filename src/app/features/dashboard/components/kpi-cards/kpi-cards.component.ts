import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
  OnInit,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  TimeframeType,
  ClientsKpiData,
  CollectionWidgetResponse,
  CollectionChannelDto
} from '../../models/dashboard.model';
import { DashboardService } from '../../services/dashboard.service';
import { delay } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import { SignalRService, SyncNotification } from '../../../../services/signalr';
import { HeaderDashboardFilter } from '../../../../layout/header/header.component';
import { InventoryCardComponent } from "../inventory-card/inventory-card";

export interface SubChannel {
  label: string;
  value: string | number;
  percentage?: string;
  colorClass:
    | 'dot-retail'
    | 'dot-hospital'
    | 'dot-cosmetics'
    | 'dot-bulk'
    | 'dot-tender'
    | 'dot-export'
    | 'dot-clinic';
}

export interface DistributionItem {
  label: string;
  icon: string;
  value: string | number;
  expanded: boolean;
  subChannels: SubChannel[];
}

export interface KPIItem {
  label: string;
  value: string | number;
  percentage?: string;
  highlight?: boolean;
}

export interface KPISection {
  title: string;
  isDistribution?: boolean;
  items: KPIItem[];
  distItems?: DistributionItem[];
}

export interface KPICard {
  id: string;
  title: string;
  icon: string;
  timeframe: string;
  sections: KPISection[];
}

@Component({
  selector: 'app-kpi-cards',
  standalone: true,
  imports: [CommonModule, InventoryCardComponent],
  templateUrl: './kpi-cards.component.html',
  styleUrls: ['./kpi-cards.component.scss']
})
export class KpiCardsComponent implements OnInit, OnChanges, OnDestroy {
  @Input() selectedTimeframe: TimeframeType = 'Today';
  @Input() dashboardFilter: HeaderDashboardFilter | null = null;

  @Output() timeframeChange = new EventEmitter<TimeframeType>();

  timeframes: TimeframeType[] = ['Today', 'MTD', 'QTD', 'YTD'];

  loading = false;
  private syncing = false;

  private subStarted?: Subscription;
  private subCompleted?: Subscription;
  private subFailed?: Subscription;

  kpiCards: KPICard[] = [
    {
      id: 'kpi',
      title: 'KPI',
      icon: '📊',
      timeframe: 'Today',
      sections: [
        {
          title: 'Clients',
          items: [
            { label: 'Active', value: 0 },
            { label: 'All', value: 0 },
            { label: '%', value: '0.00%' }
          ]
        },
        {
          title: 'Vendors',
          items: [
            { label: 'Active', value: 0 },
            { label: 'All', value: 0 },
            { label: '%', value: 0 }
          ]
        },
        {
          title: 'Items',
          items: [
            { label: 'Active', value: 0 },
            { label: 'All', value: 0 },
            { label: '%', value: 0 }
          ]
        }
      ]
    },
    {
      id: 'collect',
      title: 'Collect',
      icon: '💰',
      timeframe: 'Today',
      sections: [
        {
          title: '',
          items: [{ label: 'Total', value: '0', highlight: true }]
        },
        {
          title: 'Total Collections',
          items: [
            { label: 'Cash', value: 0 },
            { label: 'Check', value: 0 },
            { label: 'Transfer', value: 0 }
          ]
        },
        {
          title: 'Distribution Channels',
          isDistribution: true,
          items: [],
          distItems: [
            {
              label: 'Cash',
              icon: '💵',
              value: 0,
              expanded: false,
              subChannels: this.createEmptySubChannels()
            },
            {
              label: 'Check',
              icon: '📋',
              value: 0,
              expanded: false,
              subChannels: this.createEmptySubChannels()
            },
            {
              label: 'Transfer',
              icon: '🔄',
              value: 0,
              expanded: false,
              subChannels: this.createEmptySubChannels()
            }
          ]
        }
      ]
    },
    // {
    //   id: 'inventory',
    //   title: 'Inventory',
    //   icon: '📦',
    //   timeframe: 'Today',
    //   sections: [
    //     { title: '', items: [{ label: 'Total', value: '0', highlight: true }] },
    //     {
    //       title: 'Store Details',
    //       items: [
    //         { label: 'Store', value: 0 },
    //         { label: 'TVV', value: 0 },
    //         { label: 'TVQ', value: '0' }
    //       ]
    //     },
    //     {
    //       title: 'TEV Breakdown',
    //       items: [
    //         { label: 'TEV (Actual)', value: '0' },
    //         { label: 'TEV (Q1)', value: '0' },
    //         { label: 'TEV (Q2)', value: '0' },
    //         { label: 'TEV (Q3)', value: '0' },
    //         { label: 'TEV (Q4)', value: '0' }
    //       ]
    //     }
    //   ]
    // },
    {
      id: 'purchase',
      title: 'Purchase',
      icon: '🛒',
      timeframe: 'Today',
      sections: [
        { title: '', items: [{ label: 'Total', value: 0, highlight: true }] },
        {
          title: 'Purchase Orders',
          items: [
            { label: 'Opened', value: 0 },
            { label: 'Settled', value: 0 },
            { label: 'PO Expenses', value: 0 }
          ]
        },
        {
          title: 'Expenses',
          items: [
            { label: 'General Expenses', value: 0 },
            { label: 'All Expenses', value: 0 }
          ]
        }
      ]
    }
  ];

  constructor(
    private dashboardService: DashboardService,
    private signalRService: SignalRService
  ) {}

  ngOnInit(): void {
    this.loadAll(true);

    this.subStarted = this.signalRService.syncStarted$.subscribe(() => {
      this.syncing = true;
      this.loading = true;
    });

    this.subCompleted = this.signalRService.syncCompleted$.subscribe((n: SyncNotification) => {
      this.syncing = false;
      if (n && n.success) {
        setTimeout(() => this.loadAll(true), 500);
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
    if (changes['selectedTimeframe'] || changes['dashboardFilter']) {
      this.loadAll(true);
    }
  }

  ngOnDestroy(): void {
    this.subStarted?.unsubscribe();
    this.subCompleted?.unsubscribe();
    this.subFailed?.unsubscribe();
  }

  onTimeframeChange(timeframe: TimeframeType): void {
    this.selectedTimeframe = timeframe;
    this.timeframeChange.emit(timeframe);

    if (this.dashboardFilter?.mode === 'month' || this.dashboardFilter?.mode === 'range') {
      return;
    }

    this.loadAll(true);
  }

  toggleDistribution(item: DistributionItem): void {
    item.expanded = !item.expanded;
  }

  private loadAll(force = false): void {
    if (this.syncing && !force) return;

    this.loading = true;
    const requestDate = this.resolveRequestDate();

    this.dashboardService
      .getClientsKpi(this.selectedTimeframe, requestDate)
      .pipe(delay(150))
      .subscribe({
        next: (data: ClientsKpiData) => {
          this.applyClientsKpi(data);
        },
        error: () => {
          this.applyClientsKpi({ all: 0, active: 0, inactive: 0, activePct: 0 });
        }
      });

    this.dashboardService
      .getCollectionsWidget(this.selectedTimeframe, requestDate)
      .pipe(delay(150))
      .subscribe({
        next: (data: CollectionWidgetResponse) => {
          console.log('COLLECTION RESPONSE =>', data);
          this.applyCollections(data);
          this.loading = false;
        },
        error: (err) => {
          console.error('COLLECTION ERROR =>', err);
          this.applyCollections({
            total: 0,
            details: 0,
            cashDiscounts: 0,
            cash: { total: 0, channels: [] },
            check: { total: 0, channels: [] },
            transfer: { total: 0, channels: [] }
          });
          this.loading = false;
        }
      });
  }

  private resolveRequestDate(): Date {
    if (this.dashboardFilter?.mode === 'month' && this.dashboardFilter.year && this.dashboardFilter.month) {
      return new Date(Number(this.dashboardFilter.year), Number(this.dashboardFilter.month) - 1, 1);
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

  private applyClientsKpi(data: ClientsKpiData): void {
    const kpiCard = this.kpiCards.find(c => c.id === 'kpi');
    if (!kpiCard) return;

    const clientsSection = kpiCard.sections.find(s => s.title === 'Clients');
    if (!clientsSection || clientsSection.items.length < 3) return;

    clientsSection.items[0].value = Number(data.active ?? 0);
    clientsSection.items[1].value = Number(data.all ?? 0);
    clientsSection.items[2].value = `${Number(data.activePct ?? 0).toFixed(2)}%`;
  }

  private applyCollections(data: CollectionWidgetResponse): void {
    const collectCard = this.kpiCards.find(c => c.id === 'collect');
    if (!collectCard) return;

    const totalSection = collectCard.sections[0];
    const totalsSection = collectCard.sections[1];
    const distributionSection = collectCard.sections[2];

    totalSection.items[0].value = Number(data.total ?? 0);

    totalsSection.items[0].value = Number(data.cash?.total ?? 0);
    totalsSection.items[1].value = Number(data.check?.total ?? 0);
    totalsSection.items[2].value = Number(data.transfer?.total ?? 0);

    if (distributionSection.distItems && distributionSection.distItems.length >= 3) {
      distributionSection.distItems[0].value = Number(data.cash?.total ?? 0);
      distributionSection.distItems[0].subChannels = this.mapChannels(data.cash?.channels ?? []);

      distributionSection.distItems[1].value = Number(data.check?.total ?? 0);
      distributionSection.distItems[1].subChannels = this.mapChannels(data.check?.channels ?? []);

      distributionSection.distItems[2].value = Number(data.transfer?.total ?? 0);
      distributionSection.distItems[2].subChannels = this.mapChannels(data.transfer?.channels ?? []);
    }
  }

  private mapChannels(channels: CollectionChannelDto[]): SubChannel[] {
    return [
      this.findChannel(channels, '10', 'Retail', 'dot-retail'),
      this.findChannel(channels, '20', 'Hospital', 'dot-hospital'),
      this.findChannel(channels, '30', 'Cosmetics', 'dot-cosmetics'),
      this.findChannel(channels, '40', 'Bulk', 'dot-bulk'),
      this.findChannel(channels, '50', 'Tender', 'dot-tender'),
      this.findChannel(channels, '60', 'Export', 'dot-export'),
      this.findChannel(channels, '70', 'Clinic', 'dot-clinic')
    ];
  }

  private findChannel(
    channels: CollectionChannelDto[],
    code: string,
    fallbackLabel: string,
    colorClass: SubChannel['colorClass']
  ): SubChannel {
    const match = channels.find(x => `${x.code}` === code);

    return {
      label: match?.name || fallbackLabel,
      value: Number(match?.value ?? 0),
      percentage: undefined,
      colorClass
    };
  }

  private createEmptySubChannels(): SubChannel[] {
    return [
      { label: 'Retail', value: 0, percentage: undefined, colorClass: 'dot-retail' },
      { label: 'Hospital', value: 0, percentage: undefined, colorClass: 'dot-hospital' },
      { label: 'Cosmetics', value: 0, percentage: undefined, colorClass: 'dot-cosmetics' },
      { label: 'Bulk', value: 0, percentage: undefined, colorClass: 'dot-bulk' },
      { label: 'Tender', value: 0, percentage: undefined, colorClass: 'dot-tender' },
      { label: 'Export', value: 0, percentage: undefined, colorClass: 'dot-export' },
      { label: 'Clinic', value: 0, percentage: undefined, colorClass: 'dot-clinic' }
    ];
  }

  formatNumber(value: string | number): string {
    if (typeof value === 'number') return value.toLocaleString('en-US');
    return value ?? '';
  }
}