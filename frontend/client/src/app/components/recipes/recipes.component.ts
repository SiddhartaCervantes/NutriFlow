import { Component } from '@angular/core';
import { CardPreviewComponent } from '../../components/cardInfo/card-preview.component';

@Component({
  selector: 'app-recipes',
  standalone: true,
  imports: [CardPreviewComponent],
  templateUrl: './recipes.component.html',
  styleUrls: ['./recipes.component.scss'],
})
export class RecipesComponent {
  recetas = [
    {
      image: 'assets/images/pizza.jpg',
      title: 'Pizza Margarita',
      description: 'Una clásica pizza italiana con mozzarella y albahaca fresca.',
      duration: '40 min',
      difficulty: 'Fácil',
    },
    {
      image: 'assets/images/ensalada.jpg',
      title: 'Ensalada Verde',
      description: 'Fresca y ligera, ideal para acompañar tus comidas.',
      duration: '15 min',
      difficulty: 'Muy fácil',
    },
    {
      image: 'assets/images/Super_Berry_Smoothie.jpg',
      title: 'Smoothie de Frutas',
      description: 'Delicioso batido natural con plátano, fresa y avena.',
      duration: '10 min',
      difficulty: 'Fácil',
    },
    {
      image: 'assets/images/california-roll.jpg',
      title: 'Sushi Roll Clásico',
      description: 'Arroz, alga nori y pescado fresco, preparado con precisión.',
      duration: '55 min',
      difficulty: 'Medio',
    },
    {
      image: 'assets/images/margarita.jpg',
      title: 'Pasta al Pesto',
      description: 'Pasta fresca con albahaca, ajo y piñones.',
      duration: '30 min',
      difficulty: 'Fácil',
    },
    {
      image: 'assets/images/pizza.jpg',
      title: 'Pizza Margarita',
      description: 'Una clásica pizza italiana con mozzarella y albahaca fresca.',
      duration: '40 min',
      difficulty: 'Fácil',
    },
    {
      image: 'assets/images/ensalada.jpg',
      title: 'Ensalada Verde',
      description: 'Fresca y ligera, ideal para acompañar tus comidas.',
      duration: '15 min',
      difficulty: 'Muy fácil',
    },
    {
      image: 'assets/images/Super_Berry_Smoothie.jpg',
      title: 'Smoothie de Frutas',
      description: 'Delicioso batido natural con plátano, fresa y avena.',
      duration: '10 min',
      difficulty: 'Fácil',
    },
    {
      image: 'assets/images/california-roll.jpg',
      title: 'Sushi Roll Clásico',
      description: 'Arroz, alga nori y pescado fresco, preparado con precisión.',
      duration: '55 min',
      difficulty: 'Medio',
    },
    {
      image: 'assets/images/margarita.jpg',
      title: 'Pasta al Pesto',
      description: 'Pasta fresca con albahaca, ajo y piñones.',
      duration: '30 min',
      difficulty: 'Fácil',
    },
    {
      image: 'assets/images/pizza.jpg',
      title: 'Pizza Margarita',
      description: 'Una clásica pizza italiana con mozzarella y albahaca fresca.',
      duration: '40 min',
      difficulty: 'Fácil',
    },
    {
      image: 'assets/images/ensalada.jpg',
      title: 'Ensalada Verde',
      description: 'Fresca y ligera, ideal para acompañar tus comidas.',
      duration: '15 min',
      difficulty: 'Muy fácil',
    },
    {
      image: 'assets/images/Super_Berry_Smoothie.jpg',
      title: 'Smoothie de Frutas',
      description: 'Delicioso batido natural con plátano, fresa y avena.',
      duration: '10 min',
      difficulty: 'Fácil',
    },
    {
      image: 'assets/images/california-roll.jpg',
      title: 'Sushi Roll Clásico',
      description: 'Arroz, alga nori y pescado fresco, preparado con precisión.',
      duration: '55 min',
      difficulty: 'Medio',
    },
    {
      image: 'assets/images/margarita.jpg',
      title: 'Pasta al Pesto',
      description: 'Pasta fresca con albahaca, ajo y piñones.',
      duration: '30 min',
      difficulty: 'Fácil',
    },
  ];
}
