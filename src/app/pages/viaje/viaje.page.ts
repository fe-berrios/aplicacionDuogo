import { Component, OnInit } from '@angular/core';
import { ViajeService } from 'src/app/services/viaje.service';

// Import para leaflet
import * as leaflet from 'leaflet';
import * as geo from 'leaflet-control-geocoder';
import 'leaflet-routing-machine';
import { Router } from '@angular/router';

@Component({
  selector: 'app-viaje',
  templateUrl: './viaje.page.html',
  styleUrls: ['./viaje.page.scss'],
})
export class ViajePage implements OnInit {

  viajes: any[] = [];
  tipoUsuario: string = '';
  usuario: any;
  tieneViaje: boolean = false; // Nueva variable para verificar si ya está en un viaje
  isMapLoading: boolean = true;

  // Leaflet (mapa)
  private map: leaflet.Map | undefined;
  private geocoder: geo.Geocoder | undefined;
  private currentRouteControl: any;

  // Variables que rescatan informacion del mapa
  latitud: number = 0;
  longitud: number = 0;
  direccion: string = "";
  distanciaMetros: number = 0;
  tiempoSegundos: number = 0;

  constructor(private viajeService: ViajeService, private router: Router) {}

  ngOnInit() {
    this.getTipoUsuario();
    this.initMapa();
    this.getViajes();
  }

  initMapa() {
    setTimeout(() => {
          // 'locate' Ubicación actual utiliza TÚ ubicación de dispositivo.
    this.map = leaflet.map('map_lista').setView([-33.59838016321339, -70.57879780298838], 16);
    leaflet.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>'
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
    
    }, 2000);
  }


  verRuta(viaje: any) {
    const origen = leaflet.latLng(-33.59838016321339, -70.57879780298838);
    const destino = leaflet.latLng(viaje.latitud, viaje.longitud);

    if (this.map) {
      // Remover la ruta actual si existe antes de agregar una nueva
      if (this.currentRouteControl) {
        this.map.removeControl(this.currentRouteControl);
      }

      // Crear nueva ruta en el mapa
      this.currentRouteControl = leaflet.Routing.control({
        waypoints: [origen, destino],
        fitSelectedRoutes: true
      }).on('routesfound', (e) => {
        this.distanciaMetros = e.routes[0].summary.totalDistance;
        this.tiempoSegundos = e.routes[0].summary.totalTime;
      }).addTo(this.map);
    }
  }

  esPasajero(viaje: any): boolean {
    return viaje.pasajeros && viaje.pasajeros.includes(this.usuario.rut);
  }

  unirme(viaje: any) {
    const rutUsuario = this.usuario.rut;

    // Verificar si el usuario ya está asociado a algún viaje
    const yaAsociado = this.viajes.some(v =>
      v.estudiante_conductor === rutUsuario || (v.pasajeros && v.pasajeros.includes(rutUsuario))
    );

    if (yaAsociado) {
      console.log('No puedes unirte a este viaje porque ya estás asociado a otro viaje.');
      return;
    }

    if (!viaje.pasajeros) {
      viaje.pasajeros = [];
    }

    viaje.pasajeros.push(rutUsuario);
    viaje.asientos_disponibles -= 1;

    this.viajeService.updateViaje(viaje.id, viaje).then(() => {
      console.log('Te has unido al viaje exitosamente.');
      this.router.navigate(['/home/mapa']);
    }).catch((error) => {
      console.log('Error al unirse al viaje:', error);
    });
  }

  abandonar(viaje: any) {
    const rutUsuario = this.usuario.rut;
    const index = viaje.pasajeros.indexOf(rutUsuario);

    if (index > -1) {
      viaje.pasajeros.splice(index, 1);
      viaje.asientos_disponibles += 1;

      this.viajeService.updateViaje(viaje.id, viaje).then(() => {
        console.log('Has abandonado el viaje exitosamente.');
        this.getViajes();
      }).catch((error) => {
        console.log('Error al abandonar el viaje:', error);
      });
    } else {
      console.log('No estás asociado a este viaje.');
    }
  }

  modificarViaje(viaje: any) {
    this.router.navigate(['/modificar-viaje'], { queryParams: { id: viaje.id } });
  }

  async cancelarViaje(viaje: any) {
    const confirmar = confirm('¿Estás seguro de que deseas cancelar este viaje?');
    if (confirmar) {
      await this.viajeService.deleteViaje(viaje.id);
      console.log('Viaje cancelado exitosamente.');
      this.getViajes();
    }
  }

  async getViajes() {
    this.viajes = await this.viajeService.getViajes();
  
    // Verificar si el usuario ya tiene un viaje creado o está asociado como pasajero
    const rutUsuario = this.usuario.rut;
  
    this.tieneViaje = this.viajes.some(viaje => 
      viaje.estudiante_conductor === rutUsuario || (viaje.pasajeros && viaje.pasajeros.includes(rutUsuario))
    );
  
    console.log('Tiene Viaje:', this.tieneViaje);  // Log para verificar
    console.log('Tipo de Usuario:', this.tipoUsuario);  // Log para verificar
  }

  getTipoUsuario() {
    this.usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.tipoUsuario = this.usuario.tipo_usuario || ''; // Asegúrate de que no quede undefined
    console.log('Tipo de Usuario:', this.tipoUsuario);  // Log para verificar el valor
  }
  esConductor(viaje: any): boolean {
    return viaje.estudiante_conductor === this.usuario.rut;
  }

}
