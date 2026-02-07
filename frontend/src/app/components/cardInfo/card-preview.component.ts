import { Component, EventEmitter, Input, Output} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-card-preview',
  standalone: true,
  imports: [MatIconModule, RouterLink],
  templateUrl: './card-preview.component.html',
  styleUrls: ['./card-preview.component.scss'],
})
export class CardPreviewComponent {
  @Input() id!: string;
  @Input() imageSrc = '';
  @Input() alt = '';
  @Input() title = '';
  @Input() description = '';
  @Input() duration = '';
  @Input() difficulty = '';

  @Output() open = new EventEmitter<string>();

  onOpen(){

    if(this.id) this.open.emit(this.id);
  }
}
