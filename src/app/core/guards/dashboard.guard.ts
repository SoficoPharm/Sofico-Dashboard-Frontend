import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const dashboardGuard: CanActivateFn = () => {

  const router = inject(Router);

  const currentUser = sessionStorage.getItem('currentUser');

  if (!currentUser) {
    router.navigate(['/login']);
    return false;
  }

  const mode = sessionStorage.getItem('startPage');

  if (mode === '/scientific-office') {
    router.navigateByUrl('/scientific-office');
    return false;
  }

  return true;
};