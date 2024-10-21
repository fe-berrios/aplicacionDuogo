import { Component, OnInit } from '@angular/core';
import { ViajeService } from 'src/app/services/viaje.service';

// Import para leaflet
import * as leaflet from 'leaflet';
import * as geo from 'leaflet-control-geocoder';
import 'leaflet-routing-machine';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-viaje',
  templateUrl: './viaje.page.html',
  styleUrls: ['./viaje.page.scss'],
})
export class ViajePage implements OnInit {

  viajes: any[] = [];

  // Leaflet (mapa)
  private map: leaflet.Map | undefined;
  private geocoder: geo.Geocoder | undefined;

  // Variables que rescatan informacion del mapa
  latitud: number = 0;
  longitud: number = 0;
  direccion: string = "";
  distanciaMetros: number = 0;
  tiempoSegundos: number = 0;

  constructor(private viajeService: ViajeService) { }

  ngOnInit() {
    this.initMapa();
    this.getViajes();
  }

  initMapa(){
    // 'locate' Ubicación actual utiliza TÚ ubicación de dispositivo.
    this.map = leaflet.map('map_lista').setView([-33.59838016321339, -70.57879780298838], 16);
    leaflet.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.map);

    // Agregar buscador de direcciones en el mapa
    this.geocoder = geo.geocoder({
      placeholder: "Ingrese dirección a buscar",
      errorMessage: "Dirección NO encontrada"
    }).addTo(this.map);

    this.geocoder.on('markgeocode', (e) => {
      // Asignar latitud, longitud y dirección desde la búsqueda en el mapa
      this.latitud = e.geocode.properties['lat'];
      this.longitud = e.geocode.properties['lon'];
      this.direccion = e.geocode.properties['display_name'];

      if (this.map) {
        leaflet.Routing.control({
          waypoints: [
            leaflet.latLng(-33.59838016321339, -70.57879780298838),
            leaflet.latLng(this.latitud, this.longitud)
          ],
          fitSelectedRoutes: true
        }).on('routesfound', (e) => {
          // Obtener distancia y tiempo de la ruta
          this.distanciaMetros = e.routes[0].summary.totalDistance;
          this.tiempoSegundos = e.routes[0].summary.totalTime;

        }).addTo(this.map);
      }
    });
  }

  verRuta(viaje: any) {
    // Coordenadas del viaje
    const origen = leaflet.latLng(-33.59838016321339, -70.57879780298838); // Coordenadas de Puente Alto
    const destino = leaflet.latLng(viaje.latitud, viaje.longitud); // Coordenadas del destino del viaje
  
    if (this.map) {
      // Limpiar rutas anteriores
      this.map.eachLayer((layer) => {
        if (layer instanceof leaflet.Routing.Control) {
          this.map?.removeLayer(layer);
        }
      });
  
      // Crear nueva ruta en el mapa
      leaflet.Routing.control({
        waypoints: [origen, destino],
        fitSelectedRoutes: true
      }).addTo(this.map);
    }
  }
  
  unirme(viaje: any) {
    // Acción para el botón 'Unirme' (Aún sin implementar)
    console.log('Unirse al viaje', viaje);
  }

  // Obtener viajes desde Storage
  async getViajes(){
    this.viajes = await this.viajeService.getViajes(); 
  }

}