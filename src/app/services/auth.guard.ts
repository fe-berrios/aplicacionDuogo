import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { NavController } from '@ionic/angular';

export const authGuard: CanActivateFn = (route, state) => {
  const navController = inject(NavController);
  const usuario = localStorage.getItem("usuario");
  const isAuthenticated = !!usuario; // Usuario autenticado si existe en localStorage
  const userType = usuario ? JSON.parse(usuario).tipo_usuario : null;

  // Si el usuario está autenticado y está intentando acceder a rutas públicas
  if (isAuthenticated && ['/login', '/registro', '/espera', '/recuperar', '/olvido'].includes(state.url)) {
    navController.navigateRoot('/home');
    return false;
  }

  // Redirigir al login si no está autenticado y no está en la ruta de login
  if (!isAuthenticated && state.url !== '/login') {
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
