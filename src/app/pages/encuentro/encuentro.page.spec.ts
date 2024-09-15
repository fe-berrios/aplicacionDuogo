import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EncuentroPage } from './encuentro.page';

describe('EncuentroPage', () => {
  let component: EncuentroPage;
  let fixture: ComponentFixture<EncuentroPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EncuentroPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
