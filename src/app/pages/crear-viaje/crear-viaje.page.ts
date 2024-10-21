import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ViajeService } from 'src/app/services/viaje.service';

// Import para leaflet
import * as leaflet from 'leaflet';
import * as geo from 'leaflet-control-geocoder';
import 'leaflet-routing-machine';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-crear-viaje',
  templateUrl: './crear-viaje.page.html',
  styleUrls: ['./crear-viaje.page.scss'],
})
export class CrearViajePage implements OnInit {

  // Leaflet (mapa)
  private map: leaflet.Map | undefined;
  private geocoder: geo.Geocoder | undefined;

  // Variables que rescatan informacion del mapa
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
    pasajeros: new FormControl('')
  })

  constructor(private router: Router, private viajeService: ViajeService) { }

  ngOnInit() {
    this.initMapa();

    // Rescatamos el usuario al iniciar /crear-viaje
    const usuarioConductor = localStorage.getItem('usuario');

    if (usuarioConductor) {
      // Se parsea de JSON a string
      const usuario = JSON.parse(usuarioConductor);

      this.viaje.patchValue({
        // Se asigna el estudiante_conductor al viaje
        estudiante_conductor: usuario.rut,
        estado_viaje: 'Pendiente'
      })
    }
  }

  initMapa(){
    // 'locate' Ubicación actual utiliza TÚ ubicación de dispositivo.
    this.map = leaflet.map('map_create').setView([-33.59838016321339, -70.57879780298838], 16);
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

      // Convertir los valores numéricos a strings antes de pasarlos al formulario
      this.viaje.patchValue({
        latitud: this.latitud.toString(),
        longitud: this.longitud.toString(),
        nombre_destino: this.direccion
      });

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

          // Convertir los valores numéricos a strings antes de pasarlos al formulario
          this.viaje.patchValue({
            distancia_metros: this.distanciaMetros.toString(),
            tiempo_segundos: this.tiempoSegundos.toString()
          });
        }).addTo(this.map);
      }
    });
  }

  // El método createViaje debe estar fuera del initMapa()
  async createViaje() {
    // Leer el último id desde el localStorage o iniciar en 1 si no existe
    const lastId = localStorage.getItem('lastViajeId');
    let newId = 1;
  
    if (lastId) {
      // Incrementar el último id
      newId = parseInt(lastId) + 1;
    }
  
    // Asignar el nuevo id al formulario
    this.viaje.patchValue({
      id: newId.toString()  // Convertir a string si es necesario para el formControl
    });
  
    // Guardar el nuevo viaje utilizando el servicio
    if (await this.viajeService.createViaje(this.viaje.value)) {
      console.log("Viaje creado con éxito!");
      console.log(JSON.stringify(this.viaje.value));
  
      // Guardar el nuevo id en el localStorage para la próxima vez
      localStorage.setItem('lastViajeId', newId.toString());
  
      // Redirigir a otra página si es necesario
      this.router.navigate(['/home/viaje']);
    } else {
      console.log("Error! No se pudo crear el viaje");
    }
  }

}
