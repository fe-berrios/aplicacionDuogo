import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { authGuard } from './services/auth.guard';

const routes: Routes = [
  {
    path: 'home',
    canActivate: [authGuard],
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'espera',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'registro',
    loadChildren: () => import('./pages/registro/registro.module').then( m => m.RegistroPageModule)
  },
  {
    path: 'recuperar',
    loadChildren: () => import('./pages/recuperar/recuperar.module').then( m => m.RecuperarPageModule)
  },
  {
    path: 'olvido',
    loadChildren: () => import('./pages/olvido/olvido.module').then( m => m.OlvidoPageModule)
  },
  {
    path: 'espera',
    loadChildren: () => import('./pages/espera/espera.module').then( m => m.EsperaPageModule)
  },
  {
    path: 'crear-viaje',
    canActivate: [authGuard],
    loadChildren: () => import('./pages/crear-viaje/crear-viaje.module').then( m => m.CrearViajePageModule)
  },
  {
    path: 'modificar-viaje',
    loadChildren: () => import('./pages/modificar-viaje/modificar-viaje.module').then( m => m.ModificarViajePageModule)
  },
  {
    path: '**', // '**' Deja el path a todo aquel link que dirija a alguna página que no exista
    loadChildren: () => import('./pages/error404/error404.module').then( m => m.Error404PageModule)
    // Este path siempre debe estar al final del json, debido que se recorre el json path por path.
  },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }