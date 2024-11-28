import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { NavController } from '@ionic/angular';

export const authGuard: CanActivateFn = (route, state) => {
  const navController = inject(NavController);
  const usuario = localStorage.getItem('usuario');
  const isAuthenticated = !!usuario; // Usuario autenticado si existe en localStorage
  const userType = usuario ? JSON.parse(usuario).tipo_usuario : null;

  // Rutas públicas (permitir acceso solo si no está autenticado)
  const publicRoutes = ['/login', '/registro', '/recuperar', '/olvido', '/espera'];
  if (publicRoutes.includes(state.url)) {
    if (isAuthenticated) {
      navController.navigateRoot('/home');
      return false;
    }
    return true; // Permitir acceso si no está autenticado
  }

  // Rutas protegidas (requieren autenticación)
  if (!isAuthenticated) {
    navController.navigateRoot('/login');
    return false;
  }

  // Verificar acceso a /crear-viaje para estudiantes conductores
  if (state.url === '/crear-viaje' && userType !== 'estudiante_conductor') {
    navController.navigateRoot('/home');
    return false;
  }

  // Verificar acceso a /home/administrar para administradores
  if (state.url === '/home/administrar' && userType !== 'administrador') {
    navController.navigateRoot('/home');
    return false;
  }

  return true;
};
