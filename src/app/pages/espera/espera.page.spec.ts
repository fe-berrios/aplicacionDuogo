import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EsperaPage } from './espera.page';

describe('EsperaPage', () => {
  let component: EsperaPage;
  let fixture: ComponentFixture<EsperaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EsperaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
