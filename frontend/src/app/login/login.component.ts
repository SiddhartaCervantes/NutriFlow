import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { supabase } from '../data/supabase.client';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule], // ✅ AQUÍ
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'], // ✅ plural
})
export class LoginComponent {
  loading = false;
  errorMsg = '';

  email = '';
  password = '';

  constructor(private router: Router) {}

  async submit() {
    await this.onLogin(this.email, this.password);
  }

  async onLogin(email: string, password: string) {
    this.errorMsg = '';
    try {
      this.loading = true;

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      console.log('LOGIN OK:', data.user?.id);
      this.router.navigateByUrl('/patients');
    } catch (e: any) {
      this.errorMsg = e?.message ?? 'Error al iniciar sesión';
      console.error(e);
    } finally {
      this.loading = false;
    }
  }

  async onSignUp() {
    this.errorMsg = '';
    try {
      this.loading = true;

      const { data, error } = await supabase.auth.signUp({
        email: this.email,
        password: this.password,
      });

      if (error) throw error;

      console.log('SIGNUP OK:', data.user?.id);
      this.errorMsg = 'Cuenta creada. Si te pide confirmación, revisa tu correo.';
    } catch (e: any) {
      this.errorMsg = e?.message ?? 'Error al crear cuenta';
      console.error(e);
    } finally {
      this.loading = false;
    }
  }
}