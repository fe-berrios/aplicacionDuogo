import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IngresarDocumentoPage } from './ingresar-documento.page';

describe('IngresarDocumentoPage', () => {
  let component: IngresarDocumentoPage;
  let fixture: ComponentFixture<IngresarDocumentoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(IngresarDocumentoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
