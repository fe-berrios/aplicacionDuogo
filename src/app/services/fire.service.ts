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
    // Iniciar sesión con Firebase Authentication
    const userCredential = await this.fireAuth.signInWithEmailAndPassword(email, contrasena);
    const userId = userCredential.user?.uid;
    console.log(userId)

    if (userId) {
      const usuarioFire = await firstValueFrom(this.fireStore.collection('usuarios').doc(userId).get()); 
      const usuarioData = usuarioFire.data();
      console.log("userdate", usuarioData)
      console.log("userfire", usuarioFire)
      

      if(usuarioData){
        localStorage.setItem("usuario", JSON.stringify(usuarioData));
        return true;
      }
    }
    return false;
  }
}