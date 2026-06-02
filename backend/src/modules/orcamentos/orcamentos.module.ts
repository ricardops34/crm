import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrcamentosController } from './orcamentos.controller';
import { OrcamentosService } from './orcamentos.service';
import { Orcamento } from '../../entities/orcamento.entity';
import { OrcamentoItem } from '../../entities/orcamento-item.entity';
import { Vendedor } from '../../entities/vendedor.entity';
import { Parametro } from '../../entities/parametro.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Orcamento, OrcamentoItem, Vendedor, Parametro])],
  controllers: [OrcamentosController],
  providers: [OrcamentosService],
})
export class OrcamentosModule {}
