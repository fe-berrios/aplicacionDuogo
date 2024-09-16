import { Component, OnInit, ViewChild  } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-finalizar-viaje',
  templateUrl: './finalizar-viaje.page.html',
  styleUrls: ['./finalizar-viaje.page.scss'],
})
export class FinalizarViajePage {
  @ViewChild('popover')
  popover!: { event: Event; };

  isOpen = false;
  collapsedBreadcrumbs: HTMLIonBreadcrumbElement[] = [];

  async presentPopover(e: Event) {
    this.collapsedBreadcrumbs = (e as CustomEvent).detail.collapsedBreadcrumbs;
    this.popover.event = e;
    this.isOpen = true;
  }
  

  constructor(private router: Router) {}

  cambiarPagina() {

    this.router.navigate(['/conductor']);
    
  }

  

}
