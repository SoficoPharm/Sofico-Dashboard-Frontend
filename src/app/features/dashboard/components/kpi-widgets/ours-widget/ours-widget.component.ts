import { Component, Input, Output, EventEmitter, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart } from 'chart.js/auto';
import { TimeframeType } from '../../../models/dashboard.model';

interface OursClient {
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
export class OursWidgetComponent implements AfterViewInit, OnDestroy {
  @ViewChild('donutCanvas') donutCanvas!: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;

  @Input() clients: OursClient[] = [
    { name: 'NowFoods', clientCount: 70, value: 5000, percentage: 70, color: '#1e40af' },
    { name: 'Sofiguard', clientCount: 20, value: 4000, percentage: 20, color: '#ef4444' },
    { name: 'CosmaLine', clientCount: 10, value: 2000, percentage: 10, color: '#f59e0b' }
  ];

  @Input() selectedTimeframe: TimeframeType = 'Today';
  @Output() timeframeChange = new EventEmitter<TimeframeType>();
  
  timeframes: TimeframeType[] = ['Today', 'MTD', 'QTD', 'YTD'];

  ngAfterViewInit(): void {
    this.createDonutChart();
  }

  onTimeframeChange(timeframe: TimeframeType): void {
    this.selectedTimeframe = timeframe;
    this.timeframeChange.emit(timeframe);
  }

  createDonutChart(): void {
    const ctx = this.donutCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: this.clients.map(c => c.name),
        datasets: [{
          data: this.clients.map(c => c.value),
          backgroundColor: this.clients.map(c => c.color),
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed;
                return `${label}: ${value.toLocaleString()}`;
              }
            }
          }
        }
      }
    });
  }

  formatNumber(value: number): string {
    return value.toLocaleString('en-US');
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}