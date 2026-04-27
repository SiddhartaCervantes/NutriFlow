import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { supabase } from '../data/supabase.client';

export const authGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const { data: { user } } = await supabase.auth.getUser();

  if (user) return true;

  return router.createUrlTree(['/login']);
};
