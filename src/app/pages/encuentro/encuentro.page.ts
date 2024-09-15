import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-encuentro',
  templateUrl: './encuentro.page.html',
  styleUrls: ['./encuentro.page.scss'],
})
export class EncuentroPage {

  constructor(private router: Router) {}

  cambiarPagina() {

    this.router.navigate(['/espera']);
    
  }

}
