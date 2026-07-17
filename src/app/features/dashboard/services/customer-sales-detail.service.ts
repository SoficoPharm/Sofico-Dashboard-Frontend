import { environment } from './../../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import {
  CustomerSalesDetailPagedResponse,
  CustomerSalesDetailQueryParams
} from '../models/customer-sales-detail.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerSalesDetailService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getPaged(query: CustomerSalesDetailQueryParams): Observable<CustomerSalesDetailPagedResponse> {
    const url = `${this.apiUrl}/sales/scientific-office/customer-sales-detail`;
    const params = this.buildParams(query);

    console.log('🌐 Customer Sales Detail API Call:', url, query);

    return this.http.get<CustomerSalesDetailPagedResponse>(url, { params }).pipe(
      tap(response => {
        console.log('📌 Raw API Response (Customer Sales Detail):', response);
      }),
      catchError(error => {
        console.error('❌ Error fetching customer sales detail:', error);
        return of({
          success: false,
          error: 'Failed to load report',
          totalRecords: 0,
          totalPages: 0,
          currentPage: 1,
          pageSize: query.pageSize || 20,
          data: []
        } as CustomerSalesDetailPagedResponse);
      })
    );
  }

  private buildParams(query: CustomerSalesDetailQueryParams): HttpParams {
    let params = new HttpParams();

    Object.entries(query).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        return;
      }
      params = params.set(key, String(value));
    });

    return params;
  }
}