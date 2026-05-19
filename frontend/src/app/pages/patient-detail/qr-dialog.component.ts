import { Component, Inject, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import QRCode from 'qrcode';

export interface QrDialogData {
  patientName: string;
  url: string;
}

@Component({
  selector: 'app-qr-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>Código QR — {{ data.patientName }}</h2>

    <mat-dialog-content style="display:flex; flex-direction:column; align-items:center; gap:16px; padding:24px 32px">
      <canvas #qrCanvas></canvas>
      <p style="font-size:12px; color:#888; text-align:center; margin:0; max-width:260px; word-break:break-all">
        {{ data.url }}
      </p>
      <p style="font-size:13px; color:#555; text-align:center; margin:0">
        El paciente escanea este código y llega directo a su pantalla de acceso con su email pre-llenado.
      </p>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cerrar</button>
      <button mat-raised-button color="primary" (click)="download()">
        <mat-icon>download</mat-icon>
        Descargar QR
      </button>
    </mat-dialog-actions>
  `,
})
export class QrDialogComponent implements AfterViewInit {
  @ViewChild('qrCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  constructor(@Inject(MAT_DIALOG_DATA) public data: QrDialogData) {}

  async ngAfterViewInit(): Promise<void> {
    await QRCode.toCanvas(this.canvasRef.nativeElement, this.data.url, {
      width: 260,
      margin: 2,
      color: { dark: '#1b5e20', light: '#ffffff' },
    });
  }

  download(): void {
    const canvas = this.canvasRef.nativeElement;
    const link   = document.createElement('a');
    link.download = `qr-${this.data.patientName.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.href     = canvas.toDataURL('image/png');
    link.click();
  }
}
