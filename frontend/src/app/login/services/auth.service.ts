import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { supabase } from '../../data/supabase.client';

export type UserProfile = {
  user_auth_id: string;
  name: string | null;
  last_name: string | null;
  phone: string | null;
  photo_url: string | null;
  is_verified: boolean;
  is_active: boolean;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private profileSubject = new BehaviorSubject<UserProfile | null>(null);
  readonly profile$ = this.profileSubject.asObservable();

  constructor(private router: Router) {}

  async login(email: string, password: string): Promise<void> {
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({ email, password });
    if (authError) throw new Error(authError.message);

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_auth_id', authData.user.id)
      .single();

    if (profileError || !profile) {
      await this.router.navigate(['/setup-profile']);
      return;
    }

    this.profileSubject.next(profile);
    await this.router.navigate(['/patients']);
  }

  async signUp(email: string, password: string) {
    return supabase.auth.signUp({ email, password });
  }

  async logout(): Promise<void> {
    this.profileSubject.next(null);
    await supabase.auth.signOut();
    await this.router.navigate(['/login']);
  }

  async getProfile(): Promise<UserProfile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_auth_id', user.id)
      .single();

    const profile = data ?? null;
    this.profileSubject.next(profile);
    return profile;
  }

  pushProfile(profile: UserProfile): void {
    this.profileSubject.next(profile);
  }

  getUser() {
    return supabase.auth.getUser();
  }
}
