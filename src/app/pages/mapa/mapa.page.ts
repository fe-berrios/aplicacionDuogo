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
    this.viajeUsuario = this.viajes.find(
      (viaje) =>
        viaje.estudiante_conductor === this.usuarioRut ||
        (viaje.pasajeros && viaje.pasajeros.includes(this.usuarioRut))
    );

    if (this.viajeUsuario) {
      this.tieneViajePendiente = true;
      this.botonTexto =
        this.viajeUsuario.estado_viaje === 'En progreso'
          ? 'Cancelar Viaje'
          : 'Comenzar Viaje';
      this.mostrarRutaEnMapa();
    }
  }

  async toggleEstadoViaje() {
    const action =
      this.botonTexto === 'Comenzar Viaje' ? 'iniciar' : 'cancelar';

    if (action === 'cancelar') {
      this.promptCancelarViaje();
    } else {
      const alert = await this.alertController.create({
        header: `¿Estás seguro de ${action} el viaje?`,
        buttons: [
          {
            text: 'No',
            role: 'cancel',
          },
          {
            text: 'Sí',
            handler: async () => {
              this.cambiarEstadoViaje(action === 'iniciar');
            },
          },
        ],
      });

      await alert.present();
    }
  }

  async promptCancelarViaje() {
    const alert = await this.alertController.create({
      header: '¿Por qué cancelas el viaje?',
      inputs: [
        {
          name: 'razon',
          type: 'textarea',
          placeholder: 'Escribe la razón de la cancelación',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Aceptar',
          handler: async (data) => {
            if (data.razon) {
              this.cambiarEstadoViaje(false, data.razon);
            } else {
              const errorAlert = await this.alertController.create({
                header: 'Error',
                message: 'Por favor, escribe una razón para cancelar el viaje.',
                buttons: ['OK'],
              });
              await errorAlert.present();
            }
          },
        },
      ],
    });

    await alert.present();
  }

  async cambiarEstadoViaje(iniciar: boolean, razonCancelacion: string = '') {
    if (this.viajeUsuario) {
      this.viajeUsuario.estado_viaje = iniciar ? 'En progreso' : 'Pendiente';
      if (!iniciar) {
        this.viajeUsuario.razon_cancelacion = razonCancelacion;
      }

      this.botonTexto = iniciar ? 'Cancelar Viaje' : 'Comenzar Viaje';

      // Actualizar en Firebase
      await this.fireService.updateViaje({
        id: this.viajeUsuario.id,
        estado_viaje: this.viajeUsuario.estado_viaje,
        ...(razonCancelacion && { razon_cancelacion: razonCancelacion }),
      });
    }
  }

  async finalizarViaje() {
    const alert = await this.alertController.create({
      header: '¿Estás seguro de finalizar el viaje?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
        },
        {
          text: 'Sí',
          handler: async () => {
            if (this.viajeUsuario) {
              this.viajeUsuario.estado_viaje = 'Finalizado';
              this.tieneViajePendiente = false;

              // Actualizar en Firebase
              await this.fireService.updateViaje({
                id: this.viajeUsuario.id,
                estado_viaje: 'Finalizado',
              });

              // Mensaje de éxito
              const successAlert = await this.alertController.create({
                header: 'Éxito',
                message: 'El viaje ha sido finalizado.',
                buttons: ['OK'],
              });
              await successAlert.present();
            }
          },
        },
      ],
    });

    await alert.present();
  }

  mostrarRutaEnMapa() {
    if (!this.map) {
      console.warn('El mapa aún no está listo.');
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

    const plan = new leaflet.Routing.Plan(
      [
        leaflet.latLng(this.origenLat, this.origenLng),
        leaflet.latLng(destino[0], destino[1]),
      ],
      {
        createMarker: () => false,
      }
    );

    this.routingControl = leaflet.Routing.control({
      plan: plan,
      routeWhileDragging: true,
      show: false,
      addWaypoints: false,
      lineOptions: {
        styles: [{ color: '#ff2e17', weight: 4 }],
        extendToWaypoints: true,
        missingRouteTolerance: 0,
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
