import { environment } from './../../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ExportFilterPayload {
  mode: 'month' | 'range';
  month?: number | null;
  year?: number | null;
  fromDate?: string | null;
  toDate?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class ScientificOfficeExportService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  export(filter: ExportFilterPayload): Observable<Blob> {
    const params: any = {};

    if (filter.mode === 'month') {
      params.filterMode = 'monthly';
      params.month = Number(filter.month);
      params.year = Number(filter.year);
    } else {
      params.filterMode = 'range';
      params.fromDate = filter.fromDate;
      params.toDate = filter.toDate;
    }

    return this.http.get(`${this.apiUrl}/sales/scientific-office/export`, {
      params,
      responseType: 'blob'
    });
  }
}