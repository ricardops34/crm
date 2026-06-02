import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModulosController } from './modulos.controller';
import { ModulosService } from './modulos.service';
import { Modulo } from '../../entities/modulo.entity';
import { Perfil } from '../../entities/perfil.entity';
import { Tela } from '../../entities/tela.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Modulo, Perfil, Tela])],
  controllers: [ModulosController],
  providers: [ModulosService],
  exports: [ModulosService],
})
export class ModulosModule {}
