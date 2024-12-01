import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular'; // Importar AlertController
import { firstValueFrom } from 'rxjs';
import { FireService } from 'src/app/services/fire.service';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
})
export class HistorialPage implements OnInit {
  viajes: any[] = [];
  viajesConductor: any[] = []; // Viajes donde el usuario fue conductor
  viajesPasajero: any[] = []; // Viajes donde el usuario fue pasajero
  rutUsuario: string = '';
  tipoUsuario: string = ''; // Tipo de usuario (conductor o pasajero)
  model: string = 'conductor'; // Estado inicial para tab "como conductor"

  constructor(
    private fireService: FireService,
    private alertController: AlertController // Inyección de AlertController
  ) {}

  ngOnInit() {
    this.getUsuario();
    this.getViajesUsuario();
  }

  // Rescatar usuario desde localStorage
  getUsuario() {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.rutUsuario = usuario.rut; // Rescatamos el RUT del usuario logueado
    this.tipoUsuario = usuario.tipo_usuario || ''; // Rescatamos el tipo de usuario
  }

  // Obtener los viajes finalizados donde el usuario participó
  async getViajesUsuario() {
    try {
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

      if (this.viajesConductor.length === 0 && this.viajesPasajero.length === 0) {
        await this.mostrarAlerta('Sin viajes', 'No tienes viajes finalizados como conductor o pasajero.');
      }
    } catch (error) {
      console.error('Error al obtener los viajes:', error);
      await this.mostrarAlerta('Error', 'Ocurrió un problema al cargar los viajes. Por favor, inténtalo nuevamente.');
    }
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

  // Mostrar mensajes al usuario
  async mostrarAlerta(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['Aceptar'],
    });
    await alert.present();
  }
}
