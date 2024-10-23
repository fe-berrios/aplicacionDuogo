import { Component, OnInit } from '@angular/core';
import { ViajeService } from 'src/app/services/viaje.service';

// Import para leaflet
import * as leaflet from 'leaflet';
import * as geo from 'leaflet-control-geocoder';
import 'leaflet-routing-machine';
import { JsonPipe } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-viaje',
  templateUrl: './viaje.page.html',
  styleUrls: ['./viaje.page.scss'],
})
export class ViajePage implements OnInit {

  viajes: any[] = [];
  tipoUsuario: string = '';

  // Leaflet (mapa)
  private map: leaflet.Map | undefined;
  private geocoder: geo.Geocoder | undefined;

  // Variables que rescatan informacion del mapa
  latitud: number = 0;
  longitud: number = 0;
  direccion: string = "";
  distanciaMetros: number = 0;
  tiempoSegundos: number = 0;

  constructor(private viajeService: ViajeService, private router: Router) { }

  ngOnInit() {
    this.initMapa();
    this.getViajes();
    this.getTipoUsuario();
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
    // Rescatar el usuario en sesión desde localStorage
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const rutUsuario = usuario.rut;
  
    // Verificar si el usuario ya está asociado a algún viaje en la lista de viajes
    const yaAsociado = this.viajes.some(v =>
      v.estudiante_conductor === rutUsuario || (v.pasajeros && v.pasajeros.includes(rutUsuario))
    );
  
    if (yaAsociado) {
      // El usuario ya está asociado a otro viaje, no puede unirse a este
      console.log('No puedes unirte a este viaje porque ya estás asociado a otro viaje.');
      return;
    }
  
    // Verificar si el rut del usuario ya está asociado a este viaje
    const esConductor = viaje.estudiante_conductor === rutUsuario;
    const esPasajero = viaje.pasajeros && viaje.pasajeros.includes(rutUsuario);
  
    if (esConductor || esPasajero) {
      // El usuario ya está asociado a este viaje
      console.log('No puedes unirte a este viaje porque ya estás asociado.');
      return;
    }
  
    // Si no está asociado, realizar la acción para unirse al viaje
    console.log('Unirse al viaje', viaje);
  
    // Lógica adicional para agregar el rut del usuario al campo pasajeros
    if (!viaje.pasajeros) {
      viaje.pasajeros = [];
    }
    viaje.pasajeros.push(rutUsuario);
  
    // Actualizar el viaje en el servicio
    this.viajeService.updateViaje(viaje.id, viaje).then(() => {
      console.log('Te has unido al viaje exitosamente.');
      
      // Redirigir a la página /home/mapa después de unirse
      this.router.navigate(['/home/mapa']);
    }).catch((error) => {
      console.log('Error al unirse al viaje:', error);
    });
  }

  // Obtener viajes desde Storage
  async getViajes(){
    this.viajes = await this.viajeService.getViajes(); 
  }

  getTipoUsuario() {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.tipoUsuario = usuario.tipo_usuario; // Asignamos el tipo de usuario
  }

}