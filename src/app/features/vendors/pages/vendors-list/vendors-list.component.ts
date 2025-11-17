import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Vendor {
  id: string;
  name: string;
  logo: string;
  sales: number;
  target: number;
  achievedPercentage: number;
}

@Component({
  selector: 'app-vendors-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vendors-list.component.html',
  styleUrls: ['./vendors-list.component.scss']
})
export class VendorsListComponent implements OnInit {
  vendors: Vendor[] = [];
  filteredVendors: Vendor[] = [];
  searchQuery = '';

  ngOnInit(): void {
    this.loadVendors();
  }

  loadVendors(): void {
    this.vendors = [
      { id: '1', name: 'JANSSEN', logo: '📈', sales: 4432475, target: 5000000, achievedPercentage: 88.6 },
      { id: '2', name: 'PFFI', logo: '📈', sales: 550415, target: 600000, achievedPercentage: 91.7 },
      { id: '3', name: 'MARCYRL', logo: '📈', sales: 400904, target: 450000, achievedPercentage: 89.1 },
      { id: '4', name: 'APEX pharma', logo: '📈', sales: 270977, target: 300000, achievedPercentage: 90.3 },
      { id: '5', name: 'ADWIA', logo: '📈', sales: 0, target: 500000, achievedPercentage: 0 },
      { id: '6', name: 'SUNNY PHARMACEUTICAL', logo: '📈', sales: 47150, target: 50000, achievedPercentage: 94.3 },
      { id: '7', name: 'AMRIYA PHARMACEUTICAL', logo: '📈', sales: 24079, target: 30000, achievedPercentage: 80.3 },
      { id: '8', name: 'PHARMA_LOCAL', logo: '📈', sales: 17288, target: 20000, achievedPercentage: 86.4 },
      { id: '9', name: 'MED SUPPLIES CO', logo: '📈', sales: 156000, target: 180000, achievedPercentage: 86.7 },
      { id: '10', name: 'HEALTH PHARMA', logo: '📈', sales: 98500, target: 120000, achievedPercentage: 82.1 }
    ];
    this.filteredVendors = [...this.vendors];
  }

  onSearch(event: any): void {
    this.searchQuery = event.target.value.toLowerCase();
    this.filteredVendors = this.vendors.filter(vendor =>
      vendor.name.toLowerCase().includes(this.searchQuery)
    );
  }

  formatNumber(value: number): string {
    return value.toLocaleString('en-US');
  }
}