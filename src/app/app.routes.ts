import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DrawerComponent } from './drawer/drawer.component';
import { PrincipalComponent } from './principal/principal.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';


//Testing of MainLayout
export const routes: Routes = [
    {   
        path:'', 
        component: MainLayoutComponent,
        children: [],
    },
];
/*
export const routes: Routes = [
    {path:'', component:LoginComponent},
    {path: 'principal', component:PrincipalComponent}
];
*/
