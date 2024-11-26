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

  viajes: any[] = [];
  rutUsuario: string = '';
  model: string = 'camry'; // Modelo por defecto
  cars: any[] = []; // Para almacenar los datos recibidos
  errorMessage: string = '';
  fabricantes: string[] = []; // Lista de fabricantes únicos

  constructor(private fireService: FireService,
              private apiService: ApiService
  ) { }

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
    const todosLosViajes = await firstValueFrom(this.fireService.getViajes());
    
    // Filtrar los viajes donde el usuario es el conductor o pasajero
    this.viajes = todosLosViajes.filter(viaje => 
      viaje.estudiante_conductor === this.rutUsuario || (viaje.pasajeros && viaje.pasajeros.includes(this.rutUsuario))
    );
  }

}
