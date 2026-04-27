import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-add-note-dialog',
  standalone: true,
  imports: [FormsModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>Nueva nota clínica</h2>

    <mat-dialog-content>
      <textarea
        class="note-input"
        [(ngModel)]="text"
        placeholder="Escribe tu observación clínica aquí..."
        rows="5"
        autofocus
      ></textarea>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-stroked-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="primary"
              [disabled]="!text.trim()"
              (click)="confirm()">
        <mat-icon>save</mat-icon>
        Guardar nota
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .note-input {
      width: 100%;
      min-width: 420px;
      padding: 12px;
      border: 1.5px solid #ddd;
      border-radius: 10px;
      font-size: 14px;
      font-family: inherit;
      outline: none;
      resize: vertical;
      box-sizing: border-box;
    }
    .note-input:focus { border-color: #1976d2; }
    @media (max-width: 480px) { .note-input { min-width: unset; } }
  `],
})
export class AddNoteDialogComponent {
  text = '';

  constructor(private ref: MatDialogRef<AddNoteDialogComponent, string>) {}

  confirm(): void {
    if (!this.text.trim()) return;
    this.ref.close(this.text.trim());
  }
}
