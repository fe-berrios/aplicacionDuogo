import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { AdministrarPage } from './administrar.page';
import { IonicModule } from '@ionic/angular';
import { FireService } from 'src/app/services/fire.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { ViajeService } from 'src/app/services/viaje.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

describe('Página de administrar', () => {
  let component: AdministrarPage;
  let fixture: ComponentFixture<AdministrarPage>;

  let mockFireService: jasmine.SpyObj<FireService>;
  let mockUsuarioService: jasmine.SpyObj<UsuarioService>;
  let mockViajeService: jasmine.SpyObj<ViajeService>;

  beforeEach(async () => {
    // Crear mocks para los servicios
    mockFireService = jasmine.createSpyObj('FireService', [
      'getUsuarios',
      'getUsuario',
      'crearUsuario',
      'updateUsuario',
      'deleteUsuario',
      'getViajes',
      'getViaje',
      'createViaje',
      'updateViaje',
      'deleteViaje'
    ]);

    mockUsuarioService = jasmine.createSpyObj('UsuarioService', ['getUsuarios']);
    mockViajeService = jasmine.createSpyObj('ViajeService', ['getViajes']);

    // Configurar mocks con valores de retorno
    mockFireService.getUsuarios.and.returnValue(of([]));
    mockFireService.getViajes.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      declarations: [AdministrarPage],
      imports: [
        ReactiveFormsModule,
        IonicModule.forRoot(),
        HttpClientTestingModule
      ],
      providers: [
        { provide: FireService, useValue: mockFireService },
        { provide: UsuarioService, useValue: mockUsuarioService },
        { provide: ViajeService, useValue: mockViajeService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdministrarPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Verificar que la página se cree correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('2. Verificar que el modo inicial sea "usuarios"', () => {
    expect(component.modoAdministracion).toBe('usuarios');
  });

  it('3. Verificar que los usuarios se carguen al inicializar', async () => {
    const usuariosMock = [
      { rut: '12345678-9', nombre: 'Juan', apellido: 'Pérez' }
    ];
    mockFireService.getUsuarios.and.returnValue(of(usuariosMock));
    await component.ngOnInit();
    expect(component.usuarios).toEqual(usuariosMock);
  });

  it('4. Verificar que se cambie al modo "viajes" y se cargue la lista de viajes', async () => {
    const viajesMock = [
      { id: 1, nombre_destino: 'Destino 1', asientos_disponibles: 3 },
      { id: 2, nombre_destino: 'Destino 2', asientos_disponibles: 4 }
    ];
    mockFireService.getViajes.and.returnValue(of(viajesMock));
    await component.mostrarViajes();
    expect(component.modoAdministracion).toBe('viajes');
    expect(component.viajes).toEqual(viajesMock);
  });

  it('5. Verificar que muestre error si el usuario ya existe al crear un usuario', async () => {
    spyOn(window, 'alert');
    mockFireService.crearUsuario.and.returnValue(Promise.resolve(false));

    await component.createFire();
    expect(window.alert).toHaveBeenCalledWith('Usuario YA existe');
  });

  it('6. Verificar que se llame a "deleteUsuario" para eliminar un usuario', async () => {
    spyOn(window, 'alert');
    const rut = '12345678-9';
    mockFireService.deleteUsuario.and.returnValue(Promise.resolve(true));

    await component.deleteUsuario(rut);
    expect(mockFireService.deleteUsuario).toHaveBeenCalledWith(rut);
    expect(window.alert).toHaveBeenCalledWith('Usuario eliminado con éxito!');
  });

  it('7. Verificar que muestre error al intentar eliminar un usuario inexistente', async () => {
    spyOn(window, 'alert');
    mockFireService.deleteUsuario.and.returnValue(Promise.resolve(false));

    await component.deleteUsuario('12345678-9');
    expect(window.alert).toHaveBeenCalledWith('Error al eliminar usuario.');
  });
});
