import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-conductor',
  templateUrl: './conductor.page.html',
  styleUrls: ['./conductor.page.scss'],
})
export class ConductorPage {

  constructor(private router: Router) {}

  cambiarPagina() {

    this.router.navigate(['/lista-cli']);
    
  }

  cambiarPagina2() {

    this.router.navigate(['/ingresar-vehiculo']);
    
  }

}
