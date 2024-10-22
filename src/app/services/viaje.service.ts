import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class ViajeService {

  constructor(private storage: Storage) {
    // Este comando crea la base de datos.
    this.initStorage();
  }

  // async, le avisa al método que DEBE de esperar.
   async initStorage(){
    // await, espera que el comando se ejecute.
    await this.storage.create();
  }

  // DAO (Data Access Object)
  // Su propósito principal es abstraer y encapsular el acceso
  // a los datos, separando la lógica de persistencia de datos de la lógica de negocio.
  // SIEMPRE un método asincronico debe PROMETER devolver.
  public async createViaje(viaje:any): Promise<boolean>{
    // Cada storage puede tener muchas llaves, que funciona como 'tablas'. Cada llave una 'tabla'.
    let viajes: any[] = await this.storage.get("viajes") || [];
    // Itera usu por usu buscando el atributo .rut que calze con usuario.rut (Variable del método.)
    if (viajes.find(via => via.id == viaje.id) != undefined){
      // Si usuario NO es 'undefined' osea que SI existe, entonces:
      return false;
    }
    viajes.push(viaje);
    await this.storage.set("viajes", viajes);
    return true;
  }

  public async getViaje(id:number): Promise<any>{
    let viajes: any[] = await this.storage.get("viajes") || [];
    return viajes.find(via => via.id == id);
  }

  // Especifica que devuelve una lista[] de algo 'any'
  public async getViajes(): Promise<any[]>{
    let viajes: any[] = await this.storage.get("viajes") || [];
    return viajes;
  }

  // Método debe ser siempre 'async' cuando se trabaja con await!
  // Un método async ya que esta 'asincronico' debe devolver una 'promesa' de algo.
  public async updateViaje(id:number, nuevoViaje:any): Promise<boolean>{
    // Ya que se trabaja con 'storage' se utiliza el await. ESTO SE HACE SIEMPRE.
    // Se crea una variable que almacena el storage.
    let viajes: any[] = await this.storage.get("viajes") || [];
    // Se almacena el index de la lista que creamos anteriormente que rescataba el storage.
    let index: number = viajes.findIndex(via => via.id == id);
    if (index == -1){
      return false;
    }
    viajes[index] = nuevoViaje;
    await this.storage.set("viajes", viajes);
    return true;
  }

  public async deleteViaje(id:number): Promise<boolean>{
    let viajes: any[] = await this.storage.get("viajes") || [];
    let index: number = viajes.findIndex(via => via.id == id);
    if (index == -1){
      return false;
    }
    viajes.splice(index, 1);
    await this.storage.set("viajes", viajes);
    return true;
  }
}