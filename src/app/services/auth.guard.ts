import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { NavController } from '@ionic/angular';

export const authGuard: CanActivateFn = (route, state) => {
  const navController = inject(NavController);
  const usuario = localStorage.getItem("usuario");
  const isAuthenticated = usuario ? true : false;
  const userType = usuario ? JSON.parse(usuario).tipo_usuario : null;

  // Verificar si el usuario está autenticado
  if (!isAuthenticated && state.url !== '/login') {
    navController.navigateRoot('/login');
    return false;
  }

  // Verificar si el usuario es estudiante_conductor al intentar acceder a /crear-viaje
  if (state.url === '/crear-viaje' && userType !== 'estudiante_conductor') {
    navController.navigateRoot('/home'); // Redirigir a /home o cualquier otra página
    return false;
  }

  // Verificar si el usuario es administrador al intentar acceder a /home/administrar
  if (state.url === '/home/administrar' && userType !== 'administrador') {
    navController.navigateRoot('/home'); // Redirigir a /home o cualquier otra página
    return false;
  }

  return true;
};
