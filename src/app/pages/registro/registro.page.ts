import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { FireService } from 'src/app/services/fire.service';
import { UsuarioService } from 'src/app/services/usuario.service';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage implements OnInit {
  usuarios: any[] = [];
  perfilGato: string = '';

  usuario = new FormGroup({
    rut: new FormControl('', [
      Validators.required,
      Validators.pattern("[0-9]{7,8}-[0-9kK]{1}"),
      this.validarRut()
    ]),
    nombre: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.pattern("^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+( [a-zA-ZáéíóúÁÉÍÓÚñÑ]+)*$")
    ]),
    apellido: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.pattern("^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+( [a-zA-ZáéíóúÁÉÍÓÚñÑ]+)*$")
    ]),
    genero: new FormControl('', [Validators.required]),
    correo: new FormControl('', [
      Validators.pattern("^[a-zA-Z0-9._%+-]+@duocuc\\.cl$"),
      Validators.required
    ]),
    telefono: new FormControl('', [
      Validators.required,
      Validators.pattern("^[0-9]{9}$")
    ]),
    contrasena: new FormControl('', [
      Validators.required,
      Validators.pattern("^(?=.*[-!#$%&/()?¡_.])(?=.*[A-Za-z])(?=.*[A-Z]).{8,}$")
    ]),
    contrasena_confirmar: new FormControl('', [
      Validators.required,
      Validators.pattern("^(?=.*[-!#$%&/()?¡_.])(?=.*[A-Za-z])(?=.*[A-Z]).{8,}$")
    ]),
    tipo_usuario: new FormControl('estudiante', [Validators.required]),
    nombre_auto: new FormControl({ value: '', disabled: true }),
    capacidad_auto: new FormControl({ value: '', disabled: true }),
    patente: new FormControl({ value: '', disabled: true }, [
      this.validarPatenteChilena()
    ]),
    esConductor: new FormControl(false),
    imagen_api: new FormControl('', [])
  });

  constructor(
    private usuarioService: UsuarioService,
    public router: Router,
    private alertController: AlertController,
    private fireService: FireService,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.perfilGatoAPI();
    this.usuario.get('esConductor')?.valueChanges.subscribe(isConductor => {
      if (isConductor) {
        this.usuario.get('nombre_auto')?.setValidators([Validators.required, Validators.minLength(2)]);
        this.usuario.get('capacidad_auto')?.setValidators([Validators.required, Validators.min(2), Validators.max(8), Validators.pattern("^[0-9]*$")]);
        this.usuario.get('patente')?.setValidators([Validators.required, this.validarPatenteChilena()]);
        this.usuario.get('tipo_usuario')?.setValue('estudiante_conductor');

        this.usuario.get('nombre_auto')?.enable();
        this.usuario.get('capacidad_auto')?.enable();
        this.usuario.get('patente')?.enable();
      } else {
        this.usuario.get('nombre_auto')?.clearValidators();
        this.usuario.get('capacidad_auto')?.clearValidators();
        this.usuario.get('patente')?.clearValidators();
        this.usuario.get('tipo_usuario')?.setValue('estudiante');

        this.usuario.get('nombre_auto')?.disable();
        this.usuario.get('capacidad_auto')?.disable();
        this.usuario.get('patente')?.disable();
      }

      this.usuario.get('nombre_auto')?.updateValueAndValidity();
      this.usuario.get('capacidad_auto')?.updateValueAndValidity();
      this.usuario.get('patente')?.updateValueAndValidity();
    });
  }

  handleChange(event: any) {
    const generoSeleccionado = event.detail.value;
    console.log('Género seleccionado:', generoSeleccionado);
  }

  async registroUsuario(): Promise<void> {
    if (!this.usuario.valid) {
      await this.mostrarErroresFormulario();
      return;
    }

    const nuevoUsuario = this.usuario.getRawValue();

    try {
      if (!nuevoUsuario.rut) {
        await this.mostrarAlerta('Error', 'El campo RUT es obligatorio');
        return;
      }

      const usuarioExistente = await this.fireService.getUsuario(nuevoUsuario.rut);
      if (usuarioExistente) {
        await this.mostrarAlerta('Usuario Existente', 'El usuario ya está registrado. Puedes recuperar tu contraseña');
        return;
      }

      const usuarioCreado = await this.fireService.crearUsuario(nuevoUsuario);
      if (usuarioCreado) {
        await this.mostrarAlerta('Éxito', 'Usuario creado con éxito. ¡Gracias por registrarte en DuoGO!');
        this.usuario.reset();
        this.router.navigate(['/login']);
      } else {
        await this.mostrarAlerta('Error', 'No se pudo registrar el usuario. Intenta nuevamente');
      }
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      await this.mostrarAlerta('Error', 'Hubo un problema al procesar tu registro. Intenta más tarde');
    }
  }

  async mostrarErroresFormulario() {
    let mensaje = 'Por favor corrige los siguientes errores:';
    for (const control in this.usuario.controls) {
      if (this.usuario.get(control)?.invalid) {
        mensaje += `<br>- ${control} es inválido`;
      }
    }
    await this.mostrarAlerta('Errores en el Formulario', mensaje);
  }

  async mostrarAlerta(titulo: string, mensaje: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: ['Aceptar']
    });
    await alert.present();
  }

  validarRut(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const rut = control.value;
      if (!rut) return { isValid: false };
      const dv_validar = rut?.replace("-", "").split("").splice(-1).reverse()[0];
      let rut_limpio = [];
      if (rut?.length == 10) {
        rut_limpio = rut?.replace("-", "").split("").splice(0, 8).reverse();
      } else {
        rut_limpio = rut?.replace("-", "").split("").splice(0, 7).reverse() || [];
      }
      let factor = 2;
      let total = 0;
      for (let num of rut_limpio) {
        total = total + +num * factor;
        factor = factor + 1;
        if (factor == 8) {
          factor = 2;
        }
      }
      let dv = (11 - (total % 11)).toString();
      if (+dv >= 10) {
        dv = "k";
      }
      if (dv_validar != dv.toString()) return { isValid: false };
      return null;
    };
  }

  validarPatenteChilena() {
    return (control: AbstractControl): ValidationErrors | null => {
      const patentePattern = /^[A-Z]{2}[0-9]{4}$|^[A-Z]{4}[0-9]{2}$/;
      const esValida = patentePattern.test(control.value?.toUpperCase());
      return esValida ? null : { patenteInvalida: true };
    };
  }

  perfilGatoAPI() {
    this.apiService.getGato().subscribe((data: any) => {
      console.log(data[0]?.url);
      this.perfilGato = data[0]?.url || '';
      this.usuario.patchValue({ imagen_api: this.perfilGato });
    });
  }
}
