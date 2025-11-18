import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login/login.component')
        .then(m => m.LoginComponent)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/layout.component').then(m => m.LayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard-page/dashboard-page.component')
            .then(m => m.DashboardPageComponent)
      },
      {
        path: 'sales',
        loadChildren: () =>
          import('./features/sales/sales.routes')
            .then(m => m.SALES_ROUTES)
      },

      // Vendors Module
      {
        path: 'vendors',
        loadChildren: () =>
          import('./features/vendors/vendors.routes')
            .then(m => m.VENDORS_ROUTES)
      },

      // Items Module
      {
        path: 'items',
        loadChildren: () =>
          import('./features/items/items.routes')
            .then(m => m.ITEMS_ROUTES)
      },
    ]
  }
];
