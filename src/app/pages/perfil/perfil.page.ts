import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UsuarioService } from 'src/app/services/usuario.service';
import { NavController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { FireService } from 'src/app/services/fire.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {
  isEditing: boolean = false;  // Controla si está en modo de edición o no
  isFlipped = false;

  datos: string = "";

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
    ]),
    patente: new FormControl('',[]),
    imagen_api: new FormControl('', [])
  });

  constructor(private navController: NavController, 
              private usuarioService: UsuarioService,
              private apiService: ApiService,
              private fireService: FireService) {}

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
    console.log(this.usuario.value)
  }
  
  toggleFlip(): void {
    this.isFlipped = !this.isFlipped;
  }

  dataQR(): string {
    const nombre = this.usuario.get('nombre')?.value ?? '';
    const apellido = this.usuario.get('apellido')?.value ?? '';
    const rut = this.usuario.get('rut')?.value ?? '';
    const correo = this.usuario.get('correo')?.value ?? '';
  
    // Opcional: Formatear los datos como JSON o texto plano
    return `${nombre}, ${apellido}, ${rut}, ${correo}`;
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
  async guardarCambios() {
    if (this.usuario.valid) {
      const usuarioActualizado = { ...this.usuario.getRawValue() }; // Obtén valores del formulario
  
      if (!usuarioActualizado.rut) {
        console.error('El RUT del usuario es inválido.');
        alert('El RUT del usuario es inválido. Verifica los datos.');
        return;
      }
  
      try {
        // Verifica si el usuario existe en Firebase
        const docRef = this.fireService.getUsuario(usuarioActualizado.rut);
        const usuarioExistente = await firstValueFrom(docRef); // Usar correctamente Observable
  
        if (!usuarioExistente) {
          console.error('El usuario no existe en la base de datos.');
          alert('El usuario no existe en la base de datos. Verifica el RUT.');
          return;
        }
  
        // Actualiza el usuario en Firebase
        await this.fireService.updateUsuario(usuarioActualizado);
  
        // Actualiza el usuario en localStorage
        localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
  
        console.log('Perfil actualizado con éxito');
        this.isEditing = false; // Salir del modo de edición
      } catch (error) {
        console.error('Error al actualizar el perfil:', error);
        alert('Ocurrió un error al actualizar el perfil. Por favor, intenta nuevamente.');
      }
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

  async updateUsuario(nuevoUsuario: any) {
    try {
      // Llama al método de FireService para actualizar el usuario
      await this.fireService.updateUsuario(nuevoUsuario);
  
      // Mostrar mensaje de éxito
      console.log("Usuario modificado con éxito!");
    } catch (error) {
      // Manejar errores
      console.error("ERROR! Usuario no se pudo modificar:", error);
    }
  }
}

