import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CrearViajePage } from './crear-viaje.page';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FireService } from 'src/app/services/fire.service';
import { ViajeService } from 'src/app/services/viaje.service';
import { ApiService } from 'src/app/services/api.service';
import { of } from 'rxjs';

describe('Página de crear viaje', () => {
  let component: CrearViajePage;
  let fixture: ComponentFixture<CrearViajePage>;
  let fireServiceSpy: jasmine.SpyObj<FireService>;
  let viajeServiceSpy: jasmine.SpyObj<ViajeService>;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;
  let navControllerSpy: jasmine.SpyObj<NavController>;

  beforeEach(async () => {
    fireServiceSpy = jasmine.createSpyObj('FireService', ['getViajes', 'createViaje']);
    viajeServiceSpy = jasmine.createSpyObj('ViajeService', ['createViaje']);
    apiServiceSpy = jasmine.createSpyObj('ApiService', ['getDolar']);
    navControllerSpy = jasmine.createSpyObj('NavController', ['navigateForward']);

    fireServiceSpy.getViajes.and.returnValue(of([]));
    fireServiceSpy.createViaje.and.returnValue(Promise.resolve(true));
    apiServiceSpy.getDolar.and.returnValue(of({ dolar: { valor: 850 } }));

    await TestBed.configureTestingModule({
      declarations: [CrearViajePage],
      imports: [
        ReactiveFormsModule,
        FormsModule,
        IonicModule.forRoot(),
        RouterTestingModule,
        HttpClientTestingModule
      ],
      providers: [
        { provide: FireService, useValue: fireServiceSpy },
        { provide: ViajeService, useValue: viajeServiceSpy },
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: NavController, useValue: navControllerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CrearViajePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Verificar que la página se abre', () => {
    expect(component).toBeTruthy();
  });

  it('2. Verificar que el formulario sea inválido si faltan campos obligatorios', () => {
    component.viaje.patchValue({
      estudiante_conductor: '',
      asientos_disponibles: null,
      nombre_destino: '',
      forma_pago: '',
      hora_salida: ''
    });

    expect(component.viaje.valid).toBeFalse();
  });

  it('3. Verificar que se inicialice el mapa correctamente', fakeAsync(() => {
    spyOn(component, 'initMapa').and.callThrough();
    component.ngOnInit();
    tick(2000); 

    expect(component.initMapa).toHaveBeenCalled();
    expect(component['map']).toBeDefined();
  }));

  it('4. Verificar que se obtenga el valor del dólar desde la API', () => {
    component.dolarAPI();
    expect(apiServiceSpy.getDolar).toHaveBeenCalled();
    expect(component.dolar).toBe(850);
  });
});
