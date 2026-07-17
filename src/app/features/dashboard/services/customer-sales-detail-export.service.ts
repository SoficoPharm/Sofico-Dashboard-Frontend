import { environment } from './../../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CustomerSalesDetailQueryParams } from '../models/customer-sales-detail.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerSalesDetailExportService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  // بياخد نفس الـ query params (فلاتر + بحث) بالظبط، من غير page/pageSize
  // عشان الـ backend يرجّع كل الصفوف المطابقة، مش صفحة واحدة بس
  export(query: CustomerSalesDetailQueryParams): Observable<Blob> {
    const { page, pageSize, ...exportQuery } = query;

    let params = new HttpParams();
    Object.entries(exportQuery).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        return;
      }
      params = params.set(key, String(value));
    });

    return this.http.get(`${this.apiUrl}/sales/scientific-office/customer-sales-detail/export`, {
      params,
      responseType: 'blob'
    });
  }
}