import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IngresarVehiculoPage } from './ingresar-vehiculo.page';

const routes: Routes = [
  {
    path: '',
    component: IngresarVehiculoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IngresarVehiculoPageRoutingModule {}
