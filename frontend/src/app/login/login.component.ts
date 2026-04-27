import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from './services/auth.service';
import { supabase } from '../data/supabase.client';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loading    = false;
  errorMsg   = '';
  successMsg = '';

  email    = '';
  password = '';

  constructor(private authService: AuthService) {}

  async submit() {
    await this.onLogin();
  }

  async onLogin() {
    this.errorMsg   = '';
    this.successMsg = '';
    this.loading    = true;
    try {
      await this.authService.login(this.email, this.password);
    } catch (e: any) {
      this.errorMsg = e?.message ?? 'Error al iniciar sesión';
    } finally {
      this.loading = false;
    }
  }

  async onSignUp() {
    this.errorMsg   = '';
    this.successMsg = '';
    this.loading    = true;
    try {
      const { error } = await this.authService.signUp(this.email, this.password);
      if (error) throw error;
      this.successMsg = 'Cuenta creada. Revisa tu correo para confirmar.';
    } catch (e: any) {
      this.errorMsg = e?.message ?? 'Error al crear cuenta';
    } finally {
      this.loading = false;
    }
  }

  async onForgotPassword() {
    this.errorMsg   = '';
    this.successMsg = '';

    if (!this.email.trim()) {
      this.errorMsg = 'Escribe tu correo antes de continuar.';
      return;
    }

    this.loading = true;
    try {
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(this.email.trim(), { redirectTo });
      if (error) throw error;
      this.successMsg = 'Te enviamos un correo para restablecer tu contraseña.';
    } catch (e: any) {
      this.errorMsg = e?.message ?? 'Error al enviar el correo.';
    } finally {
      this.loading = false;
    }
  }
}