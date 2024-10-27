import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ViajeService } from 'src/app/services/viaje.service';
import * as leaflet from 'leaflet';
import * as geo from 'leaflet-control-geocoder';
import 'leaflet-routing-machine';

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

  constructor(private router: Router, private viajeService: ViajeService) { }

  ngOnInit() {
    this.initMapa();

    const usuarioConductor = localStorage.getItem('usuario');

    if (usuarioConductor) {
      const usuario = JSON.parse(usuarioConductor);

      // Se asigna la patente del usuario al viaje
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
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>'
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
              this.map.removeControl(this.currentRoute);  // Remueve la ruta anterior
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

  async createViaje() {
    // Validar si se ha seleccionado una ruta (latitud y longitud)
    if (!this.viaje.value.latitud || !this.viaje.value.longitud) {
      alert("Debes seleccionar un destino en el mapa antes de crear el viaje.");
      return;
    }
  
    const lastId = localStorage.getItem('lastViajeId');
    let newId = 1;
  
    if (lastId) {
      newId = parseInt(lastId) + 1;
    }
  
    // Habilitar temporalmente el campo 'patente' para incluirlo en el valor del formulario
    this.viaje.get('patente')?.enable();
  
    this.viaje.patchValue({
      id: newId.toString()
    });
  
    if (await this.viajeService.createViaje(this.viaje.value)) {
      console.log("Viaje creado con éxito!");
      localStorage.setItem('lastViajeId', newId.toString());
  
      // Deshabilitar nuevamente el campo 'patente' si lo deseas
      this.viaje.get('patente')?.disable();
  
      // Navegar a la página de viajes y refrescar la página
      this.router.navigate(['/home/viaje']).then(() => {
        window.location.reload();
      });
    } else {
      console.log("Error! No se pudo crear el viaje");
    }
  }  
}
