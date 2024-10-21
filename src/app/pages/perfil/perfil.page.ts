import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UsuarioService } from 'src/app/services/usuario.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {
  usuario: any; // Declaramos la propiedad 'usuario'

  constructor() { }

  ngOnInit() {
    const usuarioSesion = localStorage.getItem('usuario');

    if (usuarioSesion) {
      this.usuario = JSON.parse(usuarioSesion); // Guardamos los datos en la propiedad 'usuario'
    }
  }
}
