import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { supabase } from '../data/supabase.client'; // Reutilizamos tu cliente
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Aquí guardaremos la info del usuario para que TODA la app la vea
  private userData: any = null;

  constructor(private router: Router, private http: HttpClient) {}

  async login(email: string, pass: string) {
    // 1. Validar con Supabase
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) throw error;

    // 2. Consultar TU API de .NET para traer el perfil real
    try {
      const perfil = await firstValueFrom(
        this.http.get(`http://localhost:5105/api/perfiles/me/${data.user?.id}`)
      );
      
      this.userData = perfil;
      localStorage.setItem('user_profile', JSON.stringify(perfil)); // Para que no se borre al refrescar
      
      this.router.navigate(['/patients']);
    } catch (err) {
      throw new Error("Login OK, pero no tienes un perfil creado en la base de datos.");
    }
  }

  getUser() {
    return this.userData || JSON.parse(localStorage.getItem('user_profile') || '{}');
  }

  async logout() {
    await supabase.auth.signOut();
    localStorage.removeItem('user_profile');
    this.router.navigate(['/login']);
  }
}