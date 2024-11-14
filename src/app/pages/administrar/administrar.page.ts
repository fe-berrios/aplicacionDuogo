import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { FireService } from 'src/app/services/fire.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { ViajeService } from 'src/app/services/viaje.service';

@Component({
  selector: 'app-administrar',
  templateUrl: './administrar.page.html',
  styleUrls: ['./administrar.page.scss'],
})
export class AdministrarPage implements OnInit {

  modoAdministracion: string = 'usuarios'; // Modo inicial: Administrar usuarios
  usuarioVisible: string | null = null;
  viajeVisible: number | null = null;

  usuarios: any[] = [];
  viajes: any[] = [];

  // Formulario de Usuarios
  persona = new FormGroup({
    rut: new FormControl('', [
      Validators.pattern("[0-9]{7,8}-[0-9kK]{1}"),
      Validators.required
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
    nombre_auto: new FormControl(''),
    capacidad_auto: new FormControl(''),
    patente: new FormControl({ value: '', disabled: true}, [
      this.validarPatenteChilena()  // Patente en formato moderno o antiguo
    ]),
    esConductor: new FormControl(false) // Control para el checkbox
  });

  // Formulario de Viajes
  viaje = new FormGroup({
    id: new FormControl(''),
    estudiante_conductor: new FormControl(''),
    asientos_disponibles: new FormControl('', [Validators.required]),
    nombre_destino: new FormControl(''),
    latitud: new FormControl(''),
    longitud: new FormControl(''),
    distancia_metros: new FormControl(''),
    tiempo_segundos: new FormControl(''),
    forma_pago: new FormControl('', [Validators.required]),
    estado_viaje: new FormControl(''),
    hora_salida: new FormControl('', [
      Validators.required,
      Validators.pattern('^([01]?[0-9]|2[0-3]):[0-5][0-9]$')
    ]),
    pasajeros: new FormControl(''),
    costo: new FormControl('', [Validators.required, Validators.min(0)]),
    patente: new FormControl({value: '', disabled: true}) // Patente no editable
  });

  constructor(private usuarioService: UsuarioService, private viajeService: ViajeService, private alertController: AlertController, private fireService: FireService) { 
    this.persona.get("rut")?.setValidators([Validators.required,Validators.pattern("[0-9]{7,8}-[0-9kK]{1}"),this.validarRut()]);
  }

  async ngOnInit() {
    // Inicializar la lógica para habilitar/deshabilitar el campo patente
    this.persona.get('esConductor')?.valueChanges.subscribe((esConductor) => {
      if (esConductor) {
        this.persona.get('patente')?.setValidators([Validators.required]);
        this.persona.get('patente')?.enable();
      } else {
        this.persona.get('patente')?.clearValidators();
        this.persona.get('patente')?.disable();
        this.persona.get('patente')?.setValue(''); // Limpiar el valor si no es conductor
      }
      this.persona.get('patente')?.updateValueAndValidity();
    });

    // Cargar los usuarios al iniciar
    this.usuarios = await this.usuarioService.getUsuarios();
  }

  // Mostrar Usuarios
  mostrarUsuarios() {
    this.modoAdministracion = 'usuarios';
  }

  // Mostrar Viajes y cargar lista de viajes
  async mostrarViajes() {
    this.modoAdministracion = 'viajes';
    this.viajes = await this.viajeService.getViajes(); // Cargar la lista de viajes

    // Asegurar que la propiedad pasajeros sea siempre un array
    this.viajes.forEach(viaje => {
      if (!Array.isArray(viaje.pasajeros)) {
        viaje.pasajeros = []; // Asegurar que siempre sea un array
      }
    });
  }

  // Firebase
  async createFire(){
    // Sacarle el valor al formGroup con el .value
    if (await this.fireService.crearUsuario(this.persona.value)){
      alert("Usuario registrado")
      this.persona.reset();
    } else {
      alert("Usuario YA existe")
    }
  }


  // CRUD Usuarios
  async createUsuario() {
    if (await this.usuarioService.createUsuario(this.persona.value)) {
      alert('Usuario creado con éxito!');
      this.persona.reset();
    } else {
      alert('Error al crear usuario.');
    }
  }

  async updateUsuario() {
    const rut = this.persona.controls.rut.value || '';
    if (await this.usuarioService.updateUsuario(rut, this.persona.value)) {
      alert('Usuario actualizado con éxito!');
    } else {
      alert('Error al actualizar usuario.');
    }
  }

  async deleteUsuario(rut: string) {
    if (await this.usuarioService.deleteUsuario(rut)) {
      alert('Usuario eliminado con éxito!');
    } else {
      alert('Error al eliminar usuario.');
    }
  }

  // Obtener un usuario específico para editarlo
  async getUsuario(rut: string) {
    const usuario = await this.usuarioService.getUsuario(rut);
    if (usuario) {
      this.persona.patchValue({
        ...usuario,
        patente: usuario.patente || '', // Asegurar que 'patente' esté presente
        esConductor: usuario.tipo_usuario === 'estudiante_conductor'
      });
    } else {
      alert('Usuario no encontrado');
    }
  }

  usuarioDrop(rut: string) {
    this.usuarioVisible = this.usuarioVisible === rut ? null : rut;
  }

  // CRUD Viajes
  async createViaje() {
    if (await this.viajeService.createViaje(this.viaje.value)) {
      alert('Viaje creado con éxito!');
      this.viaje.reset();
    } else {
      alert('Error al crear viaje.');
    }
  }

  async updateViaje() {
    const id = Number(this.viaje.controls.id.value) || 0; // Convertir a número
    if (await this.viajeService.updateViaje(id, this.viaje.value)) {
      alert('Viaje actualizado con éxito!');
    } else {
      alert('Error al actualizar viaje.');
    }
  }

  async deleteViaje(id: number) {
    if (await this.viajeService.deleteViaje(id)) {
      alert('Viaje eliminado con éxito!');
    } else {
      alert('Error al eliminar viaje.');
    }
  }

  // Obtener un viaje específico para editarlo
  async getViaje(id: number) {
    const viaje = await this.viajeService.getViaje(id);
    if (viaje) {
      this.viaje.setValue(viaje);
    } else {
      alert('Viaje no encontrado');
    }
  }

  viajeDrop(id: number) {
    this.viajeVisible = this.viajeVisible === id ? null : id;
  }

  // Validar contraseñas en el formulario de usuario
  static validarContrasenas(control: FormControl): { [key: string]: boolean } | null {
    const contrasena = control.parent?.get('contrasena')?.value;
    return control.value === contrasena ? null : { noCoinciden: true };
  }

  handleChange(ev: CustomEvent) {
    console.log('Género seleccionado:', ev.detail.value);
  }

  validarRut():ValidatorFn{
    return () => {
      const rut = this.persona.controls.rut.value;
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
    //validar patente chilena, nueva y antigua
  validarPatenteChilena(){
    return (control: AbstractControl): ValidationErrors | null => {
      const patentePattern = (/^[A-Z]{2}[0-9]{4}$|^[A-Z]{4}[0-9]{2}$/);
      const esValida = patentePattern.test(control.value?.toUpperCase());
      return esValida ? null : {patenteInvalida: true};
    };
  }
}
