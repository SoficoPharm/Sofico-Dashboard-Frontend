import { environment } from './../../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { VendorAnalysisQueryParams, VendorAnalysisResponse } from '../models/vendor-analysis.model';

@Injectable({
  providedIn: 'root'
})
export class VendorAnalysisService {
  // environment.apiBaseUrl already points at ".../api/DataSync" (used by every other
  // DataSyncController-based service). The new Vendor Analysis backend lives under a
  // different controller route: "api/scientific-office". Rather than touching
  // environment.ts (shared by the whole app), we derive the correct root here by
  // stripping the trailing "/DataSync" segment, so nothing else is affected.
  private apiRoot = environment.apiBaseUrl.replace(/\/DataSync$/i, '');
  private apiUrl = `${this.apiRoot}/scientific-office`;

  constructor(private http: HttpClient) {}

  getVendorAnalysis(query: VendorAnalysisQueryParams): Observable<VendorAnalysisResponse> {
    const url = `${this.apiUrl}/vendor-analysis`;
    const params = this.buildParams(query);

    console.log('🌐 Vendor Analysis API Call:', url, query);

    return this.http.get<VendorAnalysisResponse>(url, { params }).pipe(
      tap(response => {
        console.log('📌 Raw API Response (Vendor Analysis):', response);
      }),
      catchError(error => {
        console.error('❌ Error fetching vendor analysis:', error);
        return of({
          success: false,
          error: 'Failed to load vendor analysis',
          totalVendors: 0,
          data: []
        } as VendorAnalysisResponse);
      })
    );
  }

  private buildParams(query: VendorAnalysisQueryParams): HttpParams {
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