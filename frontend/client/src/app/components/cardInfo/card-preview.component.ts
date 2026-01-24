import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-card-preview',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './card-preview.component.html',
  styleUrls: ['./card-preview.component.scss'],
})
export class CardPreviewComponent {
  @Input() imageSrc = '';
  @Input() alt = '';
  @Input() title = '';
  @Input() description = '';
  @Input() duration = '';
  @Input() difficulty = '';
}
