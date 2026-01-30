import { Component } from '@angular/core';
import { CardPreviewComponent } from '../../components/cardInfo/card-preview.component';
import { RecipesService, Recipe} from '../../data/recipes.service';

@Component({
  selector: 'app-recipes',
  standalone: true,
  imports: [CardPreviewComponent],
  templateUrl: './recipes.component.html',
  styleUrls: ['./recipes.component.scss'],
})
export class RecipesComponent {
  recetas: Recipe[] = [];

  constructor(private recipesService: RecipesService) {
    this.recetas = this.recipesService.getAll();
}
}
