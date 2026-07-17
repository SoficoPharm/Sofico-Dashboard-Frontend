import { environment } from './../../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VendorAnalysisQueryParams } from '../models/vendor-analysis.model';

@Injectable({
  providedIn: 'root'
})
export class VendorAnalysisExportService {
  private apiRoot = environment.apiBaseUrl.replace(/\/DataSync$/i, '');
  private apiUrl = `${this.apiRoot}/scientific-office`;

  constructor(private http: HttpClient) {}

  export(query: VendorAnalysisQueryParams): Observable<Blob> {
    let params = new HttpParams();

    Object.entries(query).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        return;
      }
      params = params.set(key, String(value));
    });

    return this.http.get(`${this.apiUrl}/vendor-analysis/export`, {
      params,
      responseType: 'blob'
    });
  }
}