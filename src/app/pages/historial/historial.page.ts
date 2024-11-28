import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { FireService } from 'src/app/services/fire.service';
import { ViajeService } from 'src/app/services/viaje.service';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
})
export class HistorialPage implements OnInit {
  viajesConductor: any[] = []; // Viajes donde el usuario fue conductor
  viajesPasajero: any[] = []; // Viajes donde el usuario fue pasajero
  rutUsuario: string = '';
  model: string = 'conductor';

  constructor(private fireService: FireService) {}

  ngOnInit() {
    this.getUsuario();
    this.getViajesUsuario();
  }

  // Rescatar usuario desde localStorage
  getUsuario() {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.rutUsuario = usuario.rut; // Rescatamos el RUT del usuario logueado
  }

  // Obtener los viajes finalizados donde el usuario participó
  async getViajesUsuario() {
    const todosLosViajes = await firstValueFrom(this.fireService.getViajes());
  
    // Filtrar viajes finalizados
    const viajesFinalizados = todosLosViajes.filter(viaje => viaje.estado_viaje === 'Finalizado');
  
    // Clasificar los viajes finalizados según si fue conductor o pasajero
    this.viajesConductor = viajesFinalizados.filter(
      viaje => viaje.estudiante_conductor === this.rutUsuario
    );
  
    this.viajesPasajero = viajesFinalizados.filter(
      viaje => viaje.pasajeros && viaje.pasajeros.includes(this.rutUsuario)
    );
  
    // Cargar imágenes para los conductores de los viajes
    await this.cargarImagenesConductores(this.viajesConductor);
    await this.cargarImagenesConductores(this.viajesPasajero);
  }
  
  // Función para cargar imágenes de los conductores
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
}