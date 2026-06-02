import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientesController } from './clientes.controller';
import { ClientesService } from './clientes.service';
import { Cliente } from '../../entities/cliente.entity';
import { TituloFinanceiro } from '../../entities/titulo-financeiro.entity';
import { NotaFiscal } from '../../entities/nota-fiscal.entity';
import { NotaFiscalItem } from '../../entities/nota-fiscal-item.entity';
import { Orcamento } from '../../entities/orcamento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cliente, TituloFinanceiro, NotaFiscal, NotaFiscalItem, Orcamento])],
  controllers: [ClientesController],
  providers: [ClientesService],
  exports: [ClientesService],
})
export class ClientesModule {}
