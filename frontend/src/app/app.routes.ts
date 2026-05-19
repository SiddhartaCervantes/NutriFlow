import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

import { PatientsComponent } from './pages/patient-list/patients.component';
import { RecipesComponent } from './components/recipes/recipes.component';
import { RecipeDetailComponent } from './components/recipeDetails/recipe-detail.component';
import { CalendarPageComponent } from './pages/calendar-page/calendar-page.component';
import { PatientDetailComponent } from './pages/patient-detail/patient-detail.component';
import { NewPatientFormComponent } from './pages/new-patient-form/new-patient-form.component';
import { SetupProfileComponent } from './pages/setup-profile/setup-profile.component';
import { ProfileEditComponent } from './pages/profile-edit/profile-edit.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { PatientPortalComponent } from './pages/patient-portal/patient-portal.component';
import { MiPlanComponent } from './pages/mi-plan/mi-plan.component';
import { WelcomeComponent } from './pages/welcome/welcome.component';
import { authGuard } from './guards/auth.guard';
import { patientGuard } from './guards/patient.guard';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', component: WelcomeComponent, pathMatch: 'full' },

  { path: 'login',           component: LoginComponent },
  { path: 'reset-password',  component: ResetPasswordComponent },
  { path: 'setup-profile',   component: SetupProfileComponent },
  { path: 'patient-portal',  component: PatientPortalComponent },
  { path: 'mi-plan',         component: MiPlanComponent, canActivate: [patientGuard] },

  // Rutas protegidas — requieren sesión activa
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard',     component: DashboardComponent },
      { path: 'patients',      component: PatientsComponent },
      { path: 'patients/new',  component: NewPatientFormComponent },
      { path: 'patients/:id',  component: PatientDetailComponent },
      { path: 'recetas',       component: RecipesComponent },
      { path: 'recetas/:id',   component: RecipeDetailComponent },
      { path: 'calendar',      component: CalendarPageComponent },
      { path: 'profile',       component: ProfileEditComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  { path: '**', redirectTo: '/login' },
];
