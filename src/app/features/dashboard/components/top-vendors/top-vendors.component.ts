import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Vendor {
  id: string;
  name: string;
  logo: string;
  sales: number;
  target: number;
}

@Component({
  selector: 'app-top-vendors',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './top-vendors.component.html',
  styleUrls: ['./top-vendors.component.scss']
})
export class TopVendorsComponent {
  activeTab: 'vendors' | 'items' = 'vendors';
  
  topVendors: Vendor[] = [
    { id: '1', name: 'JANSSEN', logo: '📈', sales: 4432475, target: 0 },
    { id: '2', name: 'PFFI', logo: '📈', sales: 550415, target: 0 },
    { id: '3', name: 'MARCYRL', logo: '📈', sales: 400904, target: 0 },
    { id: '4', name: 'APEX pharma', logo: '📈', sales: 270977, target: 0 },
    { id: '5', name: 'ADWIA', logo: '📈', sales: 0, target: 0 },
    { id: '6', name: 'SUNNY PHARMACEUTICAL', logo: '📈', sales: 47150, target: 0 },
    { id: '7', name: 'شركة تجارة أدوية فرقا', logo: '📈', sales: 45054, target: 0 },
    { id: '8', name: 'شركة تجارة أدوية بناء', logo: '📈', sales: 0, target: 0 },
    { id: '9', name: 'AMRIYA PHARMACEUTICAL', logo: '📈', sales: 24079, target: 0 },
    { id: '10', name: 'PHARMA_LOCAL', logo: '📈', sales: 17288, target: 0 }
  ];

  topItems: Vendor[] = [
    { id: '1', name: 'Product A', logo: '📦', sales: 1500000, target: 0 },
    { id: '2', name: 'Product B', logo: '📦', sales: 1200000, target: 0 },
    { id: '3', name: 'Product C', logo: '📦', sales: 980000, target: 0 },
    { id: '4', name: 'Product D', logo: '📦', sales: 750000, target: 0 },
    { id: '5', name: 'Product E', logo: '📦', sales: 650000, target: 0 },
    { id: '6', name: 'Product F', logo: '📦', sales: 550000, target: 0 },
    { id: '7', name: 'Product G', logo: '📦', sales: 480000, target: 0 },
    { id: '8', name: 'Product H', logo: '📦', sales: 420000, target: 0 },
    { id: '9', name: 'Product I', logo: '📦', sales: 380000, target: 0 },
    { id: '10', name: 'Product J', logo: '📦', sales: 320000, target: 0 }
  ];

  constructor(private router: Router) {}

  // ✅ Switch between Vendors and Items tabs
  switchTab(tab: 'vendors' | 'items'): void {
    this.activeTab = tab;
  }

  // ✅ Navigate to All Vendors or All Items page
  viewAll(): void {
    if (this.activeTab === 'vendors') {
      this.router.navigate(['/vendors']);
    } else {
      this.router.navigate(['/items']);
    }
  }

  // ✅ Format numbers with commas
  formatNumber(value: number): string {
    return value.toLocaleString('en-US');
  }
}