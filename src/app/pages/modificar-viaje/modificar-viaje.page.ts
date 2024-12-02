import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ViajeService } from 'src/app/services/viaje.service';
import * as leaflet from 'leaflet';
import * as geo from 'leaflet-control-geocoder';
import 'leaflet-routing-machine';
import { FireService } from 'src/app/services/fire.service';
import { firstValueFrom } from 'rxjs';
import { ApiService } from 'src/app/services/api.service'; // Asegúrate de importar ApiService
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-modificar-viaje',
  templateUrl: './modificar-viaje.page.html',
  styleUrls: ['./modificar-viaje.page.scss'],
})
export class ModificarViajePage implements OnInit {
  private map: leaflet.Map | undefined;
  private geocoder: geo.Geocoder | undefined;
  private currentRoute: any;
  viajeId: string | undefined;
  dolar: number = 0; // Variable para el valor del dólar

  // Variables que rescatan información del mapa
  latitud: number = 0;
  longitud: number = 0;
  direccion: string = '';
  distanciaMetros: number = 0;
  tiempoSegundos: number = 0;

  viaje = new FormGroup({
    id: new FormControl(''),
    estudiante_conductor: new FormControl(''),
    asientos_disponibles: new FormControl('', [Validators.required]),
    nombre_destino: new FormControl(''),
    latitud: new FormControl(''),
    longitud: new FormControl(''),
    distancia_metros: new FormControl(''),
    tiempo_segundos: new FormControl(''),
    forma_pago: new FormControl('', [Validators.required]),
    estado_viaje: new FormControl(''),
    hora_salida: new FormControl('', [
      Validators.required,
      Validators.pattern('^([01]?[0-9]|2[0-3]):[0-5][0-9]$')
    ]),
    pasajeros: new FormControl(''),
    costo: new FormControl('', [Validators.required, Validators.min(0)]),
    costo_dolar: new FormControl('', []),
    patente: new FormControl({ value: '', disabled: true }) // Patente no editable
  });

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private viajeService: ViajeService,
    private fireService: FireService,
    private apiService: ApiService, // Inyectamos ApiService
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.viajeId = params['id'] ? String(params['id']) : undefined;
      if (this.viajeId) {
        this.cargarViaje(this.viajeId.toString());
      }
    });
    this.initMapa();
    this.dolarAPI(); // Obtener el valor del dólar
  }

  async cargarViaje(id: string) {
    try {
      const viajeExistente: any = await firstValueFrom(this.fireService.getViaje(this.viajeId || ''));
      if (viajeExistente) {
        this.viaje.patchValue({
          id: viajeExistente.id,
          estudiante_conductor: viajeExistente.estudiante_conductor,
          asientos_disponibles: viajeExistente.asientos_disponibles,
          nombre_destino: viajeExistente.nombre_destino,
          latitud: viajeExistente.latitud,
          longitud: viajeExistente.longitud,
          distancia_metros: viajeExistente.distancia_metros,
          tiempo_segundos: viajeExistente.tiempo_segundos,
          forma_pago: viajeExistente.forma_pago,
          estado_viaje: viajeExistente.estado_viaje,
          hora_salida: viajeExistente.hora_salida,
          pasajeros: viajeExistente.pasajeros,
          costo: viajeExistente.costo,
          costo_dolar: viajeExistente.costo_dolar,
          patente: viajeExistente.patente
        });

        this.latitud = parseFloat(viajeExistente.latitud);
        this.longitud = parseFloat(viajeExistente.longitud);
        this.distanciaMetros = parseFloat(viajeExistente.distancia_metros);
        this.calcularCosto(); // Calculamos el costo al cargar el viaje
      } else {
        await this.mostrarAlerta('Error', 'No se encontró el viaje especificado');
        this.router.navigate(['/home/viaje']);
      }
    } catch (error) {
      console.error('Error al cargar el viaje:', error);
      await this.mostrarAlerta('Error', 'Ocurrió un problema al cargar los datos del viaje');
    }
  }

  initMapa() {
    setTimeout(() => {
      if (!this.map) {
        this.map = leaflet.map('map_modificar').setView([this.latitud || -33.59838016321339, this.longitud || -70.57879780298838], 16);

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
              this.map.removeControl(this.currentRoute);
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

              this.viaje.patchValue({
                distancia_metros: this.distanciaMetros.toString(),
                tiempo_segundos: this.tiempoSegundos.toString()
              });
              this.calcularCosto(); // Recalcular el costo cuando cambien los valores
            }).addTo(this.map);
          }
        });
      }
    }, 2000);
  }

  dolarAPI() {
    this.apiService.getDolar().subscribe((data: any) => {
      this.dolar = data.dolar.valor;
      this.calcularCosto(); // Recalcular el costo cuando se actualice el valor del dólar
    });
  }

  calcularCosto() {
    if (this.distanciaMetros > 0) {
      const costo = Math.floor(this.distanciaMetros / 200) * 200;
      const costoDolar = this.dolar > 0 ? (costo / this.dolar).toFixed(2) : '0';
      this.viaje.patchValue({
        costo: costo.toString(),
        costo_dolar: costoDolar
      });
    }
  }

  async modificarViaje() {
    if (!this.viajeId || !this.viaje.valid) {
        await this.mostrarAlerta('Formulario inválido', 'Por favor, completa todos los campos requeridos');
        return;
    }

    // Verificar si el viaje ya ha comenzado
    const estadoViaje = this.viaje.get('estado_viaje')?.value;
    if (estadoViaje === 'En progreso' || estadoViaje === 'Finalizado') {
        await this.mostrarAlerta(
            'Modificación no permitida',
            `No puedes modificar un viaje que está ${estadoViaje.toLowerCase()}.`
        );
        return;
    }

    const alert = await this.alertController.create({
        header: 'Confirmación',
        message: '¿Estás seguro de que deseas modificar este viaje?',
        buttons: [
            {
                text: 'Cancelar',
                role: 'cancel',
                handler: () => {
                    console.log('Modificación cancelada por el usuario');
                }
            },
            {
                text: 'Confirmar',
                handler: async () => {
                    try {
                        const resultado = await this.fireService.updateViaje(this.viaje.value);
                        if (resultado) {
                            await this.mostrarAlerta('Felicidades', 'Viaje modificado con éxito');
                            this.router.navigate(['/home/viaje']).then(() => {
                                window.location.reload();
                            });
                        } else {
                            await this.mostrarAlerta('Error', 'Hubo un problema al modificar el viaje');
                        }
                    } catch (error) {
                        console.error('Error al modificar el viaje:', error);
                        await this.mostrarAlerta('Error', 'Ocurrió un error inesperado al modificar el viaje');
                    }
                }
            }
        ]
    });

    await alert.present();
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
