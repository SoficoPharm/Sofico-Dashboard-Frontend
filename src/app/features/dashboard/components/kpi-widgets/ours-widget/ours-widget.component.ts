// In ours-widget.component.ts

import {
  Component,
  Input,
  Output,
  EventEmitter,
  AfterViewInit,
  ViewChild,
  ElementRef,
  OnDestroy,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart } from 'chart.js/auto';
import { TimeframeType, OursRow, OursResponse } from '../../../models/dashboard.model';
import { HeaderDashboardFilter } from '../../../../../layout/header/header.component';

interface OursClientVM {
  code: string;
  name: string;
  clientCount: number;
  value: number;
  percentage: number;
  color: string;
}

@Component({
  selector: 'app-ours-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ours-widget.component.html',
  styleUrls: ['./ours-widget.component.scss']
})
export class OursWidgetComponent implements AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('donutCanvas') donutCanvas!: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;

  @Input() rows: OursRow[] = [];
  @Input() summary?: {  // 👈 Add summary input
    totalClients: number;
    totalValue: number;
    totalPercentage: number;
  };
  @Input() loading: boolean = false;
  @Input() selectedTimeframe: TimeframeType = 'Today';
  @Input() dashboardFilter: HeaderDashboardFilter | null = null;

  @Output() timeframeChange = new EventEmitter<TimeframeType>();

  timeframes: TimeframeType[] = ['Today', 'MTD', 'QTD', 'YTD'];

  clientsVM: OursClientVM[] = [];
  hasData = false;

  // 👈 Add computed totals for display
  get totalClients(): number {
    if (this.summary?.totalClients !== undefined) {
      return this.summary.totalClients;
    }
    // Fallback: calculate from rows
    return this.clientsVM.reduce((sum, client) => sum + client.clientCount, 0);
  }

  get totalValue(): number {
    if (this.summary?.totalValue !== undefined) {
      return this.summary.totalValue;
    }
    // Fallback: calculate from rows
    return this.clientsVM.reduce((sum, client) => sum + client.value, 0);
  }

  get totalPercentage(): number {
    if (this.summary?.totalPercentage !== undefined) {
      return this.summary.totalPercentage;
    }
    // Fallback: calculate from rows
    return this.clientsVM.reduce((sum, client) => sum + client.percentage, 0);
  }

  private colorMap: Record<string, string> = {
    MC0027: '#1e40af',
    MC0078: '#ef4444',
    MD0141: '#f59e0b',
    SOFILIE: '#10b981',
    MD0231: '#8b5cf6'
  };

  private nameMap: Record<string, string> = {
    MC0027: 'GEROLYMATOS INTER.',
    MC0078: 'Sofico Cosmetics',
    MD0141: 'NOW FOODS',
    SOFILIE: 'SOFILIE',
    MD0231: 'BENOSTAN HEALTH PROD'
  };

  ngAfterViewInit(): void {
    this.rebuildVM();
    this.createOrUpdateChart(true);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rows'] || changes['summary'] || changes['loading'] || changes['dashboardFilter']) {
      this.rebuildVM();
      this.createOrUpdateChart(false);
    }
  }

  onTimeframeChange(timeframe: TimeframeType): void {
    this.selectedTimeframe = timeframe;
    this.timeframeChange.emit(timeframe);
  }

  private rebuildVM(): void {
    const safe = Array.isArray(this.rows) ? this.rows : [];

    this.clientsVM = safe.map(r => {
      const code = (r.code ?? '').trim();
      const rawName = (r.name ?? '').trim();

      const finalName =
        rawName && rawName !== code
          ? rawName
          : (this.nameMap[code] ?? 'Unknown Client');

      return {
        code,
        name: finalName,
        clientCount: Number(r.clients ?? 0),
        value: Number(r.value ?? 0),
        percentage: Math.round(Number(r.percentage ?? 0) * 100) / 100,
        color: this.colorMap[code] ?? '#94a3b8'
      };
    });

    this.hasData = this.clientsVM.some(
      x => (x.value ?? 0) !== 0 || (x.clientCount ?? 0) > 0
    );
  }

  private createOrUpdateChart(forceCreate: boolean): void {
    if (!this.donutCanvas?.nativeElement) return;

    const ctx = this.donutCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = this.clientsVM.map(c => c.name);
    const values = this.clientsVM.map(c => Math.abs(c.value));
    const colors = this.clientsVM.map(c => c.color);

    const chartLabels = this.hasData ? labels : ['No data'];
    const chartValues = this.hasData ? values : [1];
    const chartColors = this.hasData ? colors : ['#e5e7eb'];

    if (forceCreate || !this.chart) {
      this.chart?.destroy();

      this.chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: chartLabels,
          datasets: [
            {
              data: chartValues,
              backgroundColor: chartColors,
              borderWidth: 0
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%',
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.label || '';
                  const value = Number(context.parsed ?? 0);

                  if (!this.hasData) {
                    return `${label}`;
                  }

                  const index = context.dataIndex ?? 0;
                  const originalValue = Number(this.clientsVM[index]?.value ?? 0);
                  const pct = Number(this.clientsVM[index]?.percentage ?? 0);

                  return `${label}: ${originalValue.toLocaleString()} (${pct.toFixed(2)}%)`;
                }
              }
            }
          }
        }
      });

      return;
    }

    this.chart.data.labels = chartLabels as any;
    this.chart.data.datasets[0].data = chartValues as any;
    (this.chart.data.datasets[0] as any).backgroundColor = chartColors;
    this.chart.update();
  }

  formatNumber(value: number): string {
    return (value ?? 0).toLocaleString('en-US');
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }
}