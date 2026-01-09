import { Routes } from '@angular/router';
import { healthInfoComp } from './components/healthInfo/healthInfo';
import { mainComponent } from './components/mainInterface/mainInterface';
import { RecipesComponent } from './components/recipes/recipes.component';


export const routes: Routes = [
  {
    path: '',
    component: mainComponent, 
    children: [
        { path: '', component: healthInfoComp},
        { path: 'recetas', component: RecipesComponent},      

    ]
    },
];
