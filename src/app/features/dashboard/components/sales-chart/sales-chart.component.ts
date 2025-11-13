import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LineChartComponent } from '../../../../shared/components/chart/line-chart/line-chart.component';
import { DEFAULT_CHART_OPTIONS, CHART_COLORS } from '../../../../shared/components/chart/chart.config';
import { PeriodFilterComponent } from '../filters/period-filter/period-filter.component';
import { YearFilterComponent } from '../filters/year-filter/year-filter.component';
import { DateFilterComponent } from '../filters/date-filter/date-filter.component';
import { BranchFilterComponent } from '../filters/branch-filter/branch-filter.component';
import { SearchFilterComponent } from '../filters/search-filter/search-filter.component';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardFilters, PeriodType, YearType } from '../../models/dashboard.model';

@Component({
  selector: 'app-sales-chart',
  standalone: true,
  imports: [
    CommonModule,
    LineChartComponent,
    PeriodFilterComponent,
    YearFilterComponent,
    DateFilterComponent,
    BranchFilterComponent,
    SearchFilterComponent
  ],
  templateUrl: './sales-chart.component.html',
  styleUrls: ['./sales-chart.component.scss']
})
export class SalesChartComponent implements OnInit {
  chartData: any;
  chartOptions: any = DEFAULT_CHART_OPTIONS;
  lastSync: Date = new Date();

  filters: DashboardFilters = {
    period: 'daily',
    year: 2025,
    selectedDate: new Date(),
    branchId: null,
    searchQuery: ''
  };

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    console.log('Loading data with filters:', this.filters);
    
    this.dashboardService.getSalesData(this.filters).subscribe(data => {
      this.chartData = {
        labels: data.map(d => d.date),
        datasets: [
          {
            label: `Sales ${this.filters.year}`,
            data: data.map(d => d.sales),
            borderColor: CHART_COLORS.sales,
            backgroundColor: 'transparent',
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 5,
          },
          {
            label: `Target ${this.filters.year}`,
            data: data.map(d => d.target),
            borderColor: CHART_COLORS.target,
            backgroundColor: 'transparent',
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 5,
          },
        ],
      };

      // Update last sync time
      this.lastSync = new Date();
    });
  }

  // ✅ Auto-reload: Period changed
  onPeriodChange(period: PeriodType): void {
    this.filters.period = period;
    this.loadData(); // ✅ Load immediately
  }

  // ✅ Auto-reload: Year changed
  onYearChange(year: YearType): void {
    this.filters.year = year;
    this.loadData(); // ✅ Load immediately
  }

  // ❌ Manual reload: Date changed (wait for Search)
  onDateChange(date: Date): void {
    this.filters.selectedDate = date;
    console.log('Date changed:', date, '→ Press Search to load data');
    // Don't auto-reload
  }

  // ❌ Manual reload: Branch changed (wait for Search)
  onBranchChange(branchId: string | null): void {
    this.filters.branchId = branchId;
    console.log('Branch changed:', branchId, '→ Press Search to load data');
    // Don't auto-reload
  }

  // ✅ Manual reload: Search button clicked
  onSearchClick(): void {
    console.log('Search clicked → Loading data with Branch + Date filters');
    this.loadData();
  }
}