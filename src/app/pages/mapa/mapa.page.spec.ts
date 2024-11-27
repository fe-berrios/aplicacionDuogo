import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { MapaPage } from './mapa.page';
import { FireService } from 'src/app/services/fire.service';
import { ViajeService } from 'src/app/services/viaje.service';
import { of } from 'rxjs';
import { Storage } from '@ionic/storage-angular';
import { IonicStorageModule } from '@ionic/storage-angular';

describe('Página de mapa', () => {
  let component: MapaPage;
  let fixture: ComponentFixture<MapaPage>;
  let fireServiceSpy: jasmine.SpyObj<FireService>;
  let viajeServiceSpy: jasmine.SpyObj<ViajeService>;

  beforeEach(async () => {
    const fireServiceMock = jasmine.createSpyObj('FireService', ['getViajes', 'updateViaje']);
    const viajeServiceMock = jasmine.createSpyObj('ViajeService', ['getViaje']);

    await TestBed.configureTestingModule({
      declarations: [MapaPage],
      imports: [IonicModule.forRoot(), RouterTestingModule],
      providers: [
        { provide: FireService, useValue: fireServiceMock },
        { provide: ViajeService, useValue: viajeServiceMock },
        Storage
      ],
    }).compileComponents();

    fireServiceSpy = TestBed.inject(FireService) as jasmine.SpyObj<FireService>;
    viajeServiceSpy = TestBed.inject(ViajeService) as jasmine.SpyObj<ViajeService>;

    fixture = TestBed.createComponent(MapaPage);
    component = fixture.componentInstance;

    // Mock valores iniciales
    fireServiceSpy.getViajes.and.returnValue(of([])); // No viajes inicialmente
    fixture.detectChanges();
  });

  it('1. Verificar si la página se abre', () => {
    expect(component).toBeTruthy();
  });

  it('2. Verificar si el mapa se inicializa', fakeAsync(() => {
    spyOn(component, 'initMapa').and.callThrough();

    component.ngOnInit();
    tick(2000); // Simula el tiempo de inicialización del mapa

    expect(component.initMapa).toHaveBeenCalled();
    expect(component['map']).toBeDefined(); // El mapa debe estar inicializado
  })); 

});
