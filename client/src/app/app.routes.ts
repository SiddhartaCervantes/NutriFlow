import { Routes } from '@angular/router';
import { healthInfoComp } from './components/healthInfo/healthInfo';
import { mainComponent } from './components/mainInterface/mainInterface';

export const routes: Routes = [
  {
    path: '',
    component: mainComponent, // esta es la vista que irá dentro del <router-outlet>
    children: [
        { path: '', component: healthInfoComp}
    ]
    },
];
