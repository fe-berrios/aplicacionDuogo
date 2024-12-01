import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistorialPage } from './historial.page';
import { FireService } from 'src/app/services/fire.service';
import { ApiService } from 'src/app/services/api.service';
import { of } from 'rxjs';

describe('Página de historial', () => {
  let component: HistorialPage;
  let fixture: ComponentFixture<HistorialPage>;
  let mockFireService: jasmine.SpyObj<FireService>;
  let mockApiService: jasmine.SpyObj<ApiService>;

  beforeEach(async () => {
    mockFireService = jasmine.createSpyObj('FireService', ['getViajes', 'getUsuario']);
    mockFireService.getUsuario.and.returnValue(of({ imagen_api: 'assets/default-avatar.png' }));
    mockApiService = jasmine.createSpyObj('ApiService', ['getFabricantes']);

    await TestBed.configureTestingModule({
      declarations: [HistorialPage],
      providers: [
        { provide: FireService, useValue: mockFireService },
        { provide: ApiService, useValue: mockApiService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HistorialPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Verificar si la página se abre', () => {
    expect(component).toBeTruthy();
  });

  it('2. Verificar que obtenga al usuario al inicializar', () => {
    spyOn(component, 'getUsuario');
    component.ngOnInit();
    expect(component.getUsuario).toHaveBeenCalled();
  });

  it('3. Verificar que obtenga viajes del usuario al inicializar', async () => {
    spyOn(component, 'getViajesUsuario');
    component.ngOnInit();
    expect(component.getViajesUsuario).toHaveBeenCalled();
  });

  it('4. Verificar que filtre viajes donde el usuario es pasajero o conductor', async () => {
    const mockViajes = [
      { estudiante_conductor: '12345678-9', pasajeros: ['87654321-0'], estado_viaje: 'Finalizado' },
      { estudiante_conductor: '11112222-3', pasajeros: ['12345678-9'], estado_viaje: 'Finalizado' },
      { estudiante_conductor: '44445555-6', pasajeros: [], estado_viaje: 'Pendiente' },
    ];
    mockFireService.getViajes.and.returnValue(of(mockViajes));
    component.rutUsuario = '12345678-9';
  
    await component.getViajesUsuario();
  
    expect(component.viajesConductor.length).toBe(1); // 1 viaje como conductor
    expect(component.viajesPasajero.length).toBe(1); // 1 viaje como pasajero
  });

  /*it('5. Verificar que se renderice mensaje de no hay viajes disponibles', () => {
    component.model = 'conductor';
    component.viajesConductor = [];
    fixture.detectChanges();
  
    const noViajesMessage = fixture.nativeElement.querySelector('ion-card h2');
    expect(noViajesMessage.textContent).toContain('No hay viajes finalizados donde fuiste conductor.');
  });

  it('6. Verificar que rendericen los viajes si hay viajes', () => {
    component.model = 'conductor';
    component.viajesConductor = [
      { estudiante_conductor: '12345678-9', nombre_destino: 'Destino 1', estado_viaje: 'Finalizado' },
      { estudiante_conductor: '87654321-0', nombre_destino: 'Destino 2', estado_viaje: 'Finalizado' },
    ];
    fixture.detectChanges();
  
    const viajesList = fixture.nativeElement.querySelectorAll('ion-card ion-card-content ion-item');
    expect(viajesList.length).toBe(2); // 2 viajes como conductor
  });

  it('7. Verificar que muestre los pasajeros si el usuario es estudiante_conductor', () => {
    component.model = 'conductor';
    component.viajesConductor = [
      { estudiante_conductor: '12345678-9', pasajeros: ['87654321-0'] },
    ];
    component.rutUsuario = '12345678-9';
    fixture.detectChanges();
  
    const pasajerosList = fixture.nativeElement.querySelectorAll('ul li');
    expect(pasajerosList.length).toBe(1); // 1 pasajero
    expect(pasajerosList[0].textContent).toContain('87654321-0');
  });*/

  it('8. Verificar que no muestre los pasajeros si el usuario no es estudiante_conductor', () => {
    component.viajes = [
      { estudiante_conductor: '87654321-0', nombre_destino: 'Destino 2', estado_viaje: 'Pendiente', costo: 2000, asientos_disponibles: 3, forma_pago: 'Tarjeta', hora_salida: '11:00', patente: 'WXYZ789', pasajeros: ['12345678-9'], razon_cancelacion: '' },
    ];
    component.rutUsuario = '12345678-9';
    fixture.detectChanges();

    const pasajerosList = fixture.nativeElement.querySelector('ul');
    expect(pasajerosList).toBeNull();
  });
});
