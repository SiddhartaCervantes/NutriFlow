import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { UserHeaderCardComponent } from '../../components/user-header-card/user-header-card.component';
import { AuthService } from '../../login/services/auth.service';
import { AppointmentService } from '../../data/appointment.service';

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
    MatBadgeModule,
    UserHeaderCardComponent,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  isSideNavExpanded = false;
  isMobile          = false;
  todayCount        = 0;

  userName  = 'Cargando...';
  avatarUrl = 'assets/privado.png';
  phrase    = 'Tu día en equilibrio';

  private sub = new Subscription();

  constructor(
    private authService:         AuthService,
    private breakpointObserver:  BreakpointObserver,
    private appointmentService:  AppointmentService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.sub.add(
      this.breakpointObserver.observe('(max-width: 600px)').subscribe(state => {
        this.isMobile = state.matches;
      })
    );

    this.sub.add(
      this.authService.profile$.subscribe(profile => {
        if (profile) {
          const name = [profile.name, profile.last_name].filter(Boolean).join(' ');
          this.userName  = name || 'Nutriólogo';
          this.avatarUrl = profile.photo_url ?? 'assets/privado.png';
        }
      })
    );
    await this.authService.getProfile();
    this.loadTodayCount();
  }

  private async loadTodayCount(): Promise<void> {
    try {
      const all = await this.appointmentService.getAll();
      const todayStr = new Date().toISOString().slice(0, 10);
      this.todayCount = all.filter(a => a.date_time.slice(0, 10) === todayStr).length;
    } catch {
      this.todayCount = 0;
    }
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
