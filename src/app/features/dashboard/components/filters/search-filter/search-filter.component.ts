import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search-filter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search-filter.component.html',
  styleUrls: ['./search-filter.component.scss']
})
export class SearchFilterComponent {
  @Output() searchClick = new EventEmitter<void>();

  onSearchClick(): void {
    this.searchClick.emit();
  }
}