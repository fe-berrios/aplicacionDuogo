import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UsuarioService } from 'src/app/services/usuario.service';

@Component({
  selector: 'app-olvido',
  templateUrl: './olvido.page.html',
  styleUrls: ['./olvido.page.scss'],
})
export class OlvidoPage {
  mensaje: string = '';

  constructor(private router: Router, private usuarioService: UsuarioService) {}

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
}
