import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-welcome',
  standalone: true,
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.css',
})
export class WelcomeComponent {
  constructor(private router: Router) {}

  goToNutritionist(): void { this.router.navigate(['/login']); }
  goToPatient():      void { this.router.navigate(['/patient-portal']); }
}
