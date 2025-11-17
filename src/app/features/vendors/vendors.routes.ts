import { Routes } from '@angular/router';

export const VENDORS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/vendors-list/vendors-list.component')
        .then(m => m.VendorsListComponent)
  },
//   {
//     path: 'details/:id',
//     loadComponent: () =>
//       import('./pages/vendor-details/vendor-details.component')
//         .then(m => m.VendorDetailsComponent)
//   },
//   {
//     path: 'performance',
//     loadComponent: () =>
//       import('./pages/vendor-performance/vendor-performance.component')
//         .then(m => m.VendorPerformanceComponent)
//   }
];