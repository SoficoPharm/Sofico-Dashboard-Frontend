// import { DashboardShell } from './features/dashboard/pages/dashboard-shell/dashboard-shell';
// import { Routes } from '@angular/router';
// import { authGuard } from './core/guards/auth.guard';
// import { loginGuard } from './core/guards/login.guard';

// export const routes: Routes = [
//   {
//     path: 'login',
//     loadComponent: () =>
//       import('./features/auth/pages/login/login.component')
//         .then(m => m.LoginComponent),
//     canActivate: [loginGuard] // ✅ منع الوصول للـ Login لو مسجل دخول
//   },
//   {
//     path: '',
//     redirectTo: 'dashboard', // ✅ توجيه للـ Dashboard بدلاً من Login
//     pathMatch: 'full'
//   },
//   {
//     path: '',
//     loadComponent: () =>
//       import('./layout/layout.component').then(m => m.LayoutComponent),
//     canActivate: [authGuard], // ✅ حماية كل الصفحات الداخلية
//     children: [
//       {
//         path: 'dashboard',
//         loadComponent: () =>
//           import('./features/dashboard/pages/dashboard-shell/dashboard-shell')
//             .then(m => m.DashboardShell)
//       },
//       {
//         path: 'vendors',
//         loadChildren: () =>
//           import('./features/vendors/vendors.routes')
//             .then(m => m.VENDORS_ROUTES)
//       },
//       {
//         path: 'items',
//         loadChildren: () =>
//           import('./features/items/items.routes')
//             .then(m => m.ITEMS_ROUTES)
//       },
//     ]
//   },
//   {
//     path: '**',
//     redirectTo: 'dashboard' // ✅ أي رابط غير موجود يروح للـ Dashboard
//   }
// ];import { Routes } from '@angular/router';

//--------------------------------------this last routes i added to test sentficoffice --------------------------------
import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { loginGuard } from './core/guards/login.guard';
import { dashboardGuard } from './core/guards/dashboard.guard';
import { scientificOfficeGuard } from './core/guards/scientificOffice.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login/login.component')
        .then(m => m.LoginComponent),
    canActivate: [loginGuard]
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/layout.component')
        .then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        canActivate: [dashboardGuard], // 👈 هنا
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard-shell/dashboard-shell')
            .then(m => m.DashboardShell)
      },
      {
        path: 'scientific-office',
        canActivate: [scientificOfficeGuard], // 👈 وهنا
        loadComponent: () =>
          import('./features/dashboard/pages/scientific-office/scientific-office')
            .then(m => m.ScientificOfficeComponent)
      },
      {
        path: 'vendors',
        loadChildren: () =>
          import('./features/vendors/vendors.routes')
            .then(m => m.VENDORS_ROUTES)
      },
      {
        path: 'items',
        loadChildren: () =>
          import('./features/items/items.routes')
            .then(m => m.ITEMS_ROUTES)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];