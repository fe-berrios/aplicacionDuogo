import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicStorageModule } from '@ionic/storage-angular'; // Importar IonicStorageModule
import { HomePage } from './home.page';
import { UsuarioService } from 'src/app/services/usuario.service'; // Importar el servicio UsuarioService
import { Storage } from '@ionic/storage-angular'; // Importar Storage

describe('Página de home', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  beforeEach(async () => {
    const localStoragePrueba = {
      getItem: jasmine.createSpy('getItem').and.callFake((key: string) => {
        if (key === 'usuario') {
          return JSON.stringify({
            rut: "10200300-4",
            nombre: "Administrador",
            fecha_nacimiento: "1980-01-01",
            genero: "Masculino",
            correo: "admin@duocuc.cl",
            contrasena: "Ejemplo123#",
            valida_contrasena: "Ejemplo123#",
            tiene_equipo: "no",
            nombre_equipo: "",
            tipo_usuario: "Administrador"
          });
        }
        return null;
      }),
      setItem: jasmine.createSpy('setItem'),
      removeItem: jasmine.createSpy('removeItem')
    };

    Object.defineProperty(window, 'localStorage', { value: localStoragePrueba });

    await TestBed.configureTestingModule({
      declarations: [HomePage],
      imports: [
        IonicModule.forRoot(),
        RouterTestingModule,
        IonicStorageModule.forRoot() // Agregar IonicStorageModule con inicialización
      ],
      providers: [
        UsuarioService, // Registrar UsuarioService si se utiliza en HomePage
        Storage // Registrar Storage
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Verificar si la página se abre', () => {
    expect(component).toBeTruthy();
  });

  it('2. Verificar el nombre del usuario', () => {
    expect(component.usuario.nombre).toEqual("Administrador");
  });

  it('3. Verificar al usuario completo', () => {
    expect(localStorage.getItem).toHaveBeenCalledWith('usuario');
    expect(component.usuario).toEqual({
      rut: "10200300-4",
      nombre: "Administrador",
      fecha_nacimiento: "1980-01-01",
      genero: "Masculino",
      correo: "admin@duocuc.cl",
      contrasena: "Ejemplo123#",
      valida_contrasena: "Ejemplo123#",
      tiene_equipo: "no",
      nombre_equipo: "",
      tipo_usuario: "Administrador"
    });
  });
});
