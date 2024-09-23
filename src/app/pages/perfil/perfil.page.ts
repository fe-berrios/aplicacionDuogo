import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UsuarioService } from 'src/app/services/usuario.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {

  usuarioForm: FormGroup = new FormGroup({
    rut: new FormControl({ value: '', disabled: true }),
    nombre: new FormControl({ value: '', disabled: true }),
    apellido: new FormControl({ value: '', disabled: true }),
    correo: new FormControl({ value: '', disabled: true }),
    telefono: new FormControl('', [Validators.required, Validators.pattern("[0-9]{9}")]),
    tipo_usuario: new FormControl('', [Validators.required]),
    nombre_auto: new FormControl('', Validators.minLength(3)),
    capacidad_auto: new FormControl('', Validators.min(2)),
  });

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit() {
    const usuarioSesion = sessionStorage.getItem('usuario');
    if (usuarioSesion) {
      const usuarioData = JSON.parse(usuarioSesion);
      this.usuarioForm = new FormGroup({
        rut: new FormControl({ value: usuarioData.rut, disabled: true }),
        nombre: new FormControl({ value: usuarioData.nombre, disabled: true }),
        apellido: new FormControl({ value: usuarioData.apellido, disabled: true }),
        correo: new FormControl({ value: usuarioData.correo, disabled: true }),
        telefono: new FormControl(usuarioData.telefono, [Validators.required, Validators.pattern("[0-9]{9}")]),
        tipo_usuario: new FormControl(usuarioData.tipo_usuario, [Validators.required]),
        nombre_auto: new FormControl(usuarioData.nombre_auto, Validators.minLength(3)),
        capacidad_auto: new FormControl(usuarioData.capacidad_auto, Validators.min(2)),
      });

      this.checkIfConductor();  // Activar o desactivar los campos de auto
    }
  }

  // Si el tipo de usuario es 'estudiante_conductor', se activan los campos de auto
  checkIfConductor() {
    const tipoUsuario = this.usuarioForm.get('tipo_usuario')?.value;
    
    if (tipoUsuario === 'estudiante_conductor') {
      this.usuarioForm.get('nombre_auto')?.enable();
      this.usuarioForm.get('capacidad_auto')?.enable();
    } else {
      this.usuarioForm.get('nombre_auto')?.disable();
      this.usuarioForm.get('capacidad_auto')?.disable();
    }
  }
  

  // Llamado al cambiar el tipo de usuario
  onTipoUsuarioChange() {
    this.checkIfConductor();
  }

  // Actualizar usuario
  updateUsuario() {
    const rut_buscar = this.usuarioForm.controls['rut'].value || "";

    // Verifica el tipo de usuario y resetea los campos de auto si es estudiante
    if (this.usuarioForm.controls['tipo_usuario'].value === 'estudiante') {
      this.usuarioForm.controls['nombre_auto'].setValue('');
      this.usuarioForm.controls['capacidad_auto'].setValue('');
    }

    if (this.usuarioService.updateUsuario(rut_buscar, this.usuarioForm.value)) {
      alert("Usuario modificado con éxito!");
      // Aquí podrías actualizar la sesión, si lo deseas
    } else {
      alert("ERROR! Usuario no modificado.");
    }
  }  
}
