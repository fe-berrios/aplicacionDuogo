import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-finalizar-viaje',
  templateUrl: './finalizar-viaje.page.html',
  styleUrls: ['./finalizar-viaje.page.scss'],
})
export class FinalizarViajePage {

  constructor(private router: Router) {}

  cambiarPagina() {

    this.router.navigate(['/conductor']);
    
  }

}
