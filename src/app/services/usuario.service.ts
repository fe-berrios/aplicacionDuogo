import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  // Variables atras de crud
  // Se crea array de usuarios
  // Usuarios de demostración
  usuarios: any[] = [
    {
      rut: '10200300-4',
      nombre: 'Armando',
      apellido: 'Casas',
      genero: 'Otro',
      correo: 'admin@duocuc.cl',
      telefono: '+56910002000',
      contrasena: 'admin',
      contrasena_confirmar: 'admin',
      tipo_usuario: 'administrador',
      nombre_auto: '',
      capacidad_auto: '',
      esConductor: false
    },
    {
      rut: '10200300-5',
      nombre: 'Juan',
      apellido: 'Perez',
      genero: 'Masculino',
      correo: 'ju.perez@duocuc.cl',
      telefono: '+56910002000',
      contrasena: 'admin',
      contrasena_confirmar: 'admin',
      tipo_usuario: 'estudiante',
      nombre_auto: '',
      capacidad_auto: '',
      esConductor: false
    },
    {
      rut: '10200300-6',
      nombre: 'Carla',
      apellido: 'Gonzalez',
      genero: 'Femenino',
      correo: 'car.gonzalez@duocuc.cl',
      telefono: '+56910002000',
      contrasena: 'admin',
      contrasena_confirmar: 'admin',
      tipo_usuario: 'estudiante_conductor',
      nombre_auto: 'Suzuki Grand Vitara',
      capacidad_auto: '4',
      esConductor: true
    }
  ];
  

  constructor() { }

  // DAO (Data Access Object)
  // Su propósito principal es abstraer y encapsular el acceso
  // a los datos, separando la lógica de persistencia de datos de la lógica de negocio.
  public createUsuario(usuario:any){
    // se utiliza this para entrar a las propiedades de la clase/objeto.
    if(this.getUsuario(usuario.rut) == undefined){
      // Si 'usuario.rut' no existe (undefined)..
      this.usuarios.push(usuario);
      // agregalo a la lista (this.usuarios.push)
      return true;
    }
    return false;
  }

  public updateUsuario(rut:string, nuevoUsuario:any){
    // Se crea constante que contiene el indice de donde esta el usuario con el rut ingresado
    // Se utiliza 'const' para no poder cambiar el valor de la variable
    const indice = this.usuarios.findIndex(usuario => usuario.rut == rut);
    // Si el indice es -1 entonces NO existe el usuario
    // El -1 es propio del método findIndex
    if(indice == -1){
      return false;
    }
    // Se va a la variable de donde se localiza el usuario, y se reemplaza por un nuevoUsuario.
    this.usuarios[indice] = nuevoUsuario;
    return true;
  }

  public deleteUsuario(rut:string){
    // Se crea constante que contiene el indice de donde esta el usuario con el rut ingresado
    // Se utiliza 'const' para no poder cambiar el valor de la variable
    const indice = this.usuarios.findIndex(usuario => usuario.rut == rut);
    // Si el indice es -1 entonces NO existe el usuario
    // El -1 es propio del método findIndex
    if (indice == -1){
      return false;
    }
    this.usuarios.splice(indice, 1);
    return true;
  }

  public getUsuario(rut:string):any{
    return this.usuarios.find(usuario => usuario.rut == rut);
    // De la lista anda elemento por elemento (usuario) e itera (=>)
    // hasta que el elemento.atributo (usuario.rut) coincida (==) con la variable del método (rut).
  }

  // Especifica que devuelve una lista[] de algo 'any'
  public getUsuarios():any[]{
    return this.usuarios;
  }
}