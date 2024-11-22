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
}