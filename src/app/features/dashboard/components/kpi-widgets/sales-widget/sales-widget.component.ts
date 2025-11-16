import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalesWidgetData, TimeframeType } from '../../../models/dashboard.model';

@Component({
  selector: 'app-sales-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sales-widget.component.html',
  styleUrls: ['./sales-widget.component.scss']
})
export class SalesWidgetComponent {
  @Input() data?: SalesWidgetData;
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

  ngOnInit(): void {
    if (!this.data) {
      this.data = this.getMockData();
    }
  }

  private getMockData(): SalesWidgetData {
    return {
      invoiceCount: 21,
      totalSales: 5289265,
      sd: 36330,
      allSales: 5325595,
      totalDiscount: 0,
      discountPercentage: 0,
      return: 205425,
      returnPercentage: 3.74,
      target: 0,
      achievedPercentage: 0,
      remaining: 0,
      remainingPercentage: 100,
      stp: 416355,
      stpPercentage: 1270.37,
      timeframe: this.selectedTimeframe
    };
  }
}