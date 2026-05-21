import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthBackendService {
  constructor(private http: HttpClient) {}

  async invitePatient(email: string): Promise<void> {
    await firstValueFrom(
      this.http.post(`${environment.apiUrl}/api/auth/invite`, { email })
    );
  }
}
