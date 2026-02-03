import { Injectable } from '@angular/core';

export type Recipe = {
  id: string;
  image: string;
  title: string;
  description: string;
  duration: string;
  tags: string;
  instructions: string;
};

@Injectable({ providedIn: 'root' })
export class RecipesService {
  private readonly recetas: Recipe[] = [
    {
      id: '1',
      image: '../assets/images/pizza.jpg', 
      title: 'Pizza Margarita',
      description: 'Una clásica pizza italiana con mozzarella y albahaca fresca.',
      duration: '40 min',
      instructions: 'HOLA MUCHO GUSTO',
      tags: 'Fácil',
    },
    {
      id: '2',
      image: 'assets/images/ensalada.jpg',
      title: 'Ensalada Verde',
      description: 'Fresca y ligera, ideal para acompañar tus comidas.',
      duration: '15 min',
      tags: 'Muy fácil',
      instructions: 'HOLA MUCHO GUSTO',
    },
      {
      id: '3',
      image: '../assets/images/Super_Berry_Smoothie.jpg',
      title: 'Smoothie de Frutas',
      description: 'Delicioso batido natural con plátano, fresa y avena.',
      duration: '10 min',
      tags: 'Fácil',
      instructions: 'HOLA MUCHO GUSTO',
    },
    {
      id: '4',
      image: '../assets/images/california-roll.jpg',
      title: 'Sushi Roll Clásico',
      description: 'Arroz, alga nori y pescado fresco, preparado con precisión.',
      duration: '55 min',
      tags: 'Medio',
      instructions: 'HOLA MUCHO GUSTO',
    },
    {
      id: '5',
      image: '../assets/images/margarita.jpg',
      title: 'Pasta al Pesto',
      description: 'Pasta fresca con albahaca, ajo y piñones.',
      duration: '30 min',
      tags: 'Fácil',
      instructions: 'HOLA MUCHO GUSTO',
    },
    {
      id: '6',
      image: '../assets/images/pizza.jpg',
      title: 'Pizza Margarita',
      description: 'Una clásica pizza italiana con mozzarella y albahaca fresca.',
      duration: '40 min',
      tags: 'Fácil',
      instructions: 'HOLA MUCHO GUSTO',
    },
    {
      id: '7',
      image: '../assets/images/ensalada.jpg',
      title: 'Ensalada Verde',
      description: 'Fresca y ligera, ideal para acompañar tus comidas.',
      duration: '15 min',
      tags: 'Muy fácil',
      instructions: 'HOLA MUCHO GUSTO',
    },
    {
      id: '8',
      image: '../assets/images/Super_Berry_Smoothie.jpg',
      title: 'Smoothie de Frutas',
      description: 'Delicioso batido natural con plátano, fresa y avena.',
      duration: '10 min',
      tags: 'Fácil',
      instructions: 'HOLA MUCHO GUSTO',
    },
    {
      id: '9',
      image: '../assets/images/california-roll.jpg',
      title: 'Sushi Roll Clásico',
      description: 'Arroz, alga nori y pescado fresco, preparado con precisión.',
      duration: '55 min',
      tags: 'Medio',
      instructions: 'HOLA MUCHO GUSTO',
    },
    {
      id: '10',
      image: '../assets/images/margarita.jpg',
      title: 'Pasta al Pesto',
      description: 'Pasta fresca con albahaca, ajo y piñones.',
      duration: '30 min',
      tags: 'Fácil',
      instructions: 'HOLA MUCHO GUSTO',
    },
    {
      id: '11',
      image: '../assets/images/pizza.jpg',
      title: 'Pizza Margarita',
      description: 'Una clásica pizza italiana con mozzarella y albahaca fresca.',
      duration: '40 min',
      tags: 'Fácil',
      instructions: 'HOLA MUCHO GUSTO',
    },
    {
      id: '12',
      image: '../assets/images/ensalada.jpg',
      title: 'Ensalada Verde',
      description: 'Fresca y ligera, ideal para acompañar tus comidas.',
      duration: '15 min',
      tags: 'Muy fácil',
      instructions: 'HOLA MUCHO GUSTO',
    },
    {
      id: '13',
      image: '../assets/images/Super_Berry_Smoothie.jpg',
      title: 'Smoothie de Frutas',
      description: 'Delicioso batido natural con plátano, fresa y avena.',
      duration: '10 min',
      tags: 'Fácil',
      instructions: 'HOLA MUCHO GUSTO',
    },
    {
      id: '14',
      image: '../assets/images/california-roll.jpg',
      title: 'Sushi Roll Clásico',
      description: 'Arroz, alga nori y pescado fresco, preparado con precisión.',
      duration: '55 min',
      tags: 'Medio',
      instructions: 'HOLA MUCHO GUSTO',
    },
    {
      id: '15',
      image: '../assets/images/margarita.jpg',
      title: 'Pasta al Pesto',
      description: 'Pasta fresca con albahaca, ajo y piñones.',
      duration: '30 min',
      tags: 'Fácil',
      instructions: 'HOLA MUCHO GUSTO',
    }
    // ... el resto igual (cambia ../assets -> assets)
  ];

  getAll(): Recipe[] {
    return this.recetas;
  }

  getById(id: string): Recipe | undefined {
    return this.recetas.find(r => r.id === id);
  }
}
