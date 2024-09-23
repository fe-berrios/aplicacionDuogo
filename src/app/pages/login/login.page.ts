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
  authUsuario(rut: string, password: string) {
    if (!rut || !password) {
      alert("RUT y contraseña son requeridos.");
      return;
    }
    // Se crea constante usuario, que rescata el usuario.
    // Si el usuario existe, entonces preguntamos:
    // Si usuario.contrasena, es igual a la rescatada entonces 'LogIn!'
    const usuario = this.usuarioService.getUsuario(rut);
    if (usuario) {
      if (usuario.contrasena === password) {
        // Se guarda la sesion del 'usuario'
        sessionStorage.setItem('usuario', JSON.stringify(usuario));
        console.log("Log in");
        this.router.navigate(['/home']);
        // De lo contrario:
      } else {
        alert("Error! RUT o Contraseña son incorrectos.");
      }
      // Cualquier otro error:
    } else {
      alert("Error! Usuario no se pudo autentificar.");
    }
  }
  
}
