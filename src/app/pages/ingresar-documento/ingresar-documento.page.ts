import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-ingresar-documento',
  templateUrl: './ingresar-documento.page.html',
  styleUrls: ['./ingresar-documento.page.scss'],
})
export class IngresarDocumentoPage {
  public buffer = 0.06;
  public progress = 0;
  constructor(private router: Router, private navController: NavController) {
       
    setInterval(() => {
      this.buffer += 0.06;
      this.progress += 0.06;

  
      if (this.progress > 1) {
        setTimeout(() => {
          this.buffer = 0.06;
          this.progress = 0;
        }, 1000);
      }
    }, 1000);  
  }  


  cambiarPagina() {

    this.router.navigate(['/conductor']);
    
  }

  

}
