import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import * as leaflet from 'leaflet';
import * as geo from 'leaflet-control-geocoder';
import 'leaflet-routing-machine';
import { firstValueFrom } from 'rxjs';
import { FireService } from 'src/app/services/fire.service';
import { ViajeService } from 'src/app/services/viaje.service';

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.page.html',
  styleUrls: ['./mapa.page.scss'],
})
export class MapaPage implements OnInit {
  viajes: any[] = [];
  usuarioRut: string = '';
  tieneViajePendiente: boolean = false;
  viajeUsuario: any;
  botonTexto: string = 'Comenzar Viaje';

  private map: leaflet.Map | undefined;
  private routingControl: any;
  private origenLat: number = -33.59838016321339;
  private origenLng: number = -70.57879780298838;

  constructor(
    private viajeService: ViajeService,
    private router: Router,
    private fireService: FireService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.initMapa();
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.usuarioRut = usuario.rut || '';
    this.getViajes();
  }

  async getViajes() {
    this.viajes = await firstValueFrom(this.fireService.getViajes());
    this.checkViajePendiente();
  }

  checkViajePendiente() {
    if (!this.usuarioRut) return;
  
    // Filtrar viajes donde el usuario sea conductor o pasajero
    const viajesUsuario = this.viajes.filter(
      (viaje) =>
        viaje.estudiante_conductor === this.usuarioRut ||
        (viaje.pasajeros && viaje.pasajeros.includes(this.usuarioRut))
    );
  
    // Encontrar el viaje que esté en estado 'Pendiente' o 'En progreso'
    this.viajeUsuario = viajesUsuario.find(
      (viaje) => viaje.estado_viaje === 'Pendiente' || viaje.estado_viaje === 'En progreso'
    );
  
    // Si hay un viaje pendiente o en progreso
    if (this.viajeUsuario) {
      const estado = this.viajeUsuario.estado_viaje;
      this.tieneViajePendiente = true;
      this.botonTexto = estado === 'En progreso' ? 'Finalizar Viaje' : 'Comenzar Viaje';
    } else {
      // Si no hay viajes pendientes o en progreso
      this.tieneViajePendiente = false;
    }
  }
  
  // Verificar si el usuario es el conductor asignado
  esConductorDelViaje(): boolean {
    return this.viajeUsuario?.estudiante_conductor === this.usuarioRut;
  }

  async toggleEstadoViaje() {
    if (!this.viajeUsuario) return;
  
    const esInicio = this.botonTexto === 'Comenzar Viaje';
    const alert = await this.alertController.create({
      header: esInicio ? 'Iniciar Viaje' : 'Finalizar Viaje',
      message: `¿Estás seguro de ${esInicio ? 'iniciar' : 'finalizar'} este viaje?`,
      buttons: [
        { text: 'No', role: 'cancel' },
        {
          text: 'Sí',
          handler: async () => {
            if (esInicio) {
              await this.cambiarEstadoViaje(true);
            } else {
              await this.finalizarViaje();
            }
          },
        },
      ],
    });
  
    await alert.present();
  }

  async cambiarEstadoViaje(iniciar: boolean) {
    if (this.viajeUsuario) {
      this.viajeUsuario.estado_viaje = iniciar ? 'En progreso' : 'Finalizado';
      this.botonTexto = iniciar ? 'Finalizar Viaje' : 'Comenzar Viaje';
  
      // Actualizar en Firebase
      await this.fireService.updateViaje({
        id: this.viajeUsuario.id,
        estado_viaje: this.viajeUsuario.estado_viaje,
      });
  
      if (iniciar) {
        this.mostrarRutaEnMapa();
      } else {
        this.tieneViajePendiente = false;
      }
    }
  }

  async finalizarViaje() {
    if (!this.viajeUsuario) return;
  
    this.viajeUsuario.estado_viaje = 'Finalizado';
    this.tieneViajePendiente = false;
  
    // Actualizar en Firebase
    await this.fireService.updateViaje({
      id: this.viajeUsuario.id,
      estado_viaje: 'Finalizado',
    });
  
    // Mostrar mensaje de éxito
    const successAlert = await this.alertController.create({
      header: 'Éxito',
      message: 'El viaje ha sido finalizado.',
      buttons: ['OK'],
    });
    await successAlert.present();
  }

  mostrarRutaEnMapa() {
    if (!this.map || !this.viajeUsuario) {
      console.warn('El mapa o el viaje no están listos.');
      return;
    }
  
    const destino = [this.viajeUsuario.latitud, this.viajeUsuario.longitud];
    if (!destino[0] || !destino[1]) {
      console.error('Las coordenadas de destino no están definidas.');
      return;
    }
  
    if (this.routingControl) {
      this.map.removeControl(this.routingControl);
    }
  
    this.routingControl = leaflet.Routing.control({
      waypoints: [
        leaflet.latLng(this.origenLat, this.origenLng),
        leaflet.latLng(destino[0], destino[1]),
      ],
      routeWhileDragging: true,
      show: false,
      addWaypoints: false,
      lineOptions: {
        styles: [{ color: '#ff2e17', weight: 4 }],
        extendToWaypoints: true,
        missingRouteTolerance: 1,
      },
    }).addTo(this.map);
  }

  initMapa() {
    setTimeout(() => {
      if (this.map) {
        return;
      }

      this.map = leaflet.map('map_map', {
        zoomControl: false,
        center: leaflet.latLng(this.origenLat, this.origenLng),
        zoom: 16,
      });

      leaflet
        .tileLayer(
          'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
          {
            maxZoom: 19,
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>',
          }
        )
        .addTo(this.map);

      if (this.tieneViajePendiente) {
        this.mostrarRutaEnMapa();
      }
    }, 2000);
  }
}
