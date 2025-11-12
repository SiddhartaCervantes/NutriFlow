import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-drawer',
  imports: [RouterModule, CommonModule],
  templateUrl: './drawer.component.html',
  styleUrl: './drawer.component.css'
})
export class DrawerComponent {
  isOpen: boolean = false;
  isTareasOpen: boolean = false;  
  isUsuariosOpen: boolean = false;
  isTrueUpOpen: boolean = false;
  isUsuario: boolean = false;

  toggleDrawer() {
    this.isOpen = !this.isOpen;
  }
  
  toggleTrueUp() {
    this.isTrueUpOpen = !this.isTrueUpOpen;
  }
  
  toggleUsuariosP() {
    this.isUsuariosOpen = !this.isUsuariosOpen;
  }
  
  toggleTareas() {
    this.isTareasOpen = !this.isTareasOpen;
  }

  toggleUsuario(){
    this.isUsuario = !this.isUsuario;
  }
  
}

