import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { supabase } from '../../data/supabase.client';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="rp-wrap">
      <div class="rp-card">
        <h1 class="rp-title">Nueva contraseña</h1>
        <p class="rp-sub">Escribe tu nueva contraseña para continuar.</p>

        @if (!tokenReady) {
          <p class="msg msg--error">El enlace no es válido o ya expiró. Solicita uno nuevo desde el login.</p>
        }

        @if (tokenReady && !done) {
          <div class="rp-form">
            <label>Nueva contraseña</label>
            <input type="password" [(ngModel)]="password"
                   placeholder="Mínimo 6 caracteres" />

            <label>Confirmar contraseña</label>
            <input type="password" [(ngModel)]="confirm"
                   placeholder="Repite la contraseña" />

            @if (errorMsg)   { <p class="msg msg--error">{{ errorMsg }}</p> }

            <button [disabled]="saving" (click)="save()">
              {{ saving ? 'Guardando...' : 'Guardar contraseña' }}
            </button>
          </div>
        }

        @if (done) {
          <p class="msg msg--success">Contraseña actualizada. Redirigiendo al login...</p>
        }
      </div>
    </div>
  `,
  styles: [`
    .rp-wrap {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f5f5f5;
    }
    .rp-card {
      background: #fff;
      border-radius: 16px;
      padding: 36px;
      width: 100%;
      max-width: 400px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    }
    .rp-title { margin: 0 0 4px; font-size: 22px; font-weight: 800; }
    .rp-sub   { margin: 0 0 20px; font-size: 13px; opacity: .6; }
    .rp-form  { display: flex; flex-direction: column; gap: 8px; }
    label     { font-size: 13px; font-weight: 600; }
    input {
      padding: 10px 14px;
      border: 1.5px solid #ddd;
      border-radius: 10px;
      font-size: 14px;
      outline: none;
    }
    input:focus { border-color: #4827AF; }
    button {
      margin-top: 8px;
      padding: 12px;
      background: linear-gradient(135deg, #FF4208, #4827AF);
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
    }
    button:disabled { opacity: .6; cursor: not-allowed; }
    .msg { font-size: 13px; font-weight: 600; margin: 8px 0 0; }
    .msg--error   { color: #b42318; }
    .msg--success { color: #2e7d32; }
  `],
})
export class ResetPasswordComponent implements OnInit {
  tokenReady = false;
  saving     = false;
  done       = false;
  errorMsg   = '';
  password   = '';
  confirm    = '';

  constructor(private router: Router) {}

  async ngOnInit(): Promise<void> {
    // Supabase incluye el token en el hash: #access_token=...&type=recovery
    const hash   = window.location.hash;
    const params = new URLSearchParams(hash.replace('#', ''));
    const type   = params.get('type');

    if (type === 'recovery') {
      // La sesión ya queda establecida automáticamente por el SDK al detectar el hash
      const { data: { session } } = await supabase.auth.getSession();
      this.tokenReady = !!session;
    }
  }

  async save(): Promise<void> {
    this.errorMsg = '';

    if (this.password.length < 6) {
      this.errorMsg = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }
    if (this.password !== this.confirm) {
      this.errorMsg = 'Las contraseñas no coinciden.';
      return;
    }

    this.saving = true;
    try {
      const { error } = await supabase.auth.updateUser({ password: this.password });
      if (error) throw error;
      this.done = true;
      setTimeout(() => this.router.navigate(['/login']), 2500);
    } catch (e: any) {
      this.errorMsg = e?.message ?? 'Error al actualizar la contraseña.';
    } finally {
      this.saving = false;
    }
  }
}
