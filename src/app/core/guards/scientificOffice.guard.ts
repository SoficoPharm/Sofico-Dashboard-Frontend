import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const scientificOfficeGuard: CanActivateFn = () => {

  const router = inject(Router);

  const currentUser = sessionStorage.getItem('currentUser');

  if (!currentUser) {
    router.navigate(['/login']);
    return false;
  }

  const mode = sessionStorage.getItem('startPage');

  if (mode === '/dashboard') {
    router.navigateByUrl('/dashboard');
    return false;
  }

  return true;
};