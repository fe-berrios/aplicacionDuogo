import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FireService {

  constructor(private fireStore: AngularFirestore, private fireAuth: AngularFireAuth) { }

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

  updateUsuario(usuario: any){
    return this.fireStore.collection('usuarios').doc(usuario.rut).update(usuario);
  }

  deleteUsuario(rut: string){
    return this.fireStore.collection('usuarios').doc(rut).delete();
  }

  public async authUsuario(email: string, contrasena: string): Promise<boolean> {
    try {
      // Iniciar sesión con Firebase Authentication
      const userCredential = await this.fireAuth.signInWithEmailAndPassword(email, contrasena);
      const userId = userCredential.user?.uid;
      console.log(userId)
  
      if (userId) {
        // Obtener documento del usuario desde Firestore
        const usuarioDoc = await firstValueFrom(this.fireStore.collection('usuarios').doc(userId).get());
        console.log("1")
        console.log(usuarioDoc)
        if (usuarioDoc.exists) {
          console.log("2")
          const usuarioData = usuarioDoc.data();
  
          // Almacenar datos del usuario en localStorage
          if (usuarioData) {
            console.log("3")
            localStorage.setItem("usuario", JSON.stringify(usuarioData));
            return true;
          }
        }
      }
  
      return false;
    } catch (error) {
      // Verificación de tipo para manejar el error
      if (error instanceof Error) {
        console.error("Error en autenticación:", error.message);
      } else {
        console.error("Error inesperado en autenticación:", error);
      }
      return false;
    }
  }
}