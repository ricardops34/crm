import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import Keyv from 'keyv';

import { AuthModule } from './modules/auth/auth.module';
import { PerfisModule } from './modules/perfis/perfis.module';
import { ParametrosModule } from './modules/parametros/parametros.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { McvModule } from './modules/mcv/mcv.module';
import { ClientesModule } from './modules/clientes/clientes.module';
import { OrcamentosModule } from './modules/orcamentos/orcamentos.module';

import { Empresa } from './entities/empresa.entity';
import { Usuario } from './entities/usuario.entity';
import { UsuarioEmpresa } from './entities/usuario-empresa.entity';
import { Perfil } from './entities/perfil.entity';
import { Tela } from './entities/tela.entity';
import { Parametro } from './entities/parametro.entity';
import { Cliente } from './entities/cliente.entity';
import { Vendedor } from './entities/vendedor.entity';
import { CarteiraCliente } from './entities/carteira-cliente.entity';
import { Orcamento } from './entities/orcamento.entity';
import { OrcamentoItem } from './entities/orcamento-item.entity';
import { Produto } from './entities/produto.entity';
import { TituloFinanceiro } from './entities/titulo-financeiro.entity';
import { NotaFiscal } from './entities/nota-fiscal.entity';
import { NotaFiscalItem } from './entities/nota-fiscal-item.entity';

const ENTITIES = [
  Empresa, Usuario, UsuarioEmpresa, Perfil, Tela, Parametro,
  Cliente, Vendedor, CarteiraCliente,
  Orcamento, OrcamentoItem, Produto,
  TituloFinanceiro, NotaFiscal, NotaFiscalItem,
];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get('DB_USERNAME', 'crm_user'),
        password: config.get('DB_PASSWORD', 'crm_pass'),
        database: config.get('DB_DATABASE', 'crm_db'),
        entities: ENTITIES,
        synchronize: config.get('NODE_ENV') !== 'production',
        logging: config.get('NODE_ENV') === 'development',
      }),
    }),

    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const keyvRedis = new KeyvRedis(
          `redis://${config.get('REDIS_HOST', 'localhost')}:${config.get('REDIS_PORT', 6379)}`,
        );
        const store = new Keyv({ store: keyvRedis, ttl: 300000, namespace: 'crm' });
        return { stores: [store] };
      },
    }),

    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 900000, limit: 100 }],
    }),

    AuthModule,
    PerfisModule,
    ParametrosModule,
    UsuariosModule,
    McvModule,
    ClientesModule,
    OrcamentosModule,
  ],
})
export class AppModule {}
