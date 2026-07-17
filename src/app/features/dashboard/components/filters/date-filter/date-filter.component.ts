import { Component, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-date-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './date-filter.component.html',
  styleUrls: ['./date-filter.component.scss']
})
export class DateFilterComponent implements OnInit {
  @Input() selectedDate: Date = new Date();
  @Output() dateChange = new EventEmitter<Date>();

  ngOnInit(): void {
    // ✅ Ensure date is initialized correctly
    if (!this.selectedDate) {
      this.selectedDate = new Date();
    }
  }

  onDateChange(event: any): void {
    const newDate = new Date(event.target.value);
    this.selectedDate = newDate;
    this.dateChange.emit(newDate);
  }

  // ✅ Format date for input[type="date"] (YYYY-MM-DD)
  get formattedDate(): string {
    const year = this.selectedDate.getFullYear();
    const month = String(this.selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(this.selectedDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}