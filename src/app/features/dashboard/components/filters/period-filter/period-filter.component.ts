import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PeriodType } from '../../../models/dashboard.model';

@Component({
  selector: 'app-period-filter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './period-filter.component.html',
  styleUrls: ['./period-filter.component.scss']
})
export class PeriodFilterComponent {
  @Input() selectedPeriod: PeriodType = 'monthly';
  @Output() periodChange = new EventEmitter<PeriodType>();

  onPeriodChange(period: PeriodType): void {
    this.selectedPeriod = period;
    this.periodChange.emit(period);
  }
}