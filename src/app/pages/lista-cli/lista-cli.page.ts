import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-lista-cli',
  templateUrl: './lista-cli.page.html',
  styleUrls: ['./lista-cli.page.scss'],
})
export class ListaCliPage {

  constructor(private router: Router) {}

  cambiarPagina() {

    this.router.navigate(['/encuentro']);
    
  }

}

