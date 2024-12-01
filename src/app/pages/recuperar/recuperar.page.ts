import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UsuarioService } from 'src/app/services/usuario.service';

@Component({
  selector: 'app-recuperar',
  templateUrl: './recuperar.page.html',
  styleUrls: ['./recuperar.page.scss'],
})
export class RecuperarPage {
  nuevaContrasena: string = ''; // Campo para la nueva contraseña
  confirmarContrasena: string = ''; // Campo para confirmar la contraseña
  correoRecuperado: string = ''; // Correo del usuario que estamos recuperando
  mensaje: string = ''; // Mensaje de error o éxito

  constructor(private router: Router, private usuarioService: UsuarioService) {
    // Aquí puedes rescatar el correo desde localStorage si fue guardado en el proceso anterior
    const usuarioRecuperado = JSON.parse(localStorage.getItem('usuarioRecuperado') || '{}');
    this.correoRecuperado = usuarioRecuperado.correo || '';
  }

  async cambiarContrasena() {
    // Verificar que las contraseñas coincidan
    if (this.nuevaContrasena !== this.confirmarContrasena) {
      this.mensaje = 'Las contraseñas no coinciden';
      return;
    }

    // Verificar que haya un correo recuperado
    if (!this.correoRecuperado) {
      this.mensaje = 'No se ha encontrado un correo para la recuperación';
      return;
    }

    try {
      // Rescatamos el usuario con el correo
      const usuario = await this.usuarioService.recoverUsuario(this.correoRecuperado);

      if (usuario) {
        // Actualizamos la contraseña del usuario
        usuario.contrasena = this.nuevaContrasena;
        usuario.contrasena_confirmar = this.nuevaContrasena;

        // Guardamos los cambios
        await this.usuarioService.updateUsuario(usuario.rut, usuario);

        // Redirigimos al login y mostramos mensaje de éxito
        this.mensaje = '¡Contraseña cambiada con éxito! Redirigiendo al inicio de sesión...';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      } else {
        this.mensaje = 'No se encontró el usuario con el correo especificado';
      }
    } catch (error) {
      console.error('Error al cambiar la contraseña:', error);
      this.mensaje = 'Hubo un error al cambiar la contraseña';
    }
  }
}
