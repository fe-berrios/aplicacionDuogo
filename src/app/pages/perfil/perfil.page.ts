import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UsuarioService } from 'src/app/services/usuario.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {
  isEditing: boolean = false;  // Controla si está en modo de edición o no

  usuario = new FormGroup({
    rut: new FormControl({ value: '', disabled: true }, [
      Validators.pattern("[0-9]{7,8}-[0-9kK]{1}"),
      Validators.required
    ]),
    nombre: new FormControl({ value: '', disabled: true }, [
      Validators.required,
      Validators.minLength(3),
      Validators.pattern("^[a-zA-Z]+$") // Solo letras
    ]),
    apellido: new FormControl({ value: '', disabled: true }, [
      Validators.required,
      Validators.minLength(3),
      Validators.pattern("^[a-zA-Z]+$") // Solo letras
    ]),
    correo: new FormControl({ value: '', disabled: true }, [
      Validators.pattern("^[a-zA-Z0-9._%+-]+@duocuc\\.cl$"),
      Validators.required
    ]),
    telefono: new FormControl('', [
      Validators.required,
      Validators.pattern("^[0-9]{9}$") // 9 dígitos
    ]),
    tipo_usuario: new FormControl('estudiante', [Validators.required]), // Alterna entre 'estudiante' y 'estudiante_conductor'
    nombre_auto: new FormControl({ value: '', disabled: true }, [
      Validators.minLength(5),
      Validators.required // Solo habilitado si es 'estudiante_conductor'
    ]),
    capacidad_auto: new FormControl({ value: '', disabled: true }, [
      Validators.min(2),
      Validators.max(8),
      Validators.required,
      Validators.pattern("^[0-9]*$") // Solo habilitado si es 'estudiante_conductor'
    ])
  });

  constructor(private navController: NavController, private usuarioService: UsuarioService) {}

  ngOnInit() {
    const usuarioSesion = localStorage.getItem('usuario');
    if (usuarioSesion) {
      this.usuario.patchValue(JSON.parse(usuarioSesion));
  
      // Suscribirse a los cambios de tipo_usuario
      this.usuario.get('tipo_usuario')?.valueChanges.subscribe((value: string | null) => {
        const tipoUsuario = value || 'estudiante';  // Asigna un valor por defecto si es null
        this.toggleAutoFields(tipoUsuario);  // Ahora el valor siempre será de tipo string
      });
    }
  }
  
  formatTipoUsuario(tipoUsuario: string | null): string {
    if (!tipoUsuario) return '';
    
    return tipoUsuario.replace('_', ' ')
                      .split(' ')
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(' ');
  }

  // Activa el modo de edición
  toggleEdit() {
    this.isEditing = true;
  }

  // Cancela la edición
  cancelEdit() {
    this.isEditing = false;
    this.ngOnInit(); // Vuelve a cargar los datos del usuario almacenados en localStorage
  }

  // Guarda los cambios en el perfil
  guardarCambios() {
    if (this.usuario.valid) {
      // Obtener el usuario existente del localStorage o del servicio
      const usuarioSesion = JSON.parse(localStorage.getItem('usuario') || '{}');
  
      // Combinar los cambios con el usuario existente (sin perder atributos no modificados)
      const usuarioActualizado = { ...usuarioSesion, ...this.usuario.value };
  
      // Guardar el usuario actualizado
      localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
  
      this.isEditing = false;
      this.updateUsuario(usuarioActualizado.rut, usuarioActualizado); // Llama al servicio para actualizar en el servidor
    } else {
      console.log('Formulario inválido');
    }
  }

  // Actualiza los campos del auto según el tipo de usuario
  toggleAutoFields(tipoUsuario: string) {
    if (tipoUsuario === 'estudiante_conductor') {
      this.usuario.get('nombre_auto')?.enable();
      this.usuario.get('capacidad_auto')?.enable();
    } else {
      this.usuario.get('nombre_auto')?.disable();
      this.usuario.get('capacidad_auto')?.disable();
    }
  }

  logout() {
    localStorage.removeItem('usuario');
    this.navController.navigateRoot('/login');
  }

  async updateUsuario(rut: string, nuevoUsuario: any) {
    if (await this.usuarioService.updateUsuario(rut, nuevoUsuario)) {
      console.log("Usuario modificado con éxito!");
    } else {
      console.log("ERROR! Usuario no se pudo modificar.");
    }
  }
}

