import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ViajeService } from 'src/app/services/viaje.service';
import * as leaflet from 'leaflet';
import * as geo from 'leaflet-control-geocoder';
import 'leaflet-routing-machine';

@Component({
  selector: 'app-modificar-viaje',
  templateUrl: './modificar-viaje.page.html',
  styleUrls: ['./modificar-viaje.page.scss'],
})
export class ModificarViajePage implements OnInit {
  private map: leaflet.Map | undefined;
  private geocoder: geo.Geocoder | undefined;
  private currentRoute: any;
  viajeId: number | undefined;

  // Variables que rescatan información del mapa
  latitud: number = 0;
  longitud: number = 0;
  direccion: string = "";
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
    patente: new FormControl({value: '', disabled: true}) // Patente no editable
  });

  constructor(
    private router: Router, 
    private route: ActivatedRoute, 
    private viajeService: ViajeService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.viajeId = params['id'] ? +params['id'] : undefined;
      if (this.viajeId) {
        this.cargarViaje(this.viajeId);
      }
    });
    this.initMapa();
  }

  // Cargar los datos del viaje existente para modificarlos
  async cargarViaje(id: number) {
    const viajeExistente = await this.viajeService.getViaje(id);
    if (viajeExistente) {
      // Habilitar temporalmente el campo 'patente' para que el valor pueda ser asignado
      this.viaje.get('patente')?.enable();
  
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
        patente: viajeExistente.patente // Aquí cargamos la patente
      });
  
      // Deshabilitar nuevamente el campo 'patente' después de asignar el valor
      this.viaje.get('patente')?.disable();
  
      this.latitud = parseFloat(viajeExistente.latitud);
      this.longitud = parseFloat(viajeExistente.longitud);
      this.direccion = viajeExistente.nombre_destino;
    }
  }
  

  initMapa() {
    setTimeout(() => {
      if (!this.map) {
        this.map = leaflet.map('map_modificar').setView([this.latitud || -33.59838016321339, this.longitud || -70.57879780298838], 16);
  
        leaflet.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(this.map);
  
        this.geocoder = geo.geocoder({
          placeholder: "Ingrese dirección a buscar",
          errorMessage: "Dirección NO encontrada"
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
              this.map.removeControl(this.currentRoute);  // Remover la ruta anterior
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
            }).addTo(this.map);
          }
        });
      }
    }, 2000);
  }

  // Método para modificar un viaje existente
  async modificarViaje() {
    if (this.viajeId && this.viaje.valid) {
      const resultado = await this.viajeService.updateViaje(this.viajeId, this.viaje.value);
      if (resultado) {
        console.log('Viaje modificado con éxito');
      // Navegar a la página de viajes y refrescar la página
      this.router.navigate(['/home/viaje']).then(() => {
        window.location.reload();
      });
      } else {
        console.log('Error al modificar el viaje');
      }
    }
  }
}
