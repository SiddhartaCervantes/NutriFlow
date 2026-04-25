import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

// COMPONENTES AGREGADOS
import { PatientsComponent } from './pages/patient-list/patients.component';
import { RecipesComponent } from './components/recipes/recipes.component';
import { RecipeDetailComponent } from './components/recipeDetails/recipe-detail.component';
import { CalendarPageComponent } from './pages/calendar-page/calendar-page.component';
import { PatientDetailComponent } from './pages/patient-detail/patient-detail.component';
import { NewPatientFormComponent } from './pages/new-patient-form/new-patient-form.component';

export const routes: Routes = [
  // 1. La ruta raíz (vacía) AHORA manda a login obligatoriamente
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // 2. Definimos la ruta de login
  { path: 'login', component: LoginComponent },

  // Rutas solo accesibles si el usuario está logueado
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: 'patients', component: PatientsComponent },  
      { path: 'patients/new', component: NewPatientFormComponent },
      { path: 'recetas', component: RecipesComponent },
      { path: 'recetas/:id', component: RecipeDetailComponent },
      { path: 'calendar', component: CalendarPageComponent },
      { path: 'patdetail', component: PatientDetailComponent },
      
      { path: '', redirectTo: 'patients', pathMatch: 'full' },
    ],
  },

  // 3. REDIRECCIÓN INICIAL
  // Si no está logueado o entra a la raíz, lo mandamos al login primero
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  
  // Si se escribe cualquier ruta que no exista, lo regresa al login
  { path: '**', redirectTo: '/login' }, 
];