import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UsuarioService } from 'src/app/services/usuario.service';
import { NavController, AlertController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { FireService } from 'src/app/services/fire.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {
  isEditing: boolean = false;
  isFlipped = false;

  usuario = new FormGroup({
    rut: new FormControl({ value: '', disabled: true }, [
      Validators.pattern("[0-9]{7,8}-[0-9kK]{1}"),
      Validators.required
    ]),
    nombre: new FormControl({ value: '', disabled: true }, [
      Validators.required,
      Validators.minLength(3),
      Validators.pattern("^[a-zA-Z]+$")
    ]),
    apellido: new FormControl({ value: '', disabled: true }, [
      Validators.required,
      Validators.minLength(3),
      Validators.pattern("^[a-zA-Z]+$")
    ]),
    correo: new FormControl({ value: '', disabled: true }, [
      Validators.pattern("^[a-zA-Z0-9._%+-]+@duocuc\\.cl$"),
      Validators.required
    ]),
    telefono: new FormControl('', [
      Validators.required,
      Validators.pattern("^[0-9]{9}$")
    ]),
    tipo_usuario: new FormControl('estudiante', [Validators.required]),
    nombre_auto: new FormControl({ value: '', disabled: true }, [
      Validators.minLength(5),
      Validators.required
    ]),
    capacidad_auto: new FormControl({ value: '', disabled: true }, [
      Validators.min(2),
      Validators.max(8),
      Validators.required,
      Validators.pattern("^[0-9]*$")
    ]),
    patente: new FormControl('', []),
    imagen_api: new FormControl('', [])
  });

  constructor(
    private navController: NavController,
    private usuarioService: UsuarioService,
    private apiService: ApiService,
    private fireService: FireService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    const usuarioSesion = localStorage.getItem('usuario');
    if (usuarioSesion) {
      this.usuario.patchValue(JSON.parse(usuarioSesion));
      this.usuario.get('tipo_usuario')?.valueChanges.subscribe((value: string | null) => {
        this.toggleAutoFields(value || 'estudiante');
      });
    }
  }

  toggleEdit() {
    this.isEditing = true;
  }

  cancelEdit() {
    this.isEditing = false;
    this.ngOnInit();
  }

  toggleFlip(): void {
    this.isFlipped = !this.isFlipped;
  }

  dataQR(): string {
    const nombre = this.usuario.get('nombre')?.value ?? '';
    const apellido = this.usuario.get('apellido')?.value ?? '';
    const rut = this.usuario.get('rut')?.value ?? '';
    const correo = this.usuario.get('correo')?.value ?? '';

    return `${nombre}, ${apellido}, ${rut}, ${correo}`;
  }

  formatTipoUsuario(tipoUsuario: string | null): string {
    if (!tipoUsuario) return '';

    return tipoUsuario.replace('_', ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  async guardarCambios() {
    if (this.usuario.valid) {
      const alert = await this.alertController.create({
        header: 'Confirmación',
        message: '¿Estás seguro de que deseas guardar los cambios en tu perfil?',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
          },
          {
            text: 'Guardar',
            handler: async () => {
              const usuarioActualizado = { ...this.usuario.getRawValue() };
              const rutUsuario = usuarioActualizado.rut ?? '';

              if (!rutUsuario) {
                this.mostrarAlerta('Error', 'El RUT no es válido');
                return;
              }

              try {
                const docRef = this.fireService.getUsuario(rutUsuario);
                const usuarioExistente = await firstValueFrom(docRef);

                if (!usuarioExistente) {
                  this.mostrarAlerta('Error', 'El usuario no existe en la base de datos');
                  return;
                }

                await this.fireService.updateUsuario(usuarioActualizado);
                localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
                this.mostrarAlerta('Éxito', 'Perfil actualizado con éxito!');
                this.isEditing = false;
              } catch (error) {
                this.mostrarAlerta('Error', 'Hubo un problema al actualizar tu perfil');
              }
            },
          },
        ],
      });

      await alert.present();
    } else {
      this.mostrarAlerta('Formulario inválido', 'Por favor, revisa los datos antes de guardar');
    }
  }

  async mostrarAlerta(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['Aceptar']
    });
    await alert.present();
  }

  toggleAutoFields(tipoUsuario: string) {
    if (tipoUsuario === 'estudiante_conductor') {
      this.usuario.get('nombre_auto')?.enable();
      this.usuario.get('capacidad_auto')?.enable();
    } else {
      this.usuario.get('nombre_auto')?.disable();
      this.usuario.get('capacidad_auto')?.disable();
    }
  }

  async logout() {
    const alert = await this.alertController.create({
      header: 'Cerrar sesión',
      message: '¿Estás seguro de que deseas cerrar sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Cerrar sesión',
          handler: () => {
            localStorage.removeItem('usuario');
            this.navController.navigateRoot('/login');
          },
        },
      ],
    });

    await alert.present();
  }
}
