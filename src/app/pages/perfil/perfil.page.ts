import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {

  usuario: any = null;

  constructor() { }

  ngOnInit() {
    // Se recupera el usuario guardado en la sesión.
    const usuarioSesion = sessionStorage.getItem('usuario');
    if (usuarioSesion) {
      this.usuario = JSON.parse(usuarioSesion);
    }
  }

}
