import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModificarViajePage } from './modificar-viaje.page';

const routes: Routes = [
  {
    path: '',
    component: ModificarViajePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModificarViajePageRoutingModule {}
