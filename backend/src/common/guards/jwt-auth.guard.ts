import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import type { JwtPayload } from '../interfaces/jwt-payload.interface';

export const IS_PUBLIC_KEY = 'isPublic';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const can = await super.canActivate(context);
    if (!can) return false;

    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    const cachedVersao = await this.cache.get<number>(
      `perfil:versao:${user.perfil_id}`,
    );

    if (cachedVersao !== undefined && cachedVersao !== null && cachedVersao !== user.perfil_versao) {
      throw new UnauthorizedException('Sessão desatualizada. Faça login novamente.');
    }

    return true;
  }

  handleRequest<T>(err: Error, user: T): T {
    if (err || !user) {
      throw err ?? new UnauthorizedException('Token inválido ou expirado.');
    }
    return user;
  }
}
