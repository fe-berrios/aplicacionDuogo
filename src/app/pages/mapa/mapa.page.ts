import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as leaflet from 'leaflet';
import * as geo from 'leaflet-control-geocoder';
import 'leaflet-routing-machine';
import { ViajeService } from 'src/app/services/viaje.service';

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.page.html',
  styleUrls: ['./mapa.page.scss'],
})
export class MapaPage implements OnInit {

  // Viajes
  viajes: any[] = [];

  // Variable para el RUT del usuario
  usuarioRut: string = '';

  // Variable para determinar si el usuario tiene un viaje pendiente
  tieneViajePendiente: boolean = false;

  // Viaje del usuario
  viajeUsuario: any;

  // Leaflet (mapa)
  private map: leaflet.Map | undefined;
  private geocoder: geo.Geocoder | undefined;
  private routingControl: any;

  // Coordenadas fijas de inicio (Duoc UC Puente Alto)
  private origenLat: number = -33.59838016321339;
  private origenLng: number = -70.57879780298838;

  constructor(private viajeService: ViajeService, private router: Router) { }

  ngOnInit() {
    // Inicializar el mapa
    this.initMapa();
    
    // Rescatar el usuario completo desde localStorage
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    
    // Obtener el rut del usuario
    this.usuarioRut = usuario.rut || ''; // Asegúrate de que el rut esté disponible en el objeto usuario

    // Rescatar los viajes
    this.getViajes();
  }

  // Rescatar viajes desde el servicio
  async getViajes() {
    this.viajes = await this.viajeService.getViajes();

    // Verificar si el usuario tiene un viaje pendiente
    this.checkViajePendiente();
  }

  // Verificar si el usuario tiene un viaje pendiente
  checkViajePendiente() {
    // Buscar el viaje que corresponde al usuario actual ya sea como conductor o pasajero
    this.viajeUsuario = this.viajes.find(viaje => 
      viaje.estudiante_conductor === this.usuarioRut || 
      (viaje.pasajeros && viaje.pasajeros.includes(this.usuarioRut))
    );
  
    // Si el usuario tiene un viaje pendiente, muestra el mensaje y traza la ruta en el mapa
    if (this.viajeUsuario) {
      this.tieneViajePendiente = true;
      this.mostrarRutaEnMapa();
    }
  }
  

  // Mostrar la ruta del viaje en el mapa usando leaflet-routing-machine
  mostrarRutaEnMapa() {
    // Coordenadas del destino desde el viaje
    const destino = [this.viajeUsuario.latitud, this.viajeUsuario.longitud];

    if (this.routingControl) {
      this.map?.removeControl(this.routingControl);
    }

    // Crear plan personalizado sin marcadores de origen y destino
    const plan = new leaflet.Routing.Plan(
      [
        leaflet.latLng(this.origenLat, this.origenLng), // Coordenadas de inicio fijas
        leaflet.latLng(destino[0], destino[1]) // Coordenadas del destino del viaje
      ], 
      {
        createMarker: function() { return false; }  // Devuelve false para no crear marcadores
      }
    );

    // Traza la ruta desde el punto de origen fijo hasta el destino sin mostrar instrucciones
    this.routingControl = leaflet.Routing.control({
      plan: plan,  // Usar el plan personalizado sin marcadores
      routeWhileDragging: true,
      show: false,  // Desactiva la visualización de las instrucciones
      addWaypoints: false,  // Desactiva la posibilidad de agregar puntos intermedios
      lineOptions: {
        styles: [{ color: '#ff2e17', weight: 4 }],  // Personalización de la línea
        extendToWaypoints: true,  // Esta propiedad debe estar presente
        missingRouteTolerance: 0  // Tolerancia para rutas faltantes
      }
    }).addTo(this.map!);
  }

  // Inicializar el mapa con Leaflet
  initMapa() {
    // Verificar si el mapa ya fue inicializado
    if (this.map) {
      return;
    }

    // Inicializar el mapa centrado en la ubicación deseada
    this.map = leaflet.map('map_map', {
      zoomControl: false,   // Habilitar control de botones de zoom
    }).locate({ setView: true, maxZoom: 16 });

    // Cargar las capas de OpenStreetMap
    leaflet
      .tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      })
      .addTo(this.map);
  }

}
