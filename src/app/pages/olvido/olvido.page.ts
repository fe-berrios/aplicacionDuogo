import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { FireService } from 'src/app/services/fire.service';
import { UsuarioService } from 'src/app/services/usuario.service';

@Component({
  selector: 'app-olvido',
  templateUrl: './olvido.page.html',
  styleUrls: ['./olvido.page.scss'],
})
export class OlvidoPage {
  mensaje: string = '';
  email: string = '';
  mensajeColor: string = 'danger';

  constructor(private router: Router, 
              private usuarioService: UsuarioService,
              private fireService: FireService,
              private fireAuth: AngularFireAuth,
              private alertController: AlertController) {}

  // Función para validar si el correo existe
  async validarCorreo(correo: any) {
    // Aseguramos que correo sea una cadena o null
    const correoStr = correo ? String(correo) : null;
    
    if (!correoStr) {
      this.mensaje = 'Por favor, ingrese un correo válido.';
      return;
    }
    
    try {
      const usuario = await this.usuarioService.recoverUsuario(correoStr);
      if (usuario) {
        // Guardamos el usuario en localStorage para usarlo en la página de recuperación
        localStorage.setItem('usuarioRecuperado', JSON.stringify(usuario));
        
        // Si el correo existe, redirigimos a la página de recuperación
        this.router.navigate(['/recuperar']);
      } else {
        // Si no existe, mostramos un mensaje de error
        this.mensaje = 'El correo ingresado no está registrado.';
      }
    } catch (error) {
      console.error('Error al recuperar el usuario:', error);
      this.mensaje = 'Hubo un error al procesar la solicitud.';
    }
  }

  async recuperarContrasena(email: string) {
    if (!email || !email.includes('@')) {
      this.mensaje = 'Por favor, ingrese un correo válido.';
      this.mensajeColor = 'danger';
      return;
    }

    try {
      await this.fireAuth.sendPasswordResetEmail(email);
      this.mensaje = 'Se ha enviado un correo para restablecer tu contraseña.';
      this.mensajeColor = 'success';

      // Opcional: Mostrar alerta adicional
      const alert = await this.alertController.create({
        header: 'Correo enviado',
        message: 'Revisa tu bandeja de entrada para restablecer tu contraseña.',
        buttons: ['OK'],
      });
      await alert.present();
    } catch (error: any) {
      // Manejo de errores de Firebase
      this.mensaje = this.obtenerMensajeError(error.code);
      this.mensajeColor = 'danger';
    }
  }

  private obtenerMensajeError(codigo: string): string {
    switch (codigo) {
      case 'auth/user-not-found':
        return 'No existe un usuario con este correo.';
      case 'auth/invalid-email':
        return 'El correo ingresado no es válido.';
      default:
        return 'Ocurrió un error inesperado. Intenta nuevamente.';
    }
  }
}
