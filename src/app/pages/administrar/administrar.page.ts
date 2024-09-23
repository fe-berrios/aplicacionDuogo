import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UsuarioService } from 'src/app/services/usuario.service';

@Component({
  selector: 'app-administrar',
  templateUrl: './administrar.page.html',
  styleUrls: ['./administrar.page.scss'],
})
export class AdministrarPage implements OnInit {

  usuarioVisible: string | null = null;
  usuarios:any[] = [];

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

  // El servicio (en 'services') nos permite trabajar la información: 
  // Se importa el DAO creado en 'services/usuario.service.ts'
  constructor(private usuarioService: UsuarioService) { }

  // ngOnInit es una funcion que funciona apenas carga la página
  ngOnInit() {
    // Apenas cargue la página guarda los usuarios del 'service' en la lista usuarios en la variable definida acá.
    this.usuarios = this.usuarioService.getUsuarios();
  }
  
  //CRUD
  createUsuario(){
    // Se accede al objeto (this.usuarioService) y se accede al método (.createUsuario)
    // y se le da el objeto 'persona' al método.
    if(this.usuarioService.createUsuario(this.persona.value)){
      alert("Usuario creado con éxito!")
      // .reset limpia el formulario.
      this.persona.reset()
    } else {
      alert("Error! No se pudo crear el usuario.")
    }
  }

  getUsuario(rut: string){
    // Se le asigna valor a 'persona' (this.persona.setValue)
    // y se rescatan los datos del usuario (this.usuarioService.getUsuario(rut));
    this.persona.setValue(this.usuarioService.getUsuario(rut));
  }

  updateUsuario(){
    // Se crea una variable ya que ionic no permite que potencialmente NO encuentre algun rut
    // entonces en esta variable le asignamos el valor del rut o (||) un string vacio ("");
    var rut_buscar: string= this.persona.controls.rut.value || "";
    // Se llama al servicio, se accede al método,
    // se utiliza la variable (this.persona.controls.rut.value) y
    // se utiliza la persona (this.persona.value)
    if (this.usuarioService.updateUsuario(rut_buscar, this.persona.value)){
      alert("Usuario modificado con éxito!")
    } else {
      alert("ERROR! Usuario no modificado.")
    }
  }

  deleteUsuario(rut: string){
    // Se llama al método del Service "deleteUsuario" para eliminar el usuario
    // Se le entrega la variable de 'rut' que rescatamos del *ngFor de los usuarios.
    if(this.usuarioService.deleteUsuario(rut)){
      // Se DEBE agregar una alerta de '¿Estas seguro quieres eliminar al usuario?'
      alert("Usuario eliminado con éxito!")
    }else{
      alert("ERROR! Usuario no ha sido eliminado")
    }
  }

  // Dropdown
  usuarioDrop(rut: string){
    this.usuarioVisible = this.usuarioVisible === rut ? null: rut;
  }

  static validarContrasenas(control: FormControl): { [key: string]: boolean } | null {
    const contrasena = control.parent?.get('contrasena')?.value;
    return control.value === contrasena ? null : { noCoinciden: true };
  }

  // Función para manejar el cambio del checkbox
  onCheckboxChange(isChecked: boolean) {
    this.persona.controls.tipo_usuario.setValue(isChecked ? 'estudiante_conductor' : 'estudiante');
  }

  handleChange(ev: CustomEvent) {
    console.log('Género seleccionado:', ev.detail.value);
}
}