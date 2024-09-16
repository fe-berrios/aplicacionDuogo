import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IngresarVehiculoPage } from './ingresar-vehiculo.page';

describe('IngresarVehiculoPage', () => {
  let component: IngresarVehiculoPage;
  let fixture: ComponentFixture<IngresarVehiculoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(IngresarVehiculoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
