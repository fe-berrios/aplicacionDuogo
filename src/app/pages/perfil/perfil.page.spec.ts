import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PerfilPage } from './perfil.page';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule, AlertController, NavController } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { UsuarioService } from 'src/app/services/usuario.service';
import { ApiService } from 'src/app/services/api.service';
import { FireService } from 'src/app/services/fire.service';
import { of } from 'rxjs';

describe('Página de perfil', () => {
  let component: PerfilPage;
  let fixture: ComponentFixture<PerfilPage>;
  let mockUsuarioService: jasmine.SpyObj<UsuarioService>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockFireService: jasmine.SpyObj<FireService>;
  let mockAlertController: jasmine.SpyObj<AlertController>;
  let mockNavController: jasmine.SpyObj<NavController>;

  beforeEach(async () => {
    // Crear mocks con métodos válidos
    mockUsuarioService = jasmine.createSpyObj('UsuarioService', ['getUsuario']);
    mockApiService = jasmine.createSpyObj('ApiService', ['getGato']);
    mockFireService = jasmine.createSpyObj('FireService', ['getUsuario', 'updateUsuario']);
    mockAlertController = jasmine.createSpyObj('AlertController', ['create']);
    mockNavController = jasmine.createSpyObj('NavController', ['navigateRoot']);

    // Configurar valores de retorno para mocks
    mockApiService.getGato.and.returnValue(of([{ url: 'http://example.com/cat.jpg' }]));
    mockFireService.getUsuario.and.returnValue(of(null));
    mockFireService.updateUsuario.and.returnValue(Promise.resolve(true));
    mockAlertController.create.and.returnValue(
      Promise.resolve({
        present: () => Promise.resolve(),
        onDidDismiss: () => Promise.resolve({ role: 'confirm' }),
      } as any)
    );

    await TestBed.configureTestingModule({
      declarations: [PerfilPage],
      imports: [ReactiveFormsModule, IonicModule.forRoot(), RouterTestingModule],
      providers: [
        { provide: UsuarioService, useValue: mockUsuarioService },
        { provide: ApiService, useValue: mockApiService },
        { provide: FireService, useValue: mockFireService },
        { provide: AlertController, useValue: mockAlertController },
        { provide: NavController, useValue: mockNavController },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Verificar que la página se crea correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('2. Verificar que se habiliten/deshabiliten los campos de auto según el tipo de usuario', () => {
    component.toggleAutoFields('estudiante_conductor');
    expect(component.usuario.get('nombre_auto')?.enabled).toBeTrue();
    expect(component.usuario.get('capacidad_auto')?.enabled).toBeTrue();

    component.toggleAutoFields('estudiante');
    expect(component.usuario.get('nombre_auto')?.enabled).toBeFalse();
    expect(component.usuario.get('capacidad_auto')?.enabled).toBeFalse();
  });

  it('3. Verificar que "cancelEdit" restablece el formulario y "isEditing" a false', () => {
    component.isEditing = true;
    component.cancelEdit();
    expect(component.isEditing).toBeFalse();
  });

  it('4. Verificar que "guardarCambios" muestra una alerta cuando el formulario es inválido', async () => {
    spyOn(component, 'mostrarAlerta');
    component.usuario.patchValue({
      rut: '',
      nombre: '',
      apellido: '',
      correo: '',
      telefono: '',
      tipo_usuario: 'estudiante'
    });
    await component.guardarCambios();
    expect(component.mostrarAlerta).toHaveBeenCalledWith('Formulario inválido', 'Por favor, revisa los datos antes de guardar');
  });

  it('5. Verificar que "dataQR" devuelve la cadena correcta', () => {
    component.usuario.patchValue({
      nombre: 'Juan',
      apellido: 'Pérez',
      rut: '12345678-9',
      correo: 'juan@duocuc.cl'
    });

    const qrData = component.dataQR();
    expect(qrData).toBe('Juan, Pérez, 12345678-9, juan@duocuc.cl');
  });
});
