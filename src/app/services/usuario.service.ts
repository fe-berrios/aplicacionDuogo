import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  constructor(private storage: Storage) {
    // Este comando crea la base de datos y asegura que el administrador existe.
    this.initStorage();
  }

  // async, le avisa al método que DEBE de esperar.
  async initStorage() {
    // Crear la base de datos.
    await this.storage.create();

    // Asegurar que el usuario administrador existe.
    await this.ensureAdminUser();
  }

  // Método para asegurar que siempre exista un usuario 'administrador'
  private async ensureAdminUser() {
    // Obtener la lista de usuarios
    let usuarios: any[] = await this.storage.get("usuarios") || [];

    // Verificar si el usuario 'administrador' ya existe
    const adminExists = usuarios.find(usu => usu.tipo_usuario === 'administrador');

    // Si no existe, crearlo
    if (!adminExists) {
      const admin = {
        rut: '10200300-4',  // Puedes cambiar este rut por el que desees.
        nombre: 'Admin',
        apellido: 'Istrador',
        genero: 'Masculino',
        correo: 'admin@duocuc.cl',
        telefono: '930199330',
        contrasena: 'admin',
        contrasena_confirmar: 'admin',
        tipo_usuario: 'administrador',
        nombre_auto: '',
        capacidad_auto: '',
        esConductor: false
      };

      // Agregar el administrador a la lista de usuarios y guardarlo en Storage
      usuarios.push(admin);
      await this.storage.set("usuarios", usuarios);

      console.log('Usuario administrador creado');
    } else {
      console.log('Usuario administrador ya existe');
    }
  }

  // DAO (Data Access Object) - Métodos ya implementados
  public async createUsuario(usuario: any): Promise<boolean> {
    let usuarios: any[] = await this.storage.get("usuarios") || [];
    if (usuarios.find(usu => usu.rut == usuario.rut) != undefined) {
      return false;
    }
    usuarios.push(usuario);
    await this.storage.set("usuarios", usuarios);
    return true;
  }

  public async getUsuario(rut: string): Promise<any> {
    let usuarios: any[] = await this.storage.get("usuarios") || [];
    return usuarios.find(usu => usu.rut == rut);
  }

  public async getUsuarios(): Promise<any[]> {
    let usuarios: any[] = await this.storage.get("usuarios") || [];
    return usuarios;
  }

  public async updateUsuario(rut: string, nuevoUsuario: any): Promise<boolean> {
    let usuarios: any[] = await this.storage.get("usuarios") || [];
    let index: number = usuarios.findIndex(usu => usu.rut == rut);
    if (index == -1) {
      return false;
    }
    usuarios[index] = nuevoUsuario;
    await this.storage.set("usuarios", usuarios);
    return true;
  }

  public async deleteUsuario(rut: string): Promise<boolean> {
    let usuarios: any[] = await this.storage.get("usuarios") || [];
    let index: number = usuarios.findIndex(usu => usu.rut == rut);
    if (index == -1) {
      return false;
    }
    usuarios.splice(index, 1);
    await this.storage.set("usuarios", usuarios);
    return true;
  }

  public async authUsuario(rut: string, contrasena: string): Promise<any> {
    let usuarios: any[] = await this.storage.get("usuarios") || [];
    const usuarioAuth = usuarios.find(usu => usu.rut == rut && usu.contrasena == contrasena);
    if (usuarioAuth) {
      localStorage.setItem("usuario", JSON.stringify(usuarioAuth));
      return true;
    }
    return false;
  }

  public async recoverUsuario(correo: string): Promise<any> {
    let usuarios: any[] = await this.storage.get("usuarios") || [];
    return usuarios.find(usu => usu.correo == correo);
  }
}
