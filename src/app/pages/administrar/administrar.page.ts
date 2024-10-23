import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
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
      AdministrarPage.validarContrasenas // Llamada estática
    ]),
    tipo_usuario: new FormControl('estudiante', [Validators.required]), // Valor por defecto
    nombre_auto: new FormControl('', [
      Validators.minLength(5),
      Validators.required // Asegúrate de que no esté vacío
    ]),
    capacidad_auto: new FormControl('', [
      Validators.min(2),
      Validators.max(8),
      Validators.required,
      Validators.pattern("^[0-9]*$") // Solo números
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
    pasajeros: new FormControl('')
  });

  constructor(private usuarioService: UsuarioService, private viajeService: ViajeService) { }

  async ngOnInit() {
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
      this.persona.setValue(usuario);
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

  onCheckboxChange(isChecked: boolean) {
    this.persona.controls.tipo_usuario.setValue(isChecked ? 'estudiante_conductor' : 'estudiante');
  }

  handleChange(ev: CustomEvent) {
    console.log('Género seleccionado:', ev.detail.value);
  }
}
