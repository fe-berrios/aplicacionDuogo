import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListaCliPage } from './lista-cli.page';

describe('ListaCliPage', () => {
  let component: ListaCliPage;
  let fixture: ComponentFixture<ListaCliPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ListaCliPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
