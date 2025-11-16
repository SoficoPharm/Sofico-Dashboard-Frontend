import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimeframeType } from '../../../models/dashboard.model';

interface BreakEvenData {
  percentage: number;
  maximumRate: number;
  target: number;
  sales: number;
  collect: number;
  expenses: {
    salaries: number;
    commission: number;
    rent: number;
    bank: number;
    cars: number;
    others: number;
    total: number;
  };
}

@Component({
  selector: 'app-break-even-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './break-even-widget.component.html',
  styleUrls: ['./break-even-widget.component.scss']
})
export class BreakEvenWidgetComponent {
  @Input() data: BreakEvenData = {
    percentage: 5.38,
    maximumRate: 5.38,
    target: 0,
    sales: 409729963,
    collect: -18146389,
    expenses: {
      salaries: 0,
      commission: 0,
      rent: 0,
      bank: 0,
      cars: 0,
      others: 0,
      total: 0
    }
  };

  @Input() selectedTimeframe: TimeframeType = 'MTD';
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