import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { supabase } from '../../data/supabase.client';

@Component({
  selector: 'app-patient-portal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-portal.component.html',
  styleUrl: './patient-portal.component.css',
})
export class PatientPortalComponent implements OnInit {
  email    = '';
  password = '';
  loading  = false;
  errorMsg = '';

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    const e = this.route.snapshot.queryParamMap.get('e');
    if (e) {
      try { this.email = atob(e); } catch { /* param inválido, ignorar */ }
    }
  }

  async onLogin(): Promise<void> {
    this.errorMsg = '';
    this.loading  = true;
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: this.email,
        password: this.password,
      });
      if (error) throw error;

      const { data: patient } = await supabase
        .from('patients')
        .select('id')
        .eq('email', this.email)
        .single();

      if (!patient) {
        await supabase.auth.signOut();
        this.errorMsg = 'Esta cuenta no corresponde a un paciente registrado.';
        return;
      }

      await this.router.navigate(['/mi-plan']);
    } catch (e: any) {
      this.errorMsg = e?.message ?? 'Error al iniciar sesión';
    } finally {
      this.loading = false;
    }
  }
}
