import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListaCliPage } from './lista-cli.page';

const routes: Routes = [
  {
    path: '',
    component: ListaCliPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListaCliPageRoutingModule {}
