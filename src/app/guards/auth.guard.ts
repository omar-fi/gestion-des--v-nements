import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { UserService } from '../services/user.service';

export const authGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const userService = inject(UserService);
  
  const currentUser = userService.getCurrentUser();
  
  if (!currentUser) {
    router.navigate(['/login']);
    return false;
  }

  const requiredRoles = route.data['roles'] as string[];
  if (requiredRoles && !requiredRoles.includes(currentUser.type)) {
    userService.logout();
    router.navigate(['/login']);
    return false;
  }

  return true;
}; 