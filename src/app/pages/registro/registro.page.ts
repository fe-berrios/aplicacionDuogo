import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, ValidatorFn, AbstractControl, ValidationErrors} from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { control } from 'leaflet';
import { UsuarioService } from 'src/app/services/usuario.service';


@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})


export class RegistroPage implements OnInit { 
  usuarios: any[] = [];

  usuario = new FormGroup({
    rut: new FormControl('',[
      Validators.required,
      Validators.pattern("[0-9]{7,8}-[0-9kK]{1}")
    ]),
    nombre: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.pattern("^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+( [a-zA-ZáéíóúÁÉÍÓÚñÑ]+)*$") // Solo letras
    ]),
    apellido: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.pattern("^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+( [a-zA-ZáéíóúÁÉÍÓÚñÑ]+)*$") // Solo letras
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
      Validators.pattern("^(?=.*[-!#$%&/()?¡_.])(?=.*[A-Za-z])(?=.*[a-z]).{8,}$")
    ]),
    contrasena_confirmar: new FormControl('', [
      Validators.required,
      Validators.pattern("^(?=.*[-!#$%&/()?¡_.])(?=.*[A-Za-z])(?=.*[a-z]).{8,}$")
    ]),
    tipo_usuario: new FormControl('estudiante', [Validators.required]), // Valor por defecto
    nombre_auto: new FormControl({ value: '', disabled: true}),
    capacidad_auto: new FormControl({ value: '', disabled: true}),
    patente: new FormControl({ value: '', disabled: true}, [
      this.validarPatenteChilena()
    ]),
    esConductor: new FormControl(false) // Control para el checkbox
  });

  constructor(private usuarioService: UsuarioService, private router: Router, private alertController: AlertController) {
      this.usuario.get("rut")?.setValidators([Validators.required,Validators.pattern("[0-9]{7,8}-[0-9kK]{1}"),this.validarRut()]);
   }

   ngOnInit() {
    // Observa cambios en el campo esConductor para aplicar o quitar validaciones
    this.usuario.get('esConductor')?.valueChanges.subscribe(isConductor => {
      if (isConductor) {
        this.usuario.get('nombre_auto')?.setValidators([Validators.required, Validators.minLength(2)]);
        this.usuario.get('capacidad_auto')?.setValidators([Validators.required, Validators.min(2), Validators.max(8), Validators.pattern("^[0-9]*$")]);
        this.usuario.get('patente')?.setValidators([Validators.required, this.validarPatenteChilena()]);
        this.usuario.get('tipo_usuario')?.setValue('estudiante_conductor');
  
        // Habilitar campos de conductor
        this.usuario.get('nombre_auto')?.enable();
        this.usuario.get('capacidad_auto')?.enable();
        this.usuario.get('patente')?.enable();
      } else {
        // Quitar validaciones y desactivar campos de conductor
        this.usuario.get('nombre_auto')?.clearValidators();
        this.usuario.get('capacidad_auto')?.clearValidators();
        this.usuario.get('patente')?.clearValidators();
        this.usuario.get('tipo_usuario')?.setValue('estudiante');
  
        this.usuario.get('nombre_auto')?.disable();
        this.usuario.get('capacidad_auto')?.disable();
        this.usuario.get('patente')?.disable();
      }
  
      // Actualizar el estado de las validaciones para los campos
      this.usuario.get('nombre_auto')?.updateValueAndValidity();
      this.usuario.get('capacidad_auto')?.updateValueAndValidity();
      this.usuario.get('patente')?.updateValueAndValidity();
    });
  }
  
  public async registroUsuario(): Promise<void> {
    if (!this.usuario.valid) {
      console.log("Formulario inválido:", this.usuario.errors);
      alert("Formulario inválido. Completa los campos requeridos.");
      return;
    }
  
    const nuevoUsuario = this.usuario.getRawValue(); // Obtiene solo los campos habilitados
  
    if (await this.usuarioService.createUsuario(nuevoUsuario)) {
      alert("Usuario creado con éxito!");
      await this.mostrarAlerta('Gracias por registrarse en DuoGO!', '¡¡Sus datos han sido ingresados con éxito!!');
      this.router.navigate(['/login']);
    } else {
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

  validarRut():ValidatorFn{
    return () => {
      const rut = this.usuario.controls.rut.value;
      const dv_validar = rut?.replace("-","").split("").splice(-1).reverse()[0];
      let rut_limpio = [];
      if(rut?.length==10){
        rut_limpio = rut?.replace("-","").split("").splice(0,8).reverse();
      }else{
        rut_limpio = rut?.replace("-","").split("").splice(0,7).reverse() || [];
      }
      let factor = 2;
      let total = 0;
      for(let num of rut_limpio){
        total = total + ((+num)*factor);
        factor = factor + 1;
        if(factor==8){
          factor = 2;
        }
      }
      var dv = (11-(total%11)).toString();
      if(+dv>=10){
        dv = "k";
      }
      if(dv_validar!=dv.toString()) return {isValid: false};
      return null;
    };
  }

  validarPatenteChilena(){
    return (control: AbstractControl): ValidationErrors | null => {
      const patentePattern = (/^[A-Z]{2}[0-9]{4}$|^[A-Z]{4}[0-9]{2}$/);
      const esValida = patentePattern.test(control.value?.toUpperCase());
      return esValida ? null : {patenteInvalida: true};
    };
  }

}