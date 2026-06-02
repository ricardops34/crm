import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TELA_KEY } from '../decorators/tela.decorator';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class TelaGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const tela = this.reflector.getAllAndOverride<string>(TELA_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!tela) return true;

    const { user } = context.switchToHttp().getRequest<{ user: JwtPayload }>();
    if (!user.telas.includes(tela)) {
      throw new ForbiddenException('Sem permissão para acessar esta tela.');
    }
    return true;
  }
}
