import { environment } from './../../../../../environments/environment';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-vendors-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vendors-list.component.html',
  styleUrls: ['./vendors-list.component.scss']
})
export class VendorsListComponent implements OnInit {
  // ✅ استخدام environment بدلاً من hardcoded URL
  apiUrl = environment.apiBaseUrl;
  
  vendors: any[] = [];
  filteredVendors: any[] = [];
  searchQuery = '';
  
  // ✅ Pagination
  currentPage = 1;
  pageSize = 100;
  totalCount = 0;
  totalPages = 0;
  
  // ✅ Loading & Error
  isLoading = false;
  errorMessage = '';

  constructor(private http: HttpClient) {
    console.log('========================================');
    console.log('🏢 Vendors List Component Initialized');
    console.log('📡 API URL:', this.apiUrl);
    console.log('🏭 Environment:', environment.production ? 'Production' : 'Development');
    console.log('========================================');
  }

  ngOnInit(): void {
    this.loadVendors();
  }

  /**
   * ✅ تحميل كل الموردين من API الجديد
   * GET: /api/DataSync/vendors?page=1&pageSize=100
   */
  loadVendors(): void {
    console.log(`🏢 Loading all vendors - Page ${this.currentPage}`);
    this.isLoading = true;
    this.errorMessage = '';

    const url = `${this.apiUrl}/vendors?page=${this.currentPage}&pageSize=${this.pageSize}`;
    
    this.http.get(url).subscribe({
      next: (res: any) => {
        if (!res || !res.success || !res.data) {
          console.log("API returned no data", res);
          this.errorMessage = 'No data returned from API';
          this.isLoading = false;
          return;
        }

        // ✅ تحويل البيانات من format API الجديد
        this.vendors = res.data.map((vendor: any) => ({
          vendorCode: vendor.vendorCode,
          vendorName: vendor.vendorName || vendor.vendorCode,
          value: vendor.totalSales || 0,
          orderCount: vendor.totalOrders || 0
        }));
        
        this.filteredVendors = [...this.vendors];
        this.totalCount = res.totalCount || 0;
        this.totalPages = Math.ceil(this.totalCount / this.pageSize);
        
        console.log(`✅ Loaded ${this.vendors.length} vendors from total ${this.totalCount}`);
        this.isLoading = false;
      },
      error: (err) => {
        console.error("❌ Error loading vendors:", err);
        this.errorMessage = 'Failed to load vendors';
        this.isLoading = false;
      }
    });
  }

  /**
   * ✅ البحث في الموردين
   */
  filterVendors(): void {
    const q = this.searchQuery.toLowerCase();
    
    if (!q) {
      this.filteredVendors = [...this.vendors];
      return;
    }
    
    this.filteredVendors = this.vendors.filter(v =>
      (v.vendorName && v.vendorName.toLowerCase().includes(q)) ||
      (v.vendorCode && v.vendorCode.toLowerCase().includes(q))
    );
    
    console.log(`🔍 Search: "${q}" - Found ${this.filteredVendors.length} vendors`);
  }

  /**
   * ✅ حساب النسبة المئوية
   */
  getPercentage(value: number) {
    if (!this.vendors.length) return 0;
    const max = Math.max(...this.vendors.map(v => v.value || 0));
    return max ? ((value / max) * 100).toFixed(1) : 0;
  }

  /**
   * ✅ تنسيق الأرقام
   */
  formatNumber(value: number): string {
    return value.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  }

  /**
   * ✅ الصفحة التالية
   */
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadVendors();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * ✅ الصفحة السابقة
   */
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadVendors();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * ✅ الذهاب لصفحة محددة
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadVendors();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}