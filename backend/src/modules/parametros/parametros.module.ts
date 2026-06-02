import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParametrosController } from './parametros.controller';
import { ParametrosService } from './parametros.service';
import { Parametro } from '../../entities/parametro.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Parametro])],
  controllers: [ParametrosController],
  providers: [ParametrosService],
  exports: [ParametrosService],
})
export class ParametrosModule {}
