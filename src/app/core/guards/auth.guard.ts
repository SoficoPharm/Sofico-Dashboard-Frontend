// import { inject } from '@angular/core';
// import { Router } from '@angular/router';
// import { CanActivateFn } from '@angular/router';

// export const authGuard: CanActivateFn = (route, state) => {
//   const router = inject(Router);
  
//   // ✅ تحقق من sessionStorage بدل localStorage
//   const currentUser = sessionStorage.getItem('currentUser');

//   if (currentUser) {
//     return true;
//   }

//   router.navigate(['/login']);
//   return false;
// };

// import { inject } from '@angular/core';
// import { Router, CanActivateFn } from '@angular/router';

// export const authGuard: CanActivateFn = (route, state) => {
//   const router = inject(Router);

//   // تحقق من وجود المستخدم
//   const currentUser = sessionStorage.getItem('currentUser');

//   if (currentUser) {
//     return true;
//   }

//   // احفظ الصفحة المطلوبة وروح للـ Login
//   router.navigate(['/login'], {
//     queryParams: {
//       returnUrl: state.url
//     }
//   });

//   return false;
// };

import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const currentUser = sessionStorage.getItem('currentUser');

  if (!currentUser) {
    router.navigate(['/login'], {
      queryParams: {
        returnUrl: state.url
      }
    });

    return false;
  }

  // الصفحة اللي المستخدم دخل منها أول مرة بعد اللوجين
  const startPage = sessionStorage.getItem('startPage');

  // لو بدأ من Scientific Office امنعه يروح Dashboard
  if (
    startPage === '/scientific-office' &&
    state.url.startsWith('/dashboard')
  ) {
    router.navigateByUrl('/scientific-office');
    return false;
  }

  // لو بدأ من Dashboard امنعه يروح Scientific Office
  if (
    startPage === '/dashboard' &&
    state.url.startsWith('/scientific-office')
  ) {
    router.navigateByUrl('/dashboard');
    return false;
  }

  return true;
};