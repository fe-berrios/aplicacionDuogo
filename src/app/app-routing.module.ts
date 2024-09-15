import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'registro',
    loadChildren: () => import('./pages/registro/registro.module').then( m => m.RegistroPageModule)
  },  {
    path: 'olvido',
    loadChildren: () => import('./pages/olvido/olvido.module').then( m => m.OlvidoPageModule)
  },
  {
    path: 'recuperar',
    loadChildren: () => import('./pages/recuperar/recuperar.module').then( m => m.RecuperarPageModule)
  },
  {
    path: 'conductor',
    loadChildren: () => import('./pages/conductor/conductor.module').then( m => m.ConductorPageModule)
  },
  {
    path: 'usuario',
    loadChildren: () => import('./pages/usuario/usuario.module').then( m => m.UsuarioPageModule)
  },
  {
    path: 'lista-cli',
    loadChildren: () => import('./pages/lista-cli/lista-cli.module').then( m => m.ListaCliPageModule)
  },
  {
    path: 'encuentro',
    loadChildren: () => import('./pages/encuentro/encuentro.module').then( m => m.EncuentroPageModule)
  },
  {
    path: 'espera',
    loadChildren: () => import('./pages/espera/espera.module').then( m => m.EsperaPageModule)
  },
  {
    path: 'iniciar-viaje',
    loadChildren: () => import('./pages/iniciar-viaje/iniciar-viaje.module').then( m => m.IniciarViajePageModule)
  },
  {
    path: 'finalizar-viaje',
    loadChildren: () => import('./pages/finalizar-viaje/finalizar-viaje.module').then( m => m.FinalizarViajePageModule)
  },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
