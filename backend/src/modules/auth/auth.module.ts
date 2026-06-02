import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { Usuario } from '../../entities/usuario.entity';
import { Perfil } from '../../entities/perfil.entity';
import { Parametro } from '../../entities/parametro.entity';
import { ModulosModule } from '../modulos/modulos.module';
import { ModulosService } from '../modulos/modulos.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') ?? 'secret',
        signOptions: { expiresIn: (config.get<string>('JWT_EXPIRES_IN') ?? '8h') as any },
      }),
    }),
    TypeOrmModule.forFeature([Usuario, Perfil, Parametro]),
    ModulosModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    { provide: 'MODULOS_SERVICE', useExisting: ModulosService },
  ],
  exports: [AuthService],
})
export class AuthModule {}
