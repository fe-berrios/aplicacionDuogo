import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ViajeService } from 'src/app/services/viaje.service';
import * as leaflet from 'leaflet';
import * as geo from 'leaflet-control-geocoder';
import 'leaflet-routing-machine';
import { FireService } from 'src/app/services/fire.service';
import { ApiService } from 'src/app/services/api.service';
import { AlertController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-crear-viaje',
  templateUrl: './crear-viaje.page.html',
  styleUrls: ['./crear-viaje.page.scss'],
})
export class CrearViajePage implements OnInit {
  // Leaflet (mapa)
  private map: leaflet.Map | undefined;
  private geocoder: geo.Geocoder | undefined;
  private currentRoute: any; // Variable para almacenar la referencia de la ruta actual

  // Variables que rescatan información del mapa
  latitud: number = 0;
  longitud: number = 0;
  direccion: string = '';
  distanciaMetros: number = 0;
  tiempoSegundos: number = 0;

  // API
  dolar: number = 0;

  viaje = new FormGroup({
    estudiante_conductor: new FormControl(''),
    asientos_disponibles: new FormControl('', [Validators.required, Validators.min(1)]),
    nombre_destino: new FormControl(''),
    latitud: new FormControl(''),
    longitud: new FormControl(''),
    distancia_metros: new FormControl(''),
    tiempo_segundos: new FormControl(''),
    forma_pago: new FormControl('', [Validators.required]),
    estado_viaje: new FormControl(''),
    razon_cancelacion: new FormControl(''),
    hora_salida: new FormControl('', [
      Validators.required,
      Validators.pattern('^([01]?[0-9]|2[0-3]):[0-5][0-9]$')
    ]),
    pasajeros: new FormControl(''),
    costo: new FormControl('', [Validators.required, Validators.min(0)]),
    costo_dolar: new FormControl('', []),
    patente: new FormControl({ value: '', disabled: true }) // Patente no editable
  });
  viajeForm: any;
  usuario: any;

  constructor(
    private router: Router,
    private viajeService: ViajeService,
    private fireService: FireService,
    private apiService: ApiService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.initMapa();
    this.dolarAPI();

    const usuarioConductor = localStorage.getItem('usuario');

    if (usuarioConductor) {
      const usuario = JSON.parse(usuarioConductor);

      // Asignar datos iniciales del conductor al formulario
      this.viaje.patchValue({
        estudiante_conductor: usuario.rut,
        estado_viaje: 'Pendiente',
        patente: usuario.patente // Asumiendo que el usuario tiene el campo patente
      });
    }
  }

  initMapa() {
    setTimeout(() => {
      if (!this.map) {
        this.map = leaflet.map('map_create').setView([-33.59838016321339, -70.57879780298838], 16);

        leaflet.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(this.map);

        this.geocoder = geo.geocoder({
          placeholder: 'Ingrese dirección a buscar',
          errorMessage: 'Dirección no encontrada'
        }).addTo(this.map);

        this.geocoder.on('markgeocode', (e) => {
          this.latitud = e.geocode.properties['lat'];
          this.longitud = e.geocode.properties['lon'];
          this.direccion = e.geocode.properties['display_name'];

          this.viaje.patchValue({
            latitud: this.latitud.toString(),
            longitud: this.longitud.toString(),
            nombre_destino: this.direccion
          });

          if (this.map) {
            if (this.currentRoute) {
              this.map.removeControl(this.currentRoute); // Remover ruta anterior
            }

            this.currentRoute = leaflet.Routing.control({
              waypoints: [
                leaflet.latLng(-33.59838016321339, -70.57879780298838),
                leaflet.latLng(this.latitud, this.longitud)
              ],
              fitSelectedRoutes: true
            }).on('routesfound', (e) => {
              this.distanciaMetros = e.routes[0].summary.totalDistance;
              this.tiempoSegundos = e.routes[0].summary.totalTime;

              const costo = Math.floor(this.distanciaMetros / 200) * 200;
              const costoDolar = this.dolar > 0 ? (costo / this.dolar).toFixed(2) : '0';

              this.viaje.patchValue({
                distancia_metros: this.distanciaMetros.toString(),
                tiempo_segundos: this.tiempoSegundos.toString(),
                costo: costo.toString(),
                costo_dolar: costoDolar
              });
            }).addTo(this.map);
          }
        });
      }
    }, 2000);
  }

  async createViaje() {
    // Validar si el conductor ya tiene un viaje activo
    const usuarioConductor = localStorage.getItem('usuario');
    if (usuarioConductor) {
      const usuario = JSON.parse(usuarioConductor);
      const viajesActivos = await firstValueFrom(
        this.fireService.getViajes()
      );
      const tieneViajeActivo = viajesActivos.some(
        viaje =>
          viaje.estudiante_conductor === usuario.rut &&
          (viaje.estado_viaje === 'Pendiente' || viaje.estado_viaje === 'En progreso')
      );

      if (tieneViajeActivo) {
        await this.mostrarAlerta(
          'Lo sentimos',
          'Ya tienes un viaje activo. Debes finalizar o eliminar el viaje actual antes de crear uno nuevo'
        );
        return;
      }
    }

    // Validar si se ha seleccionado un destino
    if (!this.viaje.value.latitud || !this.viaje.value.longitud) {
      await this.mostrarAlerta(
        'Error',
        'Debes seleccionar un destino en el mapa antes de crear el viaje'
      );
      return;
    }

    this.viaje.get('patente')?.enable();

    try {
      await this.fireService.createViaje(this.viaje.value);
      await this.mostrarAlerta('Felicidades', 'El viaje ha sido creado exitosamente.');
      this.viaje.get('patente')?.disable();
      this.router.navigate(['/home/viaje']);
    } catch (error) {
      console.error('Error al crear el viaje:', error);
      await this.mostrarAlerta(
        'Error',
        'Ocurrió un problema al crear el viaje. Por favor, inténtalo de nuevo'
      );
    }
  }

  dolarAPI() {
    this.apiService.getDolar().subscribe((data: any) => {
      this.dolar = data.dolar.valor;
    });
  }

  async mostrarAlerta(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['Aceptar']
    });
    await alert.present();
  }
}
