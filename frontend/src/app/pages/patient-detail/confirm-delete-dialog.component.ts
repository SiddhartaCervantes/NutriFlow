import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDeleteData {
  name: string;
}

@Component({
  selector: 'app-confirm-delete-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="cd-wrap">
      <div class="cd-icon">
        <mat-icon>warning_amber</mat-icon>
      </div>

      <h2 class="cd-title">Eliminar paciente</h2>
      <p class="cd-body">
        ¿Estás seguro de que quieres eliminar a
        <strong>{{ data.name }}</strong>?
        Esta acción no se puede deshacer y borrará también su plan alimenticio.
      </p>

      <div class="cd-actions">
        <button mat-stroked-button mat-dialog-close>Cancelar</button>
        <button mat-raised-button color="warn" (click)="confirm()">
          <mat-icon>delete</mat-icon>
          Eliminar
        </button>
      </div>
    </div>
  `,
  styles: [`
    .cd-wrap    { padding: 8px 4px 4px; text-align: center; max-width: 360px; }
    .cd-icon    { font-size: 48px; color: #e53935; line-height: 1; margin-bottom: 8px; }
    .cd-icon mat-icon { font-size: 48px; width: 48px; height: 48px; }
    .cd-title   { margin: 0 0 10px; font-size: 20px; font-weight: 800; }
    .cd-body    { margin: 0 0 24px; font-size: 14px; color: #555; line-height: 1.5; }
    .cd-actions { display: flex; justify-content: center; gap: 12px; }
  `],
})
export class ConfirmDeleteDialogComponent {
  constructor(
    private ref: MatDialogRef<ConfirmDeleteDialogComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDeleteData,
  ) {}

  confirm(): void {
    this.ref.close(true);
  }
}
