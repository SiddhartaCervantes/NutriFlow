import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

////COMPONENTES AGREGADOS POR JOAHAN
import { healthInfoComp } from './components/healthInfo/healthInfo';
import { PatientsComponent } from './pages/patient-list/patients.component';

import { mainComponent } from './components/mainInterface/mainInterface';
import { RecipesComponent } from './components/recipes/recipes.component';
import { RecipeDetailComponent } from './components/recipeDetails/recipe-detail.component';
import { CalendarPageComponent } from './pages/calendar-page/calendar-page.component';
import { PatientDetailComponent } from './pages/patient-detail/patient-detail.component';

//Testing of MainLayout
export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: 'patients', component: PatientsComponent },  
      { path: 'recetas', component: RecipesComponent },
      { path: 'recetas/:id', component: RecipeDetailComponent },
      { path: '', redirectTo: 'patients', pathMatch: 'full' },
      { path: 'calendar', component: CalendarPageComponent },
      { path: 'patient-detail', component: PatientDetailComponent},
    ],
  },
  { path: '**', redirectTo: 'patients' }, // ✅ fallback
];

/*
export const routes: Routes = [
    {path:'', component:LoginComponent},
    {path: 'principal', component:PrincipalComponent}
];
*/
