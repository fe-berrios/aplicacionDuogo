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
    const tiempoEnMilisegundos = this.tiempoEspera * 1000; // Convertir segundos a milisegundos
    setTimeout(() => {
      this.router.navigate(['/usuario']);
    }, tiempoEnMilisegundos);
  }
}
