import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimeframeType } from '../../models/dashboard.model';

interface KPICard {
  id: string;
  title: string;
  icon: string;
  timeframe: string;
  sections: KPISection[];
}

interface KPISection {
  title: string;
  items: KPIItem[];
}

interface KPIItem {
  label: string;
  value: string | number;
  percentage?: string;
  highlight?: boolean;
}

@Component({
  selector: 'app-kpi-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kpi-cards.component.html',
  styleUrls: ['./kpi-cards.component.scss']
})
export class KpiCardsComponent {
  @Input() selectedTimeframe: TimeframeType = 'Today';
  @Output() timeframeChange = new EventEmitter<TimeframeType>();
  
  timeframes: TimeframeType[] = ['Today', 'MTD', 'QTD', 'YTD'];
  kpiCards: KPICard[] = [
    // Card 1: KPI
    {
      id: 'kpi',
      title: 'KPI',
      icon: '📊',
      timeframe: 'Today',
      sections: [
        {
          title: 'Clients',
          items: [
            { label: 'Active', value: 10 },
            { label: 'All', value: 593 },
            { label: '%', value: 2 }
          ]
        },
        {
          title: 'Vendors',
          items: [
            { label: 'Active', value: 13 },
            { label: 'All', value: 50 },
            { label: '%', value: 26 }
          ]
        },
        {
          title: 'Items',
          items: [
            { label: 'Active', value: 46 },
            { label: 'All', value: 328 },
            { label: '%', value: 14 }
          ]
        },
        {
          title: 'Reps',
          items: [
            { label: 'Active', value: 4 },
            { label: 'All', value: 17 },
            { label: '%', value: 24 }
          ]
        }
      ]
    },

    // Card 2: Collect
    {
      id: 'collect',
      title: 'Collect',
      icon: '💰',
      timeframe: 'Today',
      sections: [
        {
          title: '',
          items: [
            { label: 'Total', value: '797,922', highlight: true }
          ]
        },
        {
          title: '',
          items: [
            { label: 'Today CT', value: '10,350,407' },
            { label: 'Achieved %', value: '7.71' },
            { label: 'Remaining', value: '9,552,485' },
            { label: 'Remaining %', value: '92.29' }
          ]
        },
        {
          title: 'Payment Methods',
          items: [
            { label: 'Cash', value: 0 },
            { label: 'Check', value: '797,922' },
            { label: 'Transfer', value: 0 },
            { label: 'Reject', value: 0 }
          ]
        }
      ]
    },

    // Card 3: Inventory
    {
      id: 'inventory',
      title: 'Inventory',
      icon: '📦',
      timeframe: 'Today',
      sections: [
        {
          title: '',
          items: [
            { label: 'Total', value: '3,178,216,104', highlight: true }
          ]
        },
        {
          title: 'Store Details',
          items: [
            { label: 'Store', value: 11 },
            { label: 'TVV', value: 0 },
            { label: 'TVQ', value: '29,875,925' }
          ]
        },
        {
          title: 'TEV Breakdown',
          items: [
            { label: 'TEV (Actual)', value: '161,729,187' },
            { label: 'TEV (Q1)', value: '18,070,334' },
            { label: 'TEV (Q2)', value: '29,545,052' },
            { label: 'TEV (Q3)', value: '46,299,059' },
            { label: 'TEV (Q4)', value: '136,394,723' }
          ]
        }
      ]
    },

    // Card 4: Purchase
    {
      id: 'purchase',
      title: 'Purchase',
      icon: '🛒',
      timeframe: 'Today',
      sections: [
        {
          title: '',
          items: [
            { label: 'Total', value: 0, highlight: true }
          ]
        },
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
  onTimeframeChange(timeframe: TimeframeType): void {
    this.selectedTimeframe = timeframe;
    this.timeframeChange.emit(timeframe);
  }
  formatNumber(value: string | number): string {
    if (typeof value === 'number') {
      return value.toLocaleString('en-US');
    }
    return value;
  }
}