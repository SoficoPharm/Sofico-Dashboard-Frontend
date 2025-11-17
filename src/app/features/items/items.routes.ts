import { Routes } from '@angular/router';

export const ITEMS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/items-list/items-list.component')
        .then(m => m.ItemsListComponent)
  },
//   {
//     path: 'details/:id',
//     loadComponent: () =>
//       import('./pages/item-details/item-details.component')
//         .then(m => m.ItemDetailsComponent)
//   },
//   {
//     path: 'performance',
//     loadComponent: () =>
//       import('./pages/item-performance/item-performance.component')
//         .then(m => m.ItemPerformanceComponent)
//   }
];