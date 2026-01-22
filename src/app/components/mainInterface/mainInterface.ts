import { Component, signal, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Header } from '../header/header';
import { CustomSidenav } from '../custom-sidenav/custom-sidenav';
import { CardPreviewComponent } from '../cardInfo/card-preview.component'; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatSidenavModule, Header, CustomSidenav, CardPreviewComponent],
  template: `
    <mat-sidenav-container style="height: 100vh;">
      <mat-sidenav
        class="!bg-black/5 !rounded-none border-r !border-gray-200"
        [style.width.px]="width()"
        opened
        mode="side"
      >
        <app-custom-sidenav [collapsed]="collapsed()" />
      </mat-sidenav>
      <mat-sidenav-content [style.margin-left.px]="width()">
        <app-header (onToggle)="collapsed.set(!collapsed())" />

        <router-outlet></router-outlet>

         
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styleUrl: './mainInterface.scss',
})
export class mainComponent {
  collapsed = signal(false);
  width = computed(() => (this.collapsed() ? 60 : 170));
}
