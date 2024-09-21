import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recuperar',
  templateUrl: './recuperar.page.html',
  styleUrls: ['./recuperar.page.scss'],
})
export class RecuperarPage {

  tiempoEspera: number = 3; // Tiempo por defecto en segundos

  constructor(private router: Router) {}

  cambiarPagina() {
    this.router.navigate(['/login']);
  }
}
