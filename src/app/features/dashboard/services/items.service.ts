import { environment } from './../../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';

export interface Item {
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
export class ItemsService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getTopItems(timeframe: TimeframeType = 'Today', branchCode?: string, top: number = 10): Observable<Item[]> {
    const params: any = {
      timeframe,
      top
    };

    if (branchCode) {
      params.branchCode = branchCode;
    }

    const url = `${this.apiUrl}/sales/top-items`;

    return this.http.get<any>(url, { params }).pipe(
      tap(response => {
        console.log('📌 Raw API Response (Top Items):', response);
      }),
      map(response => {
        if (!response.success || !response.data) {
          throw new Error('Invalid API response');
        }

        return response.data.map((item: any, index: number) => ({
          id: item.itemCode || (index + 1).toString(),
          name: item.itemName || 'Unknown',
          logo: '📦',
          sales: item.totalSales || 0,
          target: 0
        }));
      }),
      catchError(error => {
        console.error('❌ Error fetching items:', error);
        return of([]);
      })
    );
  }

  getTopItemsAdvanced(
    filter: {
      mode: 'month' | 'range';
      month?: number | null;
      year?: number | null;
      fromDate?: string | null;
      toDate?: string | null;
    },
    branchCode?: string,
    top: number = 10
  ): Observable<Item[]> {
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

    const url = `${this.apiUrl}/sales/top-items`;
    console.log('🌐 Advanced Items API Call:', url, params);

    return this.http.get<any>(url, { params }).pipe(
      tap(response => {
        console.log('📌 Raw API Response (Advanced Top Items):', response);
      }),
      map(response => {
        if (!response.success || !response.data) {
          throw new Error('Invalid API response');
        }

        return response.data.map((item: any, index: number) => ({
          id: item.itemCode || (index + 1).toString(),
          name: item.itemName || 'Unknown',
          logo: '📦',
          sales: item.totalSales || 0,
          target: 0
        }));
      }),
      catchError(error => {
        console.error('❌ Error fetching advanced items:', error);
        return of([]);
      })
    );
  }
}