import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EsperaPage } from './espera.page';

const routes: Routes = [
  {
    path: '',
    component: EsperaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EsperaPageRoutingModule {}
