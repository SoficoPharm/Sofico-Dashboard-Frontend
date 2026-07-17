import { environment } from './../../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';

export interface Vendor {
  id: string;
  name: string;
  logo: string;
  sales: number;
  target: number;
}

export type TimeframeType = 'Today' | 'MTD' | 'QTD' | 'YTD';

@Injectable({
  providedIn: 'root'
})
export class VendorsService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getTopVendors(timeframe: TimeframeType = 'Today', branchCode?: string, top: number = 10): Observable<Vendor[]> {
    const params: any = {
      timeframe,
      top
    };

    if (branchCode) {
      params.branchCode = branchCode;
    }

    const url = `${this.apiUrl}/sales/top-vendors`;

    return this.http.get<any>(url, { params }).pipe(
      tap(response => {
        console.log('📌 Raw API Response (Top Vendors):', response);
      }),
      map(response => {
        if (!response.success || !response.data) {
          throw new Error('Invalid API response');
        }

        return response.data.map((vendor: any, index: number) => ({
          id: vendor.vendorCode || (index + 1).toString(),
          name: vendor.vendorName || 'Unknown',
          logo: '🏢',
          sales: vendor.totalSales || 0,
          target: 0
        }));
      }),
      catchError(error => {
        console.error('❌ Error fetching vendors:', error);
        return of([]);
      })
    );
  }

  getTopVendorsAdvanced(
    filter: {
      mode: 'month' | 'range';
      month?: number | null;
      year?: number | null;
      fromDate?: string | null;
      toDate?: string | null;
    },
    branchCode?: string,
    top: number = 10
  ): Observable<Vendor[]> {
    const params: any = { top };

    if (filter.mode === 'month') {
      params.timeframe = 'MTD';
      params.filterMode = 'monthly';
      params.month = Number(filter.month);
      params.year = Number(filter.year);
    } else {
      params.timeframe = 'Today';
      params.filterMode = 'range';
      params.fromDate = filter.fromDate;
      params.toDate = filter.toDate;
    }

    if (branchCode) {
      params.branchCode = branchCode;
    }

    const url = `${this.apiUrl}/sales/top-vendors`;
    console.log('🌐 Advanced Vendors API Call:', url, params);

    return this.http.get<any>(url, { params }).pipe(
      tap(response => {
        console.log('📌 Raw API Response (Advanced Top Vendors):', response);
      }),
      map(response => {
        if (!response.success || !response.data) {
          throw new Error('Invalid API response');
        }

        return response.data.map((vendor: any, index: number) => ({
          id: vendor.vendorCode || (index + 1).toString(),
          name: vendor.vendorName || 'Unknown',
          logo: '🏢',
          sales: vendor.totalSales || 0,
          target: 0
        }));
      }),
      catchError(error => {
        console.error('❌ Error fetching advanced vendors:', error);
        return of([]);
      })
    );
  }
}