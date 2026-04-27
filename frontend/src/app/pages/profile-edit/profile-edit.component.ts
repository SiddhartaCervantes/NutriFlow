import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { supabase } from '../../data/supabase.client';
import { AuthService } from '../../login/services/auth.service';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatProgressBarModule],
  templateUrl: './profile-edit.component.html',
  styleUrl: './profile-edit.component.css',
})
export class ProfileEditComponent implements OnInit {
  name      = '';
  lastName  = '';
  phone     = '';
  photoUrl  = '';
  email     = '';

  loading   = true;
  saving    = false;
  uploading = false;
  success   = false;
  errorMsg  = '';

  constructor(private router: Router, private authService: AuthService) {}

  async ngOnInit(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { this.router.navigate(['/login']); return; }

      this.email = user.email ?? '';

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_auth_id', user.id)
        .single();

      if (profile) {
        this.name     = profile.name     ?? '';
        this.lastName = profile.last_name ?? '';
        this.phone    = profile.phone     ?? '';
        this.photoUrl = profile.photo_url ?? '';
      }
    } finally {
      this.loading = false;
    }
  }

  async save(): Promise<void> {
    this.saving  = true;
    this.success = false;
    this.errorMsg = '';

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Sin sesión activa.');

      const { error } = await supabase
        .from('user_profiles')
        .update({
          name:      this.name.trim(),
          last_name: this.lastName.trim(),
          phone:     this.phone.trim()    || null,
          photo_url: this.photoUrl.trim() || null,
        })
        .eq('user_auth_id', user.id);

      if (error) throw new Error(error.message);
      this.authService.pushProfile({
        user_auth_id: user.id,
        name:         this.name.trim(),
        last_name:    this.lastName.trim(),
        phone:        this.phone.trim() || null,
        photo_url:    this.photoUrl.trim() || null,
        is_verified:  true,
        is_active:    true,
      });
      this.success = true;
    } catch (e: any) {
      this.errorMsg = e?.message ?? 'Error al guardar.';
    } finally {
      this.saving = false;
    }
  }

  async onFileSelected(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.uploading = true;
    this.errorMsg  = '';

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Sin sesión activa.');

      const ext  = file.name.split('.').pop();
      const path = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true });

      if (uploadError) throw new Error(uploadError.message);

      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      this.photoUrl = `${data.publicUrl}?t=${Date.now()}`;
    } catch (e: any) {
      this.errorMsg = e?.message ?? 'Error al subir imagen.';
    } finally {
      this.uploading = false;
    }
  }

  goBack(): void {
    this.router.navigate(['/patients']);
  }
}
