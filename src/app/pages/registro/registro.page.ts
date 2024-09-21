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

  usuarios:any[] = [];

  usuario = new FormGroup({
    rut: new FormControl('',[Validators.pattern("[0-9]{7,8}-[0-9kK]{1}"),Validators.required]),
    nombre: new FormControl('', [Validators.required, Validators.minLength(3)]),
    apellido: new FormControl('', [Validators.required, Validators.minLength(3)]),
    correo: new FormControl('', [Validators.required]),
    contrasena: new FormControl('', [Validators.required]),
    contrasena_confirmar: new FormControl('', [Validators.required]),
    tipo_usuario: new FormControl('estudiante', [Validators.required])
  })

  constructor(private usuarioService: UsuarioService, private router: Router) { }

  ngOnInit() {
    this.usuarios = this.usuarioService.getUsuarios();
  }

  public registroUsuario():void{
    if(this.usuarioService.createUsuario(this.usuario.value)){
      console.log("Usuario creado con éxito!")
      this.router.navigate(['/login'])
    } else {
      console.log("Error! No se pudo crear el usuario.")
    }
  }

}