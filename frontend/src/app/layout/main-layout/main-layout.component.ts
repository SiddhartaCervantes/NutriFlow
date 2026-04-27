import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { UserHeaderCardComponent } from '../../components/user-header-card/user-header-card.component';
import { AuthService } from '../../login/services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    UserHeaderCardComponent,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  isSideNavExpanded = false;

  userName  = 'Cargando...';
  avatarUrl = 'assets/privado.png';
  phrase    = 'Tu día en equilibrio';

  private sub = new Subscription();

  constructor(private authService: AuthService) {}

  async ngOnInit(): Promise<void> {
    this.sub.add(
      this.authService.profile$.subscribe(profile => {
        if (profile) {
          const name = [profile.name, profile.last_name].filter(Boolean).join(' ');
          this.userName  = name || 'Nutriólogo';
          this.avatarUrl = profile.photo_url ?? 'assets/privado.png';
        }
      })
    );
    // Trigger initial load if subject is still null
    await this.authService.getProfile();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  toggleSideNav() {
    this.isSideNavExpanded = !this.isSideNavExpanded;
  }

  async logout() {
    await this.authService.logout();
  }
}
