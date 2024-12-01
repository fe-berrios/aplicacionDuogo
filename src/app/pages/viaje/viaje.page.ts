import { Component, OnInit } from '@angular/core';
import { ViajeService } from 'src/app/services/viaje.service';
import { AlertController } from '@ionic/angular'; // Importar AlertController

// Import para leaflet
import * as leaflet from 'leaflet';
import * as geo from 'leaflet-control-geocoder';
import 'leaflet-routing-machine';
import { Router } from '@angular/router';
import { FireService } from 'src/app/services/fire.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-viaje',
  templateUrl: './viaje.page.html',
  styleUrls: ['./viaje.page.scss'],
})
export class ViajePage implements OnInit {

  viajes: any[] = [];
  tipoUsuario: string = '';
  usuario: any;
  tieneViaje: boolean = false; // Nueva variable para verificar si ya está en un viaje
  isMapLoading: boolean = true;

  // Leaflet (mapa)
  private map: leaflet.Map | undefined;
  private geocoder: geo.Geocoder | undefined;
  private currentRouteControl: any;

  // Variables que rescatan informacion del mapa
  latitud: number = 0;
  longitud: number = 0;
  direccion: string = "";
  distanciaMetros: number = 0;
  tiempoSegundos: number = 0;

  // Viajes
  viajesAsignados: any[] = [];
  viajesDisponibles: any[] = [];

  constructor(private viajeService: ViajeService, private router: Router, private fireService: FireService, private alertController: AlertController) {}

  ngOnInit() {
    this.getTipoUsuario();
    this.initMapa();
    this.getViajes();
  }


  initMapa() {
    setTimeout(() => {
          // 'locate' Ubicación actual utiliza TÚ ubicación de dispositivo.
    this.map = leaflet.map('map_lista').setView([-33.59838016321339, -70.57879780298838], 16);
    leaflet.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>'
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
        }).addTo(this.map);
      }
    });
    
    }, 2000);
  }


  verRuta(viaje: any) {
    const origen = leaflet.latLng(-33.59838016321339, -70.57879780298838);
    const destino = leaflet.latLng(viaje.latitud, viaje.longitud);

    if (this.map) {
      // Remover la ruta actual si existe antes de agregar una nueva
      if (this.currentRouteControl) {
        this.map.removeControl(this.currentRouteControl);
      }

      // Crear nueva ruta en el mapa
      this.currentRouteControl = leaflet.Routing.control({
        waypoints: [origen, destino],
        fitSelectedRoutes: true
      }).on('routesfound', (e) => {
        this.distanciaMetros = e.routes[0].summary.totalDistance;
        this.tiempoSegundos = e.routes[0].summary.totalTime;
      }).addTo(this.map);
    }
  }

  esPasajero(viaje: any): boolean {
    return viaje.pasajeros && viaje.pasajeros.includes(this.usuario.rut);
  }

  async mostrarAlerta(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['Aceptar']
    });
    await alert.present();
  }
  
  unirme(viaje: any) {
    const rutUsuario = this.usuario.rut;
  
    // Filtrar viajes donde el usuario está asociado
    const viajesAsociados = this.viajes.filter(
      v =>
        v.estudiante_conductor === rutUsuario || (v.pasajeros && v.pasajeros.includes(rutUsuario))
    );
  
    // Verificar si hay algún viaje en estado 'Pendiente' o 'En progreso'
    const tieneViajeActivo = viajesAsociados.some(
      v => v.estado_viaje === 'Pendiente' || v.estado_viaje === 'En progreso'
    );
  
    if (tieneViajeActivo) {
      this.mostrarAlerta('Error', 'No puedes unirte a este viaje porque ya estás asociado a un viaje activo');
      return;
    }
  
    // Si no hay viajes activos, unirse al viaje
    if (!viaje.pasajeros) {
      viaje.pasajeros = [];
    }
  
    viaje.pasajeros.push(rutUsuario);
    viaje.asientos_disponibles -= 1;
  
    this.fireService.updateViaje(viaje).then(() => {
      this.mostrarAlerta('¡Viaje unido!', 'Te has unido al viaje exitosamente');
      this.getViajes();
      this.router.navigate(['/home/mapa']);
    }).catch(() => {
      this.mostrarAlerta('Error', 'Hubo un problema al unirte al viaje');
    });
  }

  async abandonar(viaje: any) {
    const alert = await this.alertController.create({
      header: 'Confirmación',
      message: '¿Estás seguro de que deseas abandonar este viaje?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Sí',
          handler: () => {
            const rutUsuario = this.usuario.rut;
            const index = viaje.pasajeros.indexOf(rutUsuario);
  
            if (index > -1) {
              viaje.pasajeros.splice(index, 1);
              viaje.asientos_disponibles += 1;
  
              this.fireService.updateViaje(viaje).then(() => {
                this.mostrarAlerta('¡Viaje abandonado!', 'Has abandonado el viaje exitosamente :D');
                this.getViajes();
              }).catch(() => {
                this.mostrarAlerta('Error', 'Hubo un problema al abandonar el viaje');
              });
            } else {
              this.mostrarAlerta('Error', 'No estás asociado a este viaje');
            }
          },
        },
      ],
    });
  
    await alert.present();
  }
  

  modificarViaje(viaje: any) {
    this.router.navigate(['/modificar-viaje'], { queryParams: { id: viaje.id } });
  }

  async cancelarViaje(viaje: any) {
    const alert = await this.alertController.create({
      header: 'Confirmación',
      message: '¿Estás seguro de que deseas cancelar este viaje?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
        },
        {
          text: 'Sí',
          handler: async () => {
            await this.fireService.deleteViaje(viaje.id);
            this.mostrarAlerta('Viaje cancelado', 'El viaje ha sido cancelado exitosamente');
            this.getViajes();
          },
        },
      ],
    });
    await alert.present();
  }

  async getViajes() {
    try {
      this.viajes = await firstValueFrom(this.fireService.getViajes()); // Obtener viajes desde Firebase
      const rutUsuario = this.usuario.rut;
  
      // Clasificar viajes
      this.viajesAsignados = this.viajes.filter(
        (viaje) =>
          (viaje.estudiante_conductor === rutUsuario || 
           (viaje.pasajeros && viaje.pasajeros.includes(rutUsuario))) &&
          viaje.estado_viaje === 'Pendiente'
      );
  
      this.viajesDisponibles = this.viajes.filter(
        (viaje) =>
          viaje.estado_viaje === 'Pendiente' &&
          viaje.estudiante_conductor !== rutUsuario &&
          (!viaje.pasajeros || !viaje.pasajeros.includes(rutUsuario))
      );
  
      // Agregar información del conductor a cada viaje
      await this.cargarImagenesConductores(this.viajes);
  
      console.log('Viajes Asignados:', this.viajesAsignados);
      console.log('Viajes Disponibles:', this.viajesDisponibles);
  
      this.tieneViaje = this.viajesAsignados.length > 0;
    } catch (error) {
      console.error('Error al obtener viajes:', error);
    }
  }

  async cargarImagenesConductores(viajes: any[]) {
    for (const viaje of viajes) {
      if (viaje.estudiante_conductor) {
        const conductor = await firstValueFrom(this.fireService.getUsuario(viaje.estudiante_conductor));
        
        if (conductor && typeof conductor === 'object' && 'imagen_api' in conductor) {
          viaje.imagen_conductor = conductor['imagen_api'];
        } else {
          viaje.imagen_conductor = 'assets/default-avatar.png'; // Imagen predeterminada
        }
      }
    }
  }

  getTipoUsuario() {
    this.usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.tipoUsuario = this.usuario.tipo_usuario || ''; // Asegúrate de que no quede undefined
    console.log('Tipo de Usuario:', this.tipoUsuario);  // Log para verificar el valor
  }
  esConductor(viaje: any): boolean {
    return viaje.estudiante_conductor === this.usuario.rut;
  }

}
