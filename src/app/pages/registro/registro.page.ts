import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { UsuarioService } from 'src/app/services/usuario.service';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage implements OnInit {

  usuarios: any[] = [];

  usuario = new FormGroup({
    rut: new FormControl('', [
      Validators.pattern("[0-9]{7,8}-[0-9kK]{1}"),
      Validators.required
    ]),
    nombre: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.pattern("^[a-zA-Z]+$") // Solo letras
    ]),
    apellido: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.pattern("^[a-zA-Z]+$") // Solo letras
    ]),
    genero: new FormControl('', [Validators.required]),
    correo: new FormControl('', [
      Validators.pattern("^[a-zA-Z0-9._%+-]+@duocuc\\.cl$"),
      Validators.required
    ]),
    telefono: new FormControl('', [
      Validators.required,
      Validators.pattern("^[0-9]{9}$") // 9 dígitos
    ]),
    contrasena: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
    ]),
    contrasena_confirmar: new FormControl('', [
      Validators.required,
      RegistroPage.validarContrasenas // Llamada estática
    ]),
    tipo_usuario: new FormControl('estudiante', [Validators.required]), // Valor por defecto
    nombre_auto: new FormControl(''),
    capacidad_auto: new FormControl(''),
    esConductor: new FormControl(false) // Control para el checkbox
  });

  constructor(private usuarioService: UsuarioService, private router: Router, private alertController: AlertController) { }

  ngOnInit() {
    this.usuarios = this.usuarioService.getUsuarios();

    // Escuchar cambios en el checkbox 'esConductor' para ajustar las validaciones
    this.usuario.get('esConductor')?.valueChanges.subscribe(isConductor => {
      if (isConductor) {
        this.usuario.get('nombre_auto')?.setValidators([Validators.required, Validators.minLength(2)]);
        this.usuario.get('capacidad_auto')?.setValidators([Validators.required, Validators.min(2), Validators.max(8), Validators.pattern("^[0-9]*$")]);
        this.usuario.get('tipo_usuario')?.setValue('estudiante_conductor');
      } else {
        this.usuario.get('nombre_auto')?.clearValidators();
        this.usuario.get('capacidad_auto')?.clearValidators();
        this.usuario.get('tipo_usuario')?.setValue('estudiante');
      }
      this.usuario.get('nombre_auto')?.updateValueAndValidity();
      this.usuario.get('capacidad_auto')?.updateValueAndValidity();
    });
  }

  public async registroUsuario(): Promise<void> {
    if (this.usuarioService.createUsuario(this.usuario.value)) {
      console.log("Usuario creado con éxito!");
      console.log(JSON.stringify(this.usuario.value)); // Imprime el usuario en formato JSON

      // Mostrar alerta
      await this.mostrarAlerta('Gracias por registrarse en DuoGO!', '¡¡Sus datos han sido ingresados con éxito!!');
      
      // Navegar a la página de login
      this.router.navigate(['/login']);
    } else {
      console.log("Error! No se pudo crear el usuario.");
      await this.mostrarAlerta('Error', 'No se pudo registrar el usuario. Intente nuevamente.');
    }
  }

  // Función para mostrar la alerta
  async mostrarAlerta(titulo: string, mensaje: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
  }

  // Función para manejar el cambio del checkbox
  onCheckboxChange(isChecked: boolean) {
    this.usuario.controls.esConductor.setValue(isChecked);
  }

  handleChange(ev: CustomEvent) {
    console.log('Género seleccionado:', ev.detail.value);
  }

  static validarContrasenas(control: FormControl): { [key: string]: boolean } | null {
    const contrasena = control.parent?.get('contrasena')?.value;
    return control.value === contrasena ? null : { noCoinciden: true };
  }
}
