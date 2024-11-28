import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AlertController } from '@ionic/angular';
import { firstValueFrom, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FireService {

  constructor(private fireStore: AngularFirestore, 
              private fireAuth: AngularFireAuth,
              private alertController: AlertController) { }

  // Usuarios(crud)
  async crearUsuario(usuario: any){
    const docRef = this.fireStore.collection('usuarios').doc(usuario.rut);
    const docActual = await docRef.get().toPromise();
    if(docActual?.exists){
      return false;
    }

    const credencialesUsuario = await this.fireAuth.createUserWithEmailAndPassword(usuario.correo, usuario.contrasena);
    const uid = credencialesUsuario.user?.uid;
    await docRef.set({...usuario, uid});
    return true;
    //return this.fireStore.collection('usuarios').doc(usuario.rut).set(usuario);
  }

  getUsuarios(){
    return this.fireStore.collection('usuarios').valueChanges();
  }

  getUsuario(rut: string){
    return this.fireStore.collection('usuarios').doc(rut).valueChanges();
  }

  updateUsuario(usuario: any): Promise<any>{
    return this.fireStore.collection('usuarios').doc(usuario.rut).update(usuario);
  }

  deleteUsuario(rut: string): Promise<any>{
    return this.fireStore.collection('usuarios').doc(rut).delete();
  }

  getUsuarioUid(uid: string): Promise<any>{
    return this.fireStore.collection('usuarios', ref => ref.where('uid', '==', uid)).get().toPromise().then((snapshot) => {
      if (snapshot && !snapshot.empty){
        return snapshot.docs[0].data();
      }
      return null;
    }).catch((error) => {
      console.error("Error al obtener usuario:", error);
      return null;
    })
  }

  // Viajes(crud)
  async createViaje(viaje: any){
    const docRef = await this.fireStore.collection('viajes').add(viaje);

    const id = docRef.id;
    await docRef.set({...viaje, id});
    return true;
  }

  getViajes(): Observable<any[]>{
    return this.fireStore.collection('viajes').valueChanges();
  }

  getViaje(id: string){
    return this.fireStore.collection('viajes').doc(id).valueChanges();
  }

  async updateViaje(viaje: any): Promise<boolean> {
    try {
      await this.fireStore.collection('viajes').doc(viaje.id).update(viaje);
      return true; // Retorna true si la actualización fue exitosa
    } catch (error) {
      console.error('Error al actualizar el viaje:', error);
      return false; // Retorna false en caso de error
    }
  }

  deleteViaje(id: string): Promise<any>{
    return this.fireStore.collection('viajes').doc(id).delete();
  }

  // Recuperar contraseña
  async recuperarContrasena(email: string): Promise<void> {
    try {
      await this.fireAuth.sendPasswordResetEmail(email);
      const alert = await this.alertController.create({
        header: 'Éxito',
        message: 'Se ha enviado un correo para restablecer tu contraseña.',
        buttons: ['OK'],
      });
      await alert.present();
    } catch (error: any) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: this.obtenerMensajeError(error.code),
        buttons: ['OK'],
      });
      await alert.present();
    }
  }

  private obtenerMensajeError(codigo: string): string {
    switch (codigo) {
      case 'auth/user-not-found':
        return 'No existe un usuario con este correo.';
      case 'auth/invalid-email':
        return 'El correo ingresado no es válido.';
      default:
        return 'Ocurrió un error inesperado. Intenta nuevamente.';
    }
  }
}