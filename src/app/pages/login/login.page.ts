import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { FireService } from 'src/app/services/fire.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { getAuth, signInWithEmailAndPassword, user } from '@angular/fire/auth';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  //alertButtons= ['Action'];
  correo: string = '';
  contrasena: string = '';

  constructor(private usuarioService: UsuarioService, 
              private router: Router, 
              private alertController: AlertController,
              private fireService: FireService,
              private fireAuth: AngularFireAuth) { }

  ngOnInit() {
  }

  async login() {
    const auth = getAuth();
    signInWithEmailAndPassword(auth, this.correo, this.contrasena).then((userCredential) => {
      // Autenticación exitosa
      const user = userCredential.user;
      const uid = user.uid; // Obtener el UID del usuario
      console.log('Usuario autenticado con UID:', uid);

      // Usar el servicio FireService para obtener los datos del usuario
      this.fireService.getUsuarioUid(uid).then((userData) => {
          if (userData) {
            console.log('Datos del usuario:', userData);

            // Guardar el objeto del usuario en el localStorage
            localStorage.setItem('usuario', JSON.stringify(userData));

            // Redirigir al usuario a la página principal
            this.router.navigate(['/home']);
          } else {
            console.error('El documento del usuario no existe en la base de datos.');
            
          }
        }).catch((error) => {
          console.error('Error al obtener los datos del usuario:', error); 
        });
      }).catch((error) => {
        console.error('Error durante el inicio de sesión:', error);
        console.error('Código de error:', error.code);
        console.error('Mensaje del error:', error.message);
      });
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
