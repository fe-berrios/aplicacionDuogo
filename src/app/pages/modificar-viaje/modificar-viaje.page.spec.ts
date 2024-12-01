import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ModificarViajePage } from './modificar-viaje.page';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ViajeService } from 'src/app/services/viaje.service';
import { FireService } from 'src/app/services/fire.service';
import { ApiService } from 'src/app/services/api.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

describe('Página de modificar viaje', () => {
  let component: ModificarViajePage;
  let fixture: ComponentFixture<ModificarViajePage>;
  let mockViajeService: jasmine.SpyObj<ViajeService>;
  let mockFireService: jasmine.SpyObj<FireService>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockRouter: Router;
  let mockActivatedRoute: ActivatedRoute;

  beforeEach(async () => {
    // Crear mocks
    mockViajeService = jasmine.createSpyObj('ViajeService', ['getViaje']);
    mockFireService = jasmine.createSpyObj('FireService', ['getViaje', 'updateViaje']);
    mockApiService = jasmine.createSpyObj('ApiService', ['getDolar']);
    mockActivatedRoute = {
      queryParams: of({ id: '123' })
    } as any;

    // Configurar los valores de retorno para los mocks
    mockApiService.getDolar.and.returnValue(of({ dolar: { valor: 800 } })); // Mock de valor del dólar
    mockFireService.getViaje.and.returnValue(of({
      id: '123',
      estudiante_conductor: '98765432-1',
      asientos_disponibles: 4,
      nombre_destino: 'Destino Prueba',
      latitud: '-33.5',
      longitud: '-70.6',
      distancia_metros: '5000',
      tiempo_segundos: '600',
      forma_pago: 'Efectivo',
      estado_viaje: 'Pendiente',
      hora_salida: '12:00',
      pasajeros: [],
      costo: '5000',
      costo_dolar: '6.25',
      patente: 'AB1234'
    }));

    await TestBed.configureTestingModule({
      declarations: [ModificarViajePage],
      imports: [
        ReactiveFormsModule,
        IonicModule.forRoot(),
        RouterTestingModule,
        HttpClientTestingModule
      ],
      providers: [
        { provide: ViajeService, useValue: mockViajeService },
        { provide: FireService, useValue: mockFireService },
        { provide: ApiService, useValue: mockApiService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ModificarViajePage);
    component = fixture.componentInstance;
    mockRouter = TestBed.inject(Router);

    fixture.detectChanges();
  });

  it('1. Verificar que la página se crea correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('2. Verificar que se obtenga el valor del dólar al inicializar', () => {
    component.dolarAPI();
    expect(mockApiService.getDolar).toHaveBeenCalled();
    expect(component.dolar).toBe(800);
  });
});
