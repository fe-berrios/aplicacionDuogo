import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ingresar-vehiculo',
  templateUrl: './ingresar-vehiculo.page.html',
  styleUrls: ['./ingresar-vehiculo.page.scss'],
})
export class IngresarVehiculoPage implements OnInit {

  constructor(private router: Router)  { }

  ngOnInit() {
  }

  cambiarPagina() {

    this.router.navigate(['/ingresar-documento']);
    
  }

}
