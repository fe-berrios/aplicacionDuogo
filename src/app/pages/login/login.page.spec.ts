import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginPage } from './login.page';
import { IonicModule } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage-angular';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { Storage } from '@ionic/storage-angular';
import { UsuarioService } from 'src/app/services/usuario.service';

// Mock environment for Firebase
const mockEnvironment = {
  firebase: {
    apiKey: "AIzaSyBRjLaEmQocE-qX2ddgX3A01QlKwW9V2fo",
    authDomain: "aplicacionduogo.firebaseapp.com",
    projectId: "aplicacionduogo",
    storageBucket: "aplicacionduogo.firebasestorage.app",
    messagingSenderId: "1065288512577",
    appId: "1:1065288512577:web:3c530bdf894ee04474c2c0"
  }
};

describe('Página de login', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  let storage: Storage;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginPage],
      imports: [
        IonicModule.forRoot(),
        IonicStorageModule.forRoot(),
        AngularFireModule.initializeApp(mockEnvironment.firebase),
        AngularFirestoreModule
      ],
      providers: [
        UsuarioService,
        Storage
      ]
    }).compileComponents();

    // Initialize Storage
    storage = TestBed.inject(Storage);
    await storage.create();

    // Create component instance
    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Verificar que la página se abre', () => {
    expect(component).toBeTruthy();
  });

  it('2. Verificar que renderiza el formulario de login', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('ion-input[placeholder="ejemplo@duocuc.cl"]')).toBeTruthy();
    expect(compiled.querySelector('ion-input[type="password"]')).toBeTruthy();
    expect(compiled.querySelector('ion-button')).toBeTruthy();
  });

  it('3. Verificar que se llame al método login() cuando se hace clic en el botón', () => {
    spyOn(component, 'login');
    const button = fixture.nativeElement.querySelector('ion-button');
    button.click();
    expect(component.login).toHaveBeenCalled();
  });

});
