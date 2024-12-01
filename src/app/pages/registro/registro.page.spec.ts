import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RegistroPage } from './registro.page';
import { IonicModule } from '@ionic/angular';
import { UsuarioService } from 'src/app/services/usuario.service';
import { FireService } from 'src/app/services/fire.service';
import { ApiService } from 'src/app/services/api.service';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { Storage } from '@ionic/storage-angular';
import { IonicStorageModule } from '@ionic/storage-angular';

describe('Página de registro', () => {
  let component: RegistroPage;
  let fixture: ComponentFixture<RegistroPage>;

  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockFireService: jasmine.SpyObj<FireService>;

  beforeEach(async () => {
    mockApiService = jasmine.createSpyObj('ApiService', ['getGato']);
    mockFireService = jasmine.createSpyObj('FireService', ['crearUsuario']);
    
    mockApiService.getGato.and.returnValue(of([{ url: 'http://example.com/cat.jpg' }]));
    mockFireService.crearUsuario.and.returnValue(Promise.resolve(true));

    await TestBed.configureTestingModule({
      declarations: [RegistroPage],
      imports: [
        ReactiveFormsModule,
        IonicModule.forRoot(),
        RouterTestingModule,
        HttpClientTestingModule
      ],
      providers: [
        { provide: ApiService, useValue: mockApiService },
        { provide: FireService, useValue: mockFireService },
        UsuarioService,
        Storage
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegistroPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Verificar si la página se abre', () => {
    expect(component).toBeTruthy();
  });

  it('2. Verificar si es un RUT válido', () => {
    const rutControl = component.usuario.get('rut');
    rutControl?.setValue('20561718-3');
    expect(rutControl?.valid).toBeTrue();

    rutControl?.setValue('invalid-rut');
    expect(rutControl?.valid).toBeFalse();
  });

  it('3. Verificar si es un e-mail válido', () => {
    const correoControl = component.usuario.get('correo');
    correoControl?.setValue('user@duocuc.cl');
    expect(correoControl?.valid).toBeTrue();

    correoControl?.setValue('user@gmail.com');
    expect(correoControl?.valid).toBeFalse();
  });

  it('4. Verificar funcionamiento de checkboxes', () => {
    const esConductorControl = component.usuario.get('esConductor');
    esConductorControl?.setValue(true);

    const nombreAutoControl = component.usuario.get('nombre_auto');
    const capacidadAutoControl = component.usuario.get('capacidad_auto');
    const patenteControl = component.usuario.get('patente');

    expect(nombreAutoControl?.enabled).toBeTrue();
    expect(capacidadAutoControl?.enabled).toBeTrue();
    expect(patenteControl?.enabled).toBeTrue();

    esConductorControl?.setValue(false);

    expect(nombreAutoControl?.disabled).toBeTrue();
    expect(capacidadAutoControl?.disabled).toBeTrue();
    expect(patenteControl?.disabled).toBeTrue();
  });

  /*it('5. Verificar el registro de un usuario.', async () => {
    spyOn(window, 'alert'); // Espiar la función alert
    spyOn(component, 'mostrarAlerta'); // Espiar la función mostrarAlerta
    const routerSpy = spyOn(component.router, 'navigate'); // Espiar la navegación
  
    component.usuario.patchValue({
      rut: '20561718-3',
      nombre: 'Juan',
      apellido: 'Pérez',
      genero: 'Masculino',
      correo: 'juan@duocuc.cl',
      telefono: '912345678',
      contrasena: 'Password123!',
      contrasena_confirmar: 'Password123!',
      tipo_usuario: 'estudiante',
      nombre_auto: '', // Habilitado pero vacío
      capacidad_auto: '', // Habilitado pero vacío
      patente: '', // Habilitado pero vacío
      esConductor: false, // Checkbox desmarcado
      imagen_api: 'http://example.com/cat.jpg' // Valor que viene de la API
    });
  
    await component.registroUsuario();
  
    expect(mockFireService.crearUsuario).toHaveBeenCalledWith({
      rut: '20561718-3',
      nombre: 'Juan',
      apellido: 'Pérez',
      genero: 'Masculino',
      correo: 'juan@duocuc.cl',
      telefono: '912345678',
      contrasena: 'Password123!',
      contrasena_confirmar: 'Password123!',
      tipo_usuario: 'estudiante',
      nombre_auto: '',
      capacidad_auto: '',
      patente: '',
      esConductor: false,
      imagen_api: 'http://example.com/cat.jpg'
    });
  
    expect(component.mostrarAlerta).toHaveBeenCalledWith(
      'Gracias por registrarse en DuoGO!',
      '¡¡Sus datos han sido ingresados con éxito!!'
    );
    expect(routerSpy).toHaveBeenCalledWith(['/login']);
  });*/
});
