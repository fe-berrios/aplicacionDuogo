import { Component } from '@angular/core';
import { Router } from '@angular/router';

// Import para leaflet
import * as leaflet from 'leaflet';
import * as geo from 'leaflet-control-geocoder';
import 'leaflet-routing-machine';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  // Usuario
  usuario: any = null;

  // Leaflet (mapa)
  private map: leaflet.Map | undefined;
  private geocoder: geo.Geocoder | undefined;

  constructor(private router: Router) {}

  // Usar ionViewDidEnter para inicializar el mapa después de que la vista esté cargada
  ionViewDidEnter() {
    this.initMapa();
  }

  // Inicializar el mapa
  initMapa() {
    // Verificar si el mapa ya fue inicializado
    if (this.map) {
      return;
    }

    // Esto es el mapa en sí, con control de zoom activado
    this.map = leaflet.map('map_home', {
      zoomControl: false,   // Habilitar control de botones de zoom
    }).locate({ setView: true, maxZoom: 16 });

    // Esto visualiza el mapa
    leaflet
      .tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      })
      .addTo(this.map);
  }

  usuarioTipo(): boolean {
    const usuarioSesion = sessionStorage.getItem('usuario');
    if (usuarioSesion) {
      const usuario = JSON.parse(usuarioSesion);
      return usuario.tipo_usuario === 'administrador';
    }
    return false;
  }

  goToHome() {
    this.router.navigateByUrl('/home');
  }
}
