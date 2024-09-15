import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IniciarViajePage } from './iniciar-viaje.page';

describe('IniciarViajePage', () => {
  let component: IniciarViajePage;
  let fixture: ComponentFixture<IniciarViajePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(IniciarViajePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
