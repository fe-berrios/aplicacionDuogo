import { Component } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  usuario: any = null;

  constructor(private router: Router) {}

  ngOnInit() {}

  usuarioTipo(): boolean {
    const usuarioSesion = sessionStorage.getItem('usuario');
    if (usuarioSesion) {
      const usuario = JSON.parse(usuarioSesion);
      return usuario.tipo_usuario === 'administrador';
    }
    return false;
  }
}
