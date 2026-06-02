import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERFIS_KEY } from '../decorators/perfis.decorator';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class PerfilGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const perfisRequeridos = this.reflector.getAllAndOverride<string[]>(PERFIS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!perfisRequeridos?.length) return true;

    const { user } = context.switchToHttp().getRequest<{ user: JwtPayload }>();
    if (!perfisRequeridos.includes(user.perfil_nome)) {
      throw new ForbiddenException('Acesso negado para este perfil.');
    }
    return true;
  }
}
