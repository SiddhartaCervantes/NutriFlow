import { Component, output} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';



@Component({
  selector: 'app-header',
  imports: [MatToolbarModule, MatIconModule, MatButtonModule],
  template: `
    <mat-toolbar class="bg-red-500"> 
      <button mat-icon-button (click)="onToggle.emit()">
        <mat-icon>menu</mat-icon>
      </button>
    </mat-toolbar>
  `,
})


export class Header {
  onToggle = output();
}
