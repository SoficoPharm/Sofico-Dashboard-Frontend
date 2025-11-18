import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DashboardData, DashboardFilters, SalesDataPoint } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  
  getSalesData(filters: DashboardFilters): Observable<SalesDataPoint[]> {
    // Mock data - replace with real API call
    const mockData: SalesDataPoint[] = this.generateMockData(filters);
    return of(mockData);
  }

  getBranches(): Observable<any[]> {
    // Mock branches
    return of([
      { id: '1', name: 'All' },
      { id: '2', name: 'Alexandria' },
      { id: '3', name: 'Asyut' },
      { id: '4', name: 'Bani Swief' },
      { id: '5', name: 'Cairo' },
      { id: '6', name: 'Damanhour' },
      { id: '7', name: 'Faqus' },
      { id: '8', name: 'Fysal' },
      { id: '9', name: 'Giza' },
      { id: '10', name: 'hawamidih' },
      { id: '11', name: 'Kabary' },
      { id: '12', name: 'Khorshid' },
      { id: '13', name: 'Mansoura' },
      { id: '14', name: 'Menia' },
      { id: '15', name: 'Monofeya' },
      { id: '16', name: 'Mostord' },
      { id: '17', name: 'Nagaa Hammadi' },
      { id: '18', name: 'Port Said' },
      { id: '19', name: 'Qena' },
      { id: '20', name: 'SAFT' },
      { id: '21', name: 'Sawah' },
      { id: '22', name: 'Sohag' },
      { id: '23', name: 'Tanta' },
      { id: '24', name: 'Zagazig' }
    ]);
  }

  getLastSyncTime(): Observable<Date> {
    return of(new Date());
  }

  private generateMockData(filters: DashboardFilters): SalesDataPoint[] {
    const data: SalesDataPoint[] = [];
    const daysInMonth = filters.period === 'daily' ? 31 : 12;

    for (let i = 1; i <= daysInMonth; i++) {
      data.push({
        date: i.toString(),
        sales: Math.random() * 40000000,
        target: Math.random() * 35000000,
      });
    }

    return data;
  }
}