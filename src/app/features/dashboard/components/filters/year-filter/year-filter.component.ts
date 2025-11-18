import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { YearType } from '../../../models/dashboard.model';

@Component({
  selector: 'app-year-filter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './year-filter.component.html',
  styleUrls: ['./year-filter.component.scss']
})
export class YearFilterComponent {
  @Input() selectedYear: YearType = 2025;
  @Output() yearChange = new EventEmitter<YearType>();

  years: YearType[] = [2022, 2023, 2024, 2025];

  onYearChange(year: YearType): void {
    this.selectedYear = year;
    this.yearChange.emit(year);
  }
}