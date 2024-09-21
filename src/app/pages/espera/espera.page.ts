import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-espera',
  templateUrl: './espera.page.html',
  styleUrls: ['./espera.page.scss'],
})
export class EsperaPage implements OnInit {  // Cambiado a 'EsperaPage'
  constructor(private router: Router) {}

  ngOnInit() {
    this.redirigirLogin();
  }

  redirigirLogin() {
    setTimeout(() => {
      this.router.navigate(['/login']); 
    }, 1500); // Redirige después de 3 segundos
  }
}