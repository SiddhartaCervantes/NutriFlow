import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'], 
})
export class LoginComponent {
  loading = false;
  errorMsg = '';

  email = '';
  password = '';

  // Inyectamos el AuthService en lugar del Router (el servicio manejará la navegación)
  constructor(private authService: AuthService) {}

  async submit() {
    await this.onLogin();
  }

  async onLogin() {
    this.errorMsg = '';
    this.loading = true;

    try {
      // Llamamos al método login de nuestro servicio experto
      await this.authService.login(this.email, this.password);
      console.log('Login exitoso y perfil cargado desde .NET');
    } catch (e: any) {
      // Si el error viene de Supabase o de tu API, lo capturamos aquí
      this.errorMsg = e?.message ?? 'Error al iniciar sesión';
      console.error('Error en login:', e);
    } finally {
      this.loading = false;
    }
  }

  async onSignUp() {
    this.errorMsg = '';
    this.loading = true;

    try {
      // También delegamos el registro al servicio si decides implementarlo ahí
      const { data, error } = await this.authService.signUp(this.email, this.password);
      
      if (error) throw error;

      this.errorMsg = 'Cuenta creada. Revisa tu correo para confirmar.';
    } catch (e: any) {
      this.errorMsg = e?.message ?? 'Error al crear cuenta';
    } finally {
      this.loading = false;
    }
  }
}