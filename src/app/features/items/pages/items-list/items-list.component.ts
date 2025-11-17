import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Item {
  id: string;
  name: string;
  logo: string;
  sales: number;
  target: number;
  achievedPercentage: number;
  category: string;
}

@Component({
  selector: 'app-items-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './items-list.component.html',
  styleUrls: ['./items-list.component.scss']
})
export class ItemsListComponent implements OnInit {
  items: Item[] = [];
  filteredItems: Item[] = [];
  searchQuery = '';

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.items = [
      { id: '1', name: 'Product A', logo: '📦', sales: 1500000, target: 1800000, achievedPercentage: 83.3, category: 'Category A' },
      { id: '2', name: 'Product B', logo: '📦', sales: 1200000, target: 1400000, achievedPercentage: 85.7, category: 'Category B' },
      { id: '3', name: 'Product C', logo: '📦', sales: 980000, target: 1000000, achievedPercentage: 98.0, category: 'Category C' },
      { id: '4', name: 'Product D', logo: '📦', sales: 750000, target: 900000, achievedPercentage: 83.3, category: 'Category A' },
      { id: '5', name: 'Product E', logo: '📦', sales: 650000, target: 700000, achievedPercentage: 92.9, category: 'Category D' },
      { id: '6', name: 'Product F', logo: '📦', sales: 550000, target: 600000, achievedPercentage: 91.7, category: 'Category B' },
      { id: '7', name: 'Product G', logo: '📦', sales: 480000, target: 550000, achievedPercentage: 87.3, category: 'Category C' },
      { id: '8', name: 'Product H', logo: '📦', sales: 420000, target: 500000, achievedPercentage: 84.0, category: 'Category A' },
      { id: '9', name: 'Product I', logo: '📦', sales: 380000, target: 400000, achievedPercentage: 95.0, category: 'Category D' },
      { id: '10', name: 'Product J', logo: '📦', sales: 320000, target: 350000, achievedPercentage: 91.4, category: 'Category B' }
    ];
    this.filteredItems = [...this.items];
  }

  onSearch(event: any): void {
    this.searchQuery = event.target.value.toLowerCase();
    this.filteredItems = this.items.filter(item =>
      item.name.toLowerCase().includes(this.searchQuery) ||
      item.category.toLowerCase().includes(this.searchQuery)
    );
  }

  formatNumber(value: number): string {
    return value.toLocaleString('en-US');
  }
}