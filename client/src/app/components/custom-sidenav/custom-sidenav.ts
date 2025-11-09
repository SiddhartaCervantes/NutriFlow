import { Component, signal, input} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

interface MenuItem {
  path: string;
  icon: string;
  label: string;
}

@Component({
  selector: 'app-custom-sidenav',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <nav class="sidenav">
      <h2 class="text-xl font-semibold px-4 py-2 mb-1">
          {{ collapsed() ? 'M' : 'MENU' }}
      </h2>
      <ul>
        @for (item of items(); track item.label) {
          <li>
            <a class="sidenav-item" [class.justify-center]="collapsed()">
              <mat-icon class="sidenav-icon">{{ item.icon }}</mat-icon>
              @if(!collapsed()){
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
    { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/videos', icon: 'video_library', label: 'Videos' },
    { path: '/analytics', icon: 'bar_chart', label: 'Analytics' },
    { path: '/settings', icon: 'settings', label: 'Settings' },
  ]);

  collapsed = input.required<boolean>()
}
