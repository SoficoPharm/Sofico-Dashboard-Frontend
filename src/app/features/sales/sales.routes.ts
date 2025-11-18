import { Routes } from '@angular/router';

export const SALES_ROUTES: Routes = [
  {
    path: 'overview',
    loadComponent: () =>
      import('./pages/sales-overview/sales-overview.component')
        .then(m => m.SalesOverviewComponent)
  },
  {
    path: 'details',
    loadComponent: () =>
      import('./pages/sales-details/sales-details.component')
        .then(m => m.SalesDetailsComponent)
  },
  {
    path: 'reports',
    loadComponent: () =>
      import('./pages/sales-reports/sales-reports.component')
        .then(m => m.SalesReportsComponent)
  }
];