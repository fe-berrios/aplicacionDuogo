import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { UsuarioService } from 'src/app/services/usuario.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  //alertButtons= ['Action'];
  rut: string = '';
  contrasena: string = '';

  constructor(private usuarioService: UsuarioService, private router: Router, private alertController: AlertController) { }

  ngOnInit() {
  }

  async login() {
    if (!this.rut || !this.contrasena) {
      this.mostrarAlerta("Se requiere ambos campos");
      return;
    }
  
    // Llama al servicio de autenticación
    if (await this.usuarioService.authUsuario(this.rut, this.contrasena)) {
      this.router.navigate(['/home']);
    } else {
      this.mostrarAlerta("Rut o contraseña incorrectos!!");
    }
  }  

  async mostrarAlerta(mensaje: string){
    const alert = await this.alertController.create({
      header: 'Error de inicio de sesión',
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
  }
  
}
