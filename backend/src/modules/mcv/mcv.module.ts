import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { McvController } from './mcv.controller';
import { McvService } from './mcv.service';
import { CarteiraCliente } from '../../entities/carteira-cliente.entity';
import { Vendedor } from '../../entities/vendedor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CarteiraCliente, Vendedor])],
  controllers: [McvController],
  providers: [McvService],
})
export class McvModule {}
