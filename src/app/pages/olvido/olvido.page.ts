import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-olvido',
  templateUrl: './olvido.page.html',
  styleUrls: ['./olvido.page.scss'],
})
export class OlvidoPage {
  tiempoEspera: number = 3; // Tiempo por defecto en segundos

  constructor(private router: Router) {}

  cambiarPagina() {
    const tiempoEnMilisegundos = this.tiempoEspera * 1000; // Convertir segundos a milisegundos
    setTimeout(() => {
      this.router.navigate(['/recuperar']);
    }, tiempoEnMilisegundos);
  }
}



