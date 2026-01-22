import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';

////COMPONENTES AGREGADOS POR JOAHAN
import { healthInfoComp } from './components/healthInfo/healthInfo';
import { mainComponent } from './components/mainInterface/mainInterface';
import { RecipesComponent } from './components/recipes/recipes.component';


import { MainLayoutComponent } from './layout/main-layout/main-layout.component';


//Testing of MainLayout
export const routes: Routes = [
    {   
        path:'', 
        component: MainLayoutComponent,
        children: [
            { path: 'healthInfo', component: healthInfoComp},
            { path: 'recetas', component: RecipesComponent},   
        ],
    },
];
/*
export const routes: Routes = [
    {path:'', component:LoginComponent},
    {path: 'principal', component:PrincipalComponent}
];
*/
