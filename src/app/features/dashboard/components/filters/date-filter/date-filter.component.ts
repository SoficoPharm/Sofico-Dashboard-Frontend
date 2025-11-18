import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-date-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './date-filter.component.html',
  styleUrls: ['./date-filter.component.scss']
})
export class DateFilterComponent {
  @Input() selectedDate: Date = new Date();
  @Output() dateChange = new EventEmitter<Date>();

  onDateChange(event: any): void {
    const newDate = new Date(event.target.value);
    this.selectedDate = newDate;
    this.dateChange.emit(newDate);
  }

  // Format date for input[type="date"]
  get formattedDate(): string {
    return this.selectedDate.toISOString().split('T')[0];
  }
}