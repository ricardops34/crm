import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PerfisController } from './perfis.controller';
import { PerfisService } from './perfis.service';
import { Perfil } from '../../entities/perfil.entity';
import { Tela } from '../../entities/tela.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Perfil, Tela])],
  controllers: [PerfisController],
  providers: [PerfisService],
  exports: [PerfisService],
})
export class PerfisModule {}
