import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdministrarPage } from './administrar.page';

describe('AdministrarPage', () => {
  let component: AdministrarPage;
  let fixture: ComponentFixture<AdministrarPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdministrarPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
