import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UsuarioService } from 'src/app/services/usuario.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  rut: string = '';
  contrasena: string = '';

  constructor(private usuarioService: UsuarioService, private router: Router) { }

  ngOnInit() {
  }

  // Método autentificar (rut, contraseña) -> Se rescatan del html.
  // Se pregunta si rut o contraseña faltan entonces
  // console.log("Se requieren ambos.")
  async authUsuario() {
    if(await this.usuarioService.authUsuario(this.rut, this.contrasena)){
      this.router.navigate(['/home']);
    } else {
      console.log("woops")
    }
  }
  
}
