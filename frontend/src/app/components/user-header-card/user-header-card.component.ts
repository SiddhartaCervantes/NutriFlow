import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-header-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './user-header-card.component.html',
  styleUrl: './user-header-card.component.css'
})
export class UserHeaderCardComponent {
  @Input() userName = 'Dr. Núñez';
  @Input() phrase   = 'Tu día en equilibrio';
  @Input() avatarUrl = 'assets/avatar-example.jpg';
  @Input() date: Date = new Date();

  constructor(private router: Router) {}

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }
}
