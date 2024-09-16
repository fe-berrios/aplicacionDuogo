import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IngresarDocumentoPage } from './ingresar-documento.page';

const routes: Routes = [
  {
    path: '',
    component: IngresarDocumentoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IngresarDocumentoPageRoutingModule {}
