  import { Injectable } from '@angular/core';
  import { HttpClient } from '@angular/common/http';
  import { Observable, BehaviorSubject, of } from 'rxjs';
  import { map, tap, catchError } from 'rxjs/operators';
  import { environment } from '../../../../environments/environment';

  export interface Branch {
    branchCode: string;
    branchName: string;
    totalSales?: number;
    totalRecords?: number;
  }

  @Injectable({
    providedIn: 'root'
  })
  export class BranchMappingService {
    
    private apiUrl = environment.apiBaseUrl;
    
    // ✅ Cache للفروع في الذاكرة
    private branchesCache$ = new BehaviorSubject<Branch[]>([]);
    private branchMapCache = new Map<string, string>();
    private isLoaded = false;

    constructor(private http: HttpClient) {
      console.log('🏢 BranchMappingService Initialized');
      console.log('📡 API URL:', this.apiUrl);
    }

    /**
     * ✅ جلب جميع الفروع من API (مع Cache)
     * Uses /sales/by-branch endpoint to get list of branches
     */
    loadBranches(): Observable<Branch[]> {
      if (this.isLoaded && this.branchesCache$.value.length > 0) {
        console.log('✅ Using cached branches:', this.branchesCache$.value.length);
        return this.branchesCache$.asObservable();
      }

      console.log('🔄 Loading branches from /sales/by-branch...');
      
      // ✅ Use /sales/by-branch to get all branches
      return this.http.get<any>(`${this.apiUrl}/sales/by-branch`).pipe(
        map(response => {
          console.log('========================================');
          console.log('📊 API Response - Branches');
          console.log('========================================');
          console.log('Response:', response);
          console.log('========================================');

          if (response.success && response.data && Array.isArray(response.data)) {
            // Transform the data to our Branch interface
            const branches: Branch[] = response.data.map((item: any) => ({
              branchCode: item.branchCode || '',
              branchName: item.branchName || item.branchCode || 'Unknown',
              totalSales: item.totalSales || 0,
              totalRecords: item.orderCount || 0
            }));
            
            console.log('✅ Transformed branches:', branches);
            return branches;
          }
          
          console.warn('⚠️ Invalid response format, returning empty array');
          return [];
        }),
        tap(branches => {
          // ✅ حفظ البيانات في الـ Cache
          this.branchesCache$.next(branches);
          this.isLoaded = true;

          // ✅ بناء الـ Map للبحث السريع
          this.branchMapCache.clear();
          branches.forEach(branch => {
            if (branch.branchCode && branch.branchName) {
              this.branchMapCache.set(branch.branchCode, branch.branchName);
            }
          });

          console.log('✅ Branches cached:', branches.length);
          console.log('✅ Branch Map:', Array.from(this.branchMapCache.entries()));
        }),
        catchError(error => {
          console.error('❌ Error loading branches:', error);
          console.error('Error details:', error.message);
          
          // ✅ Return empty array on error instead of throwing
          return of([]);
        })
      );
    }

    /**
     * ✅ الحصول على اسم الفرع من الكود (من Cache)
     */
    getBranchName(code: string): string {
      if (!code) return '';
      
      const cleanCode = code.trim();
      const name = this.branchMapCache.get(cleanCode);
      
      if (!name) {
        console.warn(`⚠️ Branch name not found for code: ${cleanCode}`);
        return cleanCode; // نرجع الكود نفسه لو مش موجود
      }
      
      return name;
    }

    /**
     * ✅ الحصول على كود الفرع من الاسم (من Cache)
     */
    getBranchCode(name: string): string | null {
      if (!name) return null;
      
      const cleanName = name.trim();
      
      for (const [code, branchName] of this.branchMapCache.entries()) {
        if (branchName === cleanName) {
          return code;
        }
      }
      
      console.warn(`⚠️ Branch code not found for name: ${cleanName}`);
      return null;
    }

    /**
     * ✅ الحصول على جميع الفروع من Cache
     */
    getAllBranches(): Observable<Branch[]> {
      return this.branchesCache$.asObservable();
    }

    /**
     * ✅ التحقق من وجود الفرع
     */
    branchExists(code: string): boolean {
      if (!code) return false;
      const cleanCode = code.trim();
      return this.branchMapCache.has(cleanCode);
    }

    /**
     * ✅ إعادة تحميل البيانات من API
     */
    refreshBranches(): Observable<Branch[]> {
      this.isLoaded = false;
      this.branchesCache$.next([]);
      this.branchMapCache.clear();
      return this.loadBranches();
    }

    /**
     * ✅ الحصول على عدد الفروع المحملة
     */
    getBranchCount(): number {
      return this.branchMapCache.size;
    }
  }