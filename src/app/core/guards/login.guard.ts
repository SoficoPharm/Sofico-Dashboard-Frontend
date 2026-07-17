// import { inject } from '@angular/core';
// import { Router } from '@angular/router';
// import { CanActivateFn } from '@angular/router';

// export const loginGuard: CanActivateFn = (route, state) => {
//   const router = inject(Router);
  
//   // ✅ تحقق من sessionStorage بدل localStorage
//   const currentUser = sessionStorage.getItem('currentUser');

//   if (currentUser) {
//     router.navigate(['/dashboard']);
//     return false;
//   }

//   return true;
// };

// import { inject } from '@angular/core';
// import { Router, CanActivateFn } from '@angular/router';

// export const loginGuard: CanActivateFn = (route, state) => {
//   const router = inject(Router);

//   const currentUser = sessionStorage.getItem('currentUser');

//   if (currentUser) {
//     const returnUrl =
//       route.queryParamMap.get('returnUrl') || '/dashboard';

//     router.navigateByUrl(returnUrl);
//     return false;
//   }

//   return true;
// };

import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const loginGuard: CanActivateFn = (route) => {
  const router = inject(Router);

  const currentUser = sessionStorage.getItem('currentUser');

  if (currentUser) {
    const returnUrl =
      route.queryParamMap.get('returnUrl') || '/dashboard';

    router.navigateByUrl(returnUrl);
    return false;
  }

  return true;
};