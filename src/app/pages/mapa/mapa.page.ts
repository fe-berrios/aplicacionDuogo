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
  // Verificar si el mapa está inicializado
  if (!this.map) {
    console.warn('El mapa aún no está listo.');
    return;
  }

  // Verificar si el destino tiene coordenadas válidas
  const destino = [this.viajeUsuario.latitud, this.viajeUsuario.longitud];
  if (!destino[0] || !destino[1]) {
    console.error('Las coordenadas de destino no están definidas.');
    return;
  }

  // Remover control de ruta anterior si existe
  if (this.routingControl) {
    this.map.removeControl(this.routingControl);
  }

  // Crear plan de ruta personalizado
  const plan = new leaflet.Routing.Plan(
    [
      leaflet.latLng(this.origenLat, this.origenLng), // Coordenadas de inicio fijas
      leaflet.latLng(destino[0], destino[1]) // Coordenadas del destino del viaje
    ], 
    {
      createMarker: () => false  // Retorna false para no crear marcadores
    }
  );

  // Crear y añadir el control de la ruta al mapa
  this.routingControl = leaflet.Routing.control({
    plan: plan,
    routeWhileDragging: true,
    show: false,
    addWaypoints: false,
    lineOptions: {
      styles: [{ color: '#ff2e17', weight: 4 }], // Estilo de la línea
      extendToWaypoints: true,  // Extiende la línea a los puntos de ruta
      missingRouteTolerance: 0  // Tolerancia para rutas faltantes
    }
  }).addTo(this.map);
}


  // Inicializar el mapa con Leaflet
  initMapa() {
    // Inicializar el mapa con un retraso para asegurar que todos los elementos están listos
    setTimeout(() => {
      if (this.map) {
        return;
      }
  
      // Inicializar el mapa centrado en la ubicación deseada
      this.map = leaflet.map('map_map', {
        zoomControl: false,
        center: leaflet.latLng(this.origenLat, this.origenLng),  // Centrado en el origen
        zoom: 16, // Nivel de zoom
      });
  
      // Cargar las capas de OpenStreetMap
      leaflet
        .tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>'
        })
        .addTo(this.map);
  
      // Llamar a mostrarRutaEnMapa si el usuario tiene un viaje pendiente
      if (this.tieneViajePendiente) {
        this.mostrarRutaEnMapa();
      }
    }, 2000);
  }
}
