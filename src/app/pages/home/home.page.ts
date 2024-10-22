import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  constructor() {}

  // Usar ionViewDidEnter para inicializar el mapa después de que la vista esté cargada
  ngOnInit() {
  }

}
