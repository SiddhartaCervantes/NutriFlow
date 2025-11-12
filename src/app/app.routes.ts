import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DrawerComponent } from './drawer/drawer.component';
import { PrincipalComponent } from './principal/principal.component';

export const routes: Routes = [
    {path:'', component:LoginComponent},
    {path: 'principal', component:PrincipalComponent}
];
