import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { authGuard } from './services/auth.guard';

const routes: Routes = [
  {
    path: 'home',
    canActivate: [authGuard],
    loadChildren: () => import('./pages/home/home.module').then((m) => m.HomePageModule),
  },
  {
    path: '',
    redirectTo: 'espera',
    pathMatch: 'full',
  },
  {
    path: 'login',
    canActivate: [authGuard],
    loadChildren: () => import('./pages/login/login.module').then((m) => m.LoginPageModule),
  },
  {
    path: 'registro',
    canActivate: [authGuard],
    loadChildren: () => import('./pages/registro/registro.module').then((m) => m.RegistroPageModule),
  },
  {
    path: 'recuperar',
    canActivate: [authGuard],
    loadChildren: () => import('./pages/recuperar/recuperar.module').then((m) => m.RecuperarPageModule),
  },
  {
    path: 'olvido',
    canActivate: [authGuard],
    loadChildren: () => import('./pages/olvido/olvido.module').then((m) => m.OlvidoPageModule),
  },
  {
    path: 'espera',
    canActivate: [authGuard],
    loadChildren: () => import('./pages/espera/espera.module').then((m) => m.EsperaPageModule),
  },
  {
    path: 'crear-viaje',
    canActivate: [authGuard],
    loadChildren: () => import('./pages/crear-viaje/crear-viaje.module').then((m) => m.CrearViajePageModule),
  },
  {
    path: 'modificar-viaje',
    canActivate: [authGuard],
    loadChildren: () => import('./pages/modificar-viaje/modificar-viaje.module').then((m) => m.ModificarViajePageModule),
  },
  {
    path: '**',
    loadChildren: () => import('./pages/error404/error404.module').then((m) => m.Error404PageModule),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }