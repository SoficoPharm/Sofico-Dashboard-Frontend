import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimeframeType } from '../../../models/dashboard.model';

interface StatisticsData {
  sd: number;
  sdPercentage: number;
  tenders: number;
  tendersPercentage: number;
  order: number;
  orderPercentage: number;
  openSD: number;
  openTender: number;
  openOrder: number;
  am: number;
  amPercentage: number;
  pm: number;
  pmPercentage: number;
}

@Component({
  selector: 'app-statistics-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './statistics-widget.component.html',
  styleUrls: ['./statistics-widget.component.scss']
})
export class StatisticsWidgetComponent {
  @Input() data: StatisticsData = {
    sd: 0,
    sdPercentage: 0,
    tenders: 333589,
    tendersPercentage: 8.22,
    order: 4392003,
    orderPercentage: 91.78,
    openSD: 0,
    openTender: 10087472,
    openOrder: 2665950,
    am: 6028559,
    amPercentage: 100,
    pm: 0,
    pmPercentage: 0
  };

  @Input() selectedTimeframe: TimeframeType = 'Today';
  @Output() timeframeChange = new EventEmitter<TimeframeType>();
  
  timeframes: TimeframeType[] = ['Today', 'MTD', 'QTD', 'YTD'];

  onTimeframeChange(timeframe: TimeframeType): void {
    this.selectedTimeframe = timeframe;
    this.timeframeChange.emit(timeframe);
  }

  formatNumber(value: number): string {
    return value.toLocaleString('en-US');
  }
}