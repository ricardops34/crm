import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import { CarteiraCliente } from '../../entities/carteira-cliente.entity';
import { Vendedor } from '../../entities/vendedor.entity';
import { TituloFinanceiro } from '../../entities/titulo-financeiro.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CarteiraCliente, Vendedor, TituloFinanceiro])],
  controllers: [HomeController],
  providers: [HomeService],
})
export class HomeModule {}
