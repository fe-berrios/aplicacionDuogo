import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ViajeService } from 'src/app/services/viaje.service';

// Import para leaflet
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

  // Variables que rescatan informacion del mapa
  latitud: number = 0;
  longitud: number = 0;
  direccion: string = "";
  distanciaMetros: number = 0;
  tiempoSegundos: number = 0;

  viaje = new FormGroup({
    id: new FormControl('', [Validators.required]),
    estudiante_conductor: new FormControl('', [Validators.required]),
    asientos_disponibles: new FormControl('', [Validators.required]),
    nombre_destino: new FormControl('', [Validators.required]),
    latitud: new FormControl('', [Validators.required]),
    longitud: new FormControl('', [Validators.required]),
    distancia_metros: new FormControl('', [Validators.required]),
    tiempo_segundos: new FormControl('', [Validators.required]),
    forma_pago: new FormControl('', [Validators.required]),
    estado_viaje: new FormControl('', [Validators.required]),
    pasajeros: new FormControl('', [Validators.required])
  })

  constructor(private router: Router,private viajeService: ViajeService) { }

  ngOnInit() {
    this.initMapa();
  }

  initMapa(){
    // 'locate' Ubicación actual utiliza TÚ ubicación de dispositivo.
    this.map = leaflet.map('map_create').setView([-33.59838016321339, -70.57879780298838],16);
    //this.map = leaflet.map("map_html").setView([-33.608552227594245, -70.58039819211703],16);
    // Plantilla para que el mapa sea visible
    leaflet.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      // Se debe agregar el 'addTo' para vincular el mapa con la variable mapa
    }).addTo(this.map);

    // Agregar buscador de direcciones en el mapa
    this.geocoder = geo.geocoder({
      // '?' Son caracteristicas del buscador
      placeholder: "Ingrese dirección a buscar",
      errorMessage: "Dirección NO encontrada"
      // Se debe agregar el 'addTo(this.map)' para vincular el buscador con el mapa
    }).addTo(this.map);

    // Cuando el mapa se cargue y logre encontrar mi direccion actual
    this.map.on('locationfound', (e) => {
      // Rescata la latitud y longitud de mi ubicación
      console.log(e.latlng.lat);
      console.log(e.latlng.lng);
    })

    // Vamos a realizar una acción con el buscador
    // () significa que es una función
    // => Agrega las variables que se encuentran afuera de su "método"
    this.geocoder.on('markgeocode', (e) => {
      // Aquí se llenan las variables anteriormente creadas con la informacion del buscador
      // Para visualizar las propiedades de la dirección del buscador
      console.log(e.geocode.properties)
      this.latitud = e.geocode.properties['lat'];
      this.longitud = e.geocode.properties['lon'];
      this.direccion = e.geocode.properties['display_name'];

      if (this.map){
        leaflet.Routing.control({
          // waypoints pide leaflet.latLng()
          // -33, -70 (lat, long de DuocUC Puente Alto)
          waypoints: [leaflet.latLng(-33.59838016321339, -70.57879780298838), leaflet.latLng(this.latitud, this.longitud)],
          fitSelectedRoutes: true
          // Cuando encuentre la ruta sucederá una acción (e)
        }).on('routesfound', (e)=>{
          // El evento (e) tiene una propiedad routes [] y en su primera posicion 0, tiene una propiedad summary con totalDistance/totalTime
          this.distanciaMetros = e.routes[0].summary.totalDistance;
          this.tiempoSegundos = e.routes[0].summary.totalTime;
        }).addTo(this.map);
      }
    })
  }

  async createViaje(){
    if (await this.viajeService.createViaje(this.viaje.value)){
      console.log("Viaje creado con éxito!")
      console.log(JSON.stringify(this.viaje.value));
      
      this.router.navigate(['/home/viaje'])

    } else {
      console.log("Error! No se pudo crear el usuario");
    }
  }

}
