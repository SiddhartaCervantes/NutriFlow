import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

interface PexelsResponse {
  photos: { src: { medium: string; large: string } }[];
}

@Injectable({ providedIn: 'root' })
export class PexelsService {
  private readonly apiUrl = 'https://api.pexels.com/v1/search';
  private readonly cache = new Map<string, string>();

  constructor(private http: HttpClient) {}

  async getPhoto(query: string): Promise<string> {
    const key = query.toLowerCase().trim();

    if (this.cache.has(key)) return this.cache.get(key)!;

    try {
      const res = await firstValueFrom(
        this.http.get<PexelsResponse>(this.apiUrl, {
          params: { query, per_page: '1', orientation: 'landscape' },
          headers: { Authorization: environment.pexelsApiKey },
        })
      );

      const url = res.photos[0]?.src.large ?? '';
      this.cache.set(key, url);
      return url;
    } catch {
      return '';
    }
  }
}
