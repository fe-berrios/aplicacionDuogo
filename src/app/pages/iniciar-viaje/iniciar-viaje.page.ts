import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-iniciar-viaje',
  templateUrl: './iniciar-viaje.page.html',
  styleUrls: ['./iniciar-viaje.page.scss'],
})
export class IniciarViajePage {

  constructor(private router: Router) { }

  cambiarPagina() {

    this.router.navigate(['/finalizar-viaje']);
    
  }
}
