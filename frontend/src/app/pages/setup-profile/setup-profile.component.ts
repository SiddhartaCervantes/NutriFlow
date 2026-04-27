import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { supabase } from '../../data/supabase.client';

@Component({
  selector: 'app-setup-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './setup-profile.component.html',
  styleUrl: './setup-profile.component.css',
})
export class SetupProfileComponent {
  name = '';
  lastName = '';
  phone = '';
  loading = false;
  errorMsg = '';

  constructor(private router: Router) {}

  async submit(): Promise<void> {
    if (!this.name.trim() || !this.lastName.trim()) {
      this.errorMsg = 'Nombre y apellido son requeridos.';
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Sesión no encontrada. Inicia sesión de nuevo.');

      const { error } = await supabase.from('user_profiles').insert({
        user_auth_id: user.id,
        name:         this.name.trim(),
        last_name:    this.lastName.trim(),
        phone:        this.phone.trim() || null,
        is_active:    true,
        is_verified:  true,
      });

      if (error) throw new Error(error.message);

      await this.router.navigate(['/patients']);
    } catch (e: any) {
      this.errorMsg = e?.message ?? 'Error al guardar el perfil.';
    } finally {
      this.loading = false;
    }
  }
}
