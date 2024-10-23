import { Component, OnInit } from '@angular/core';
import { ViajeService } from 'src/app/services/viaje.service';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
})
export class HistorialPage implements OnInit {

  viajes: any[] = [];
  rutUsuario: string = '';

  constructor(private viajeService: ViajeService) { }

  ngOnInit() {
    this.getUsuario();
    this.getViajesUsuario();
  }

  // Rescatar usuario desde localStorage
  getUsuario() {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.rutUsuario = usuario.rut; // Rescatamos el RUT del usuario logueado
  }

  // Obtener los viajes donde el usuario es parte (como conductor o pasajero)
  async getViajesUsuario() {
    const todosLosViajes = await this.viajeService.getViajes();
    
    // Filtrar los viajes donde el usuario es el conductor o pasajero
    this.viajes = todosLosViajes.filter(viaje => 
      viaje.estudiante_conductor === this.rutUsuario || (viaje.pasajeros && viaje.pasajeros.includes(this.rutUsuario))
    );
  }
}
