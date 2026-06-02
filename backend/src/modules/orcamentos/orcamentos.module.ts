import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrcamentosController } from './orcamentos.controller';
import { OrcamentosService } from './orcamentos.service';
import { OrcamentoPdfService } from './orcamento-pdf.service';
import { Orcamento } from '../../entities/orcamento.entity';
import { OrcamentoItem } from '../../entities/orcamento-item.entity';
import { Vendedor } from '../../entities/vendedor.entity';
import { Parametro } from '../../entities/parametro.entity';
import { Empresa } from '../../entities/empresa.entity';
import { Cliente } from '../../entities/cliente.entity';
import { LogEnvioOrcamento } from '../../entities/log-envio-orcamento.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Orcamento, OrcamentoItem, Vendedor, Parametro,
      Empresa, Cliente, LogEnvioOrcamento,
    ]),
  ],
  controllers: [OrcamentosController],
  providers: [OrcamentosService, OrcamentoPdfService],
})
export class OrcamentosModule {}
