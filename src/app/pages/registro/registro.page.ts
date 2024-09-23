import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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
    nombre_auto: new FormControl('', [
      Validators.minLength(2),
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

  constructor(private usuarioService: UsuarioService, private router: Router) { }

  ngOnInit() {
    this.usuarios = this.usuarioService.getUsuarios();
  }

  public registroUsuario(): void {
    if (this.usuarioService.createUsuario(this.usuario.value)) {
      console.log("Usuario creado con éxito!");
      console.log(JSON.stringify(this.usuario.value)); // Imprime el usuario en formato JSON
      this.router.navigate(['/login']);
    } else {
      console.log("Error! No se pudo crear el usuario.");
    }
  }  

  // Función para manejar el cambio del checkbox
  onCheckboxChange(isChecked: boolean) {
    this.usuario.controls.tipo_usuario.setValue(isChecked ? 'estudiante_conductor' : 'estudiante');
  }

  handleChange(ev: CustomEvent) {
    console.log('Género seleccionado:', ev.detail.value);
}

  static validarContrasenas(control: FormControl): { [key: string]: boolean } | null {
    const contrasena = control.parent?.get('contrasena')?.value;
    return control.value === contrasena ? null : { noCoinciden: true };
  }


}
