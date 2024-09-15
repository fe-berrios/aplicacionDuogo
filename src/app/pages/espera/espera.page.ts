import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-espera',
  templateUrl: './espera.page.html',
  styleUrls: ['./espera.page.scss'],
})
export class EsperaPage implements OnInit {
  public buffer = 0.06;
  public progress = 0;

  constructor(private router: Router, private navController: NavController) {
       
    setInterval(() => {
      this.buffer += 0.06;
      this.progress += 0.06;

      // Reset the progress bar when it reaches 100%
      // to continuously show the demo
      if (this.progress > 1) {
        setTimeout(() => {
          this.buffer = 0.06;
          this.progress = 0;
        }, 1000);
      }
    }, 1000);    
  }

  ngOnInit() {
    
    setTimeout(() => {
      this.navController.navigateForward('/iniciar-viaje');
    }, 16500);
  }
 
}

 
