import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const telaGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const codigoTela: string = route.data['tela'];

  if (!codigoTela) return true;

  if (!auth.temTela(codigoTela)) {
    router.navigate(['/sem-acesso']);
    return false;
  }

  return true;
};
