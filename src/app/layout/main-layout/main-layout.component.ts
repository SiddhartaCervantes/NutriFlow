import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

import { MatSidenavModule } from '@angular/material/sidenav';
import {MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { NgIf } from '@angular/common';
import { UserHeaderCardComponent } from '../../components/user-header-card/user-header-card.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    //Angular material
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    NgIf,
    UserHeaderCardComponent,
],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent {
  isSideNavExpanded = false;

  toggleSideNav(){
    this.isSideNavExpanded = !this.isSideNavExpanded;
  }
}
