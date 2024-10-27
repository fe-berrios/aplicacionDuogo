import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePage } from './home.page';
import { authGuard } from 'src/app/services/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: HomePage,
    children: [
      {
        path: '',
        redirectTo: 'mapa',  // Redirecciona automáticamente a 'mapa'
        pathMatch: 'full'
      },
      {
        path: 'perfil',
        loadChildren: () => import('../perfil/perfil.module').then(m => m.PerfilPageModule)
      },
      {
        path: 'historial',
        canActivate: [authGuard],
        loadChildren: () => import('../historial/historial.module').then(m => m.HistorialPageModule)
      },
      {
        path: 'viaje',
        loadChildren: () => import('../viaje/viaje.module').then(m => m.ViajePageModule)
      },
      {
        path: 'administrar',
        loadChildren: () => import('../administrar/administrar.module').then(m => m.AdministrarPageModule)
      },
      {
        path: 'mapa',
        loadChildren: () => import('../mapa/mapa.module').then(m => m.MapaPageModule)
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomePageRoutingModule {}
