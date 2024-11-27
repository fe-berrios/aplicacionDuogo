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
    mockFireService = jasmine.createSpyObj('FireService', ['getViajes']);
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
      { estudiante_conductor: '12345678-9', pasajeros: ['87654321-0'], estado_viaje: 'Completado' },
      { estudiante_conductor: '11112222-3', pasajeros: ['12345678-9'], estado_viaje: 'Cancelado' },
      { estudiante_conductor: '44445555-6', pasajeros: [], estado_viaje: 'Pendiente' },
    ];
    mockFireService.getViajes.and.returnValue(of(mockViajes));
    component.rutUsuario = '12345678-9';

    await component.getViajesUsuario();

    expect(component.viajes.length).toBe(2);
    expect(component.viajes).toEqual([
      mockViajes[0],
      mockViajes[1],
    ]);
  });

  it('5. Verificar que se renderize mensaje de no hay viajes disponibles', () => {
    component.viajes = [];
    fixture.detectChanges();

    const noViajesMessage = fixture.nativeElement.querySelector('ion-card ion-label h2');
    expect(noViajesMessage.textContent).toContain('No hay viajes disponibles en los que estés participando.');
  });

  it('6. Verificar que renderize los viajes si es que hay viajes', () => {
    component.viajes = [
      { estudiante_conductor: '12345678-9', nombre_destino: 'Destino 1', estado_viaje: 'Completado', costo: 1500, asientos_disponibles: 2, forma_pago: 'Efectivo', hora_salida: '10:00', patente: 'ABCD123', pasajeros: ['87654321-0'], razon_cancelacion: '' },
      { estudiante_conductor: '87654321-0', nombre_destino: 'Destino 2', estado_viaje: 'Pendiente', costo: 2000, asientos_disponibles: 3, forma_pago: 'Tarjeta', hora_salida: '11:00', patente: 'WXYZ789', pasajeros: [], razon_cancelacion: '' },
    ];
    fixture.detectChanges();

    const viajesList = fixture.nativeElement.querySelectorAll('ion-card ion-card-content ion-item');
    expect(viajesList.length).toBe(2);
  });

  it('7. Verificar que muestre los pasajeros si el usuario es estudiante_conductor', () => {
    component.viajes = [
      { estudiante_conductor: '12345678-9', nombre_destino: 'Destino 1', estado_viaje: 'Completado', costo: 1500, asientos_disponibles: 2, forma_pago: 'Efectivo', hora_salida: '10:00', patente: 'ABCD123', pasajeros: ['87654321-0'], razon_cancelacion: '' },
    ];
    component.rutUsuario = '12345678-9';
    fixture.detectChanges();

    const pasajerosList = fixture.nativeElement.querySelectorAll('ul li');
    expect(pasajerosList.length).toBe(1);
    expect(pasajerosList[0].textContent).toContain('87654321-0');
  });

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
