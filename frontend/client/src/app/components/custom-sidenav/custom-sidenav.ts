import { Component, signal, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface MenuItem {
  path: string;
  icon: string;
  label: string;
}

@Component({
  selector: 'app-custom-sidenav',
  standalone: true,
  imports: [MatIconModule, RouterLink, RouterLinkActive], // 👈 importa router
  template: `
    <nav class="sidenav">
      <h2 class="text-xl font-semibold px-4 py-2 mb-1">
        {{ collapsed() ? 'M' : 'MENU' }}
      </h2>
      <ul>
        @for (item of items(); track item.label) {
          <li>
            <a
              [routerLink]="item.path"               
              routerLinkActive="sidenav-item--active" 
              class="sidenav-item"
              [class.justify-center]="collapsed()"
            >
              <mat-icon class="sidenav-icon">{{ item.icon }}</mat-icon>
              @if (!collapsed()) {
                <span class="sidenav-label">{{ item.label }}</span>
              }
            </a>
          </li>
        }
      </ul>
    </nav>
  `,
  styleUrls: ['./custom-sidenav.scss'],
})
export class CustomSidenav {
  items = signal<MenuItem[]>([
    { path: '/', icon: 'dashboard', label: 'Dashboard' },
    { path: '/recetas', icon: 'restaurant_menu', label: 'Recetas' },
    { path: '/analytics', icon: 'bar_chart', label: 'Analytics' },
    { path: '/settings', icon: 'settings', label: 'Settings' },
  ]);

  collapsed = input.required<boolean>();
}
