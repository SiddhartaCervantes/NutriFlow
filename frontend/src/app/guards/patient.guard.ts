import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { supabase } from '../data/supabase.client';

export const patientGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return router.createUrlTree(['/patient-portal']);

  const { data } = await supabase
    .from('patients')
    .select('id')
    .eq('email', user.email)
    .single();

  if (data) return true;
  return router.createUrlTree(['/patient-portal']);
};
