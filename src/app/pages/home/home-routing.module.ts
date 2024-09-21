import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePage } from './home.page';

const routes: Routes = [
  {
    path: '',
    component: HomePage,
    children: [
      {
        path: 'perfil',
        loadChildren: () => import('../perfil/perfil.module').then( m => m.PerfilPageModule)
      },
      {
        path: 'historial',
        loadChildren: () => import('../historial/historial.module').then( m => m.HistorialPageModule)
      },
      {
        path: 'viaje',
        loadChildren: () => import('../viaje/viaje.module').then( m => m.ViajePageModule)
      },
      {
        path: 'administrar',
        loadChildren: () => import('../administrar/administrar.module').then( m => m.AdministrarPageModule)
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomePageRoutingModule {}
