import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UsuarioService } from 'src/app/services/usuario.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  usuario: any = null;

  constructor(private usuarioService: UsuarioService, private navController: NavController) {}

  // Usar ionViewDidEnter para inicializar el mapa después de que la vista esté cargada
  ngOnInit() {
    this.usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  }

  goToAdministrar() {
    this.navController.navigateForward('/administrar');
  }

}
