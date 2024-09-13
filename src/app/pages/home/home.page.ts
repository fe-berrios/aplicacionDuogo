import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  constructor(private router: Router) {
    
  }
  ngOnInit() {
    this.redirigirDespuésDe5Segundos();
  }
  redirigirDespuésDe5Segundos() {
    setTimeout(() => {
      this.router.navigate(['/login']); 
    }, 5000); 
  }

}
