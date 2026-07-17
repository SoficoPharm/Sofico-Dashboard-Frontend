import { environment } from './../../../../../environments/environment';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-items-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './items-list.component.html',
  styleUrls: ['./items-list.component.scss']
})
export class ItemsListComponent implements OnInit {
  // ✅ استخدام environment بدلاً من hardcoded URL
  apiUrl = environment.apiBaseUrl;
  
  items: any[] = [];
  filteredItems: any[] = [];
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
    console.log('📦 Items List Component Initialized');
    console.log('📡 API URL:', this.apiUrl);
    console.log('🏭 Environment:', environment.production ? 'Production' : 'Development');
    console.log('========================================');
  }

  ngOnInit(): void {
    this.loadItems();
  }

  /**
   * ✅ تحميل كل الأصناف من API الجديد
   * GET: /api/DataSync/items?page=1&pageSize=100
   */
  loadItems(): void {
    console.log(`📦 Loading all items - Page ${this.currentPage}`);
    this.isLoading = true;
    this.errorMessage = '';

    const url = `${this.apiUrl}/items?page=${this.currentPage}&pageSize=${this.pageSize}`;
    
    this.http.get(url).subscribe({
      next: (res: any) => {
        if (!res || !res.success || !res.data) {
          console.log("API returned no data", res);
          this.errorMessage = 'No data returned from API';
          this.isLoading = false;
          return;
        }
        
        // ✅ تحويل البيانات من format API الجديد
        this.items = res.data.map((item: any) => ({
          itemName: item.materialDescription || item.materialCode,
          materialCode: item.materialCode,
          value: item.totalSales || 0,
          quantity: item.totalQuantitySold || 0
        }));
        
        this.filteredItems = [...this.items];
        this.totalCount = res.totalCount || 0;
        this.totalPages = Math.ceil(this.totalCount / this.pageSize);
        
        console.log(`✅ Loaded ${this.items.length} items from total ${this.totalCount}`);
        this.isLoading = false;
      },
      error: (err) => {
        console.error("❌ Error loading items:", err);
        this.errorMessage = 'Failed to load items';
        this.isLoading = false;
      }
    });
  }

  /**
   * ✅ البحث في الأصناف
   */
  filterItems(): void {
    const q = this.searchQuery.toLowerCase();
    
    if (!q) {
      this.filteredItems = [...this.items];
      return;
    }
    
    this.filteredItems = this.items.filter(i =>
      (i.itemName && i.itemName.toLowerCase().includes(q)) ||
      (i.materialCode && i.materialCode.toLowerCase().includes(q))
    );
    
    console.log(`🔍 Search: "${q}" - Found ${this.filteredItems.length} items`);
  }

  /**
   * ✅ حساب النسبة المئوية
   */
  getPercentage(value: number) {
    if (!this.items.length) return 0;
    const max = Math.max(...this.items.map(i => i.value || 0));
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
      this.loadItems();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * ✅ الصفحة السابقة
   */
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadItems();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * ✅ الذهاب لصفحة محددة
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadItems();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}