import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CarteiraCliente } from '../../entities/carteira-cliente.entity';
import { Vendedor } from '../../entities/vendedor.entity';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

export interface McvFiltros {
  dias?: number;
  bloqueados?: boolean;
  ativos?: boolean;
}

@Injectable()
export class McvService {
  constructor(
    @InjectRepository(CarteiraCliente) private carteiraRepo: Repository<CarteiraCliente>,
    @InjectRepository(Vendedor) private vendedorRepo: Repository<Vendedor>,
  ) {}

  async getCarteira(usuario: JwtPayload, filtros: McvFiltros) {
    const vendedor = await this.vendedorRepo.findOne({
      where: { usuarioId: usuario.sub, empresaId: usuario.empresa_id },
    });

    const qb = this.carteiraRepo
      .createQueryBuilder('cc')
      .innerJoinAndSelect('cc.cliente', 'c')
      .where('cc.empresa_id = :empresaId', { empresaId: usuario.empresa_id });

    // Vendedor: apenas sua carteira
    // Supervisor/Gerente: subordinados também
    if (vendedor) {
      if (vendedor.tipo === 'vendedor') {
        qb.andWhere('cc.vendedor_id = :vendedorId', { vendedorId: vendedor.id });
      } else if (vendedor.tipo === 'supervisor') {
        const subordinados = await this.vendedorRepo.find({
          where: { supervisorId: vendedor.id },
        });
        const ids = [vendedor.id, ...subordinados.map((v) => v.id)];
        qb.andWhere('cc.vendedor_id IN (:...ids)', { ids });
      } else if (vendedor.tipo === 'gerente') {
        const supervisores = await this.vendedorRepo.find({
          where: { gerenteId: vendedor.id },
        });
        const supIds = supervisores.map((v) => v.id);
        const vendedores = supIds.length
          ? await this.vendedorRepo
              .createQueryBuilder('v')
              .where('v.supervisorId IN (:...supIds)', { supIds })
              .orWhere('v.gerenteId = :gerenteId', { gerenteId: vendedor.id })
              .getMany()
          : [];
        const ids = [vendedor.id, ...vendedores.map((v) => v.id)];
        qb.andWhere('cc.vendedor_id IN (:...ids)', { ids });
      }
    }

    // Filtros
    if (filtros.bloqueados) {
      qb.andWhere('c.bloqueado = true');
    } else if (filtros.ativos) {
      qb.andWhere('c.bloqueado = false');
    }

    if (filtros.dias) {
      qb.andWhere(
        `(c.ultima_compra IS NULL OR c.ultima_compra <= NOW() - INTERVAL '${filtros.dias} days')`,
      );
    }

    qb.orderBy('c.ultima_compra', 'ASC', 'NULLS FIRST');

    const carteira = await qb.getMany();

    return carteira.map((cc) => {
      const c = cc.cliente;
      const hoje = new Date();
      const ultimaCompra = c.ultimaCompra ? new Date(c.ultimaCompra) : null;
      const diasSemComprar = ultimaCompra
        ? Math.floor((hoje.getTime() - ultimaCompra.getTime()) / 86400000)
        : null;

      return {
        id: c.id,
        codErp: c.codErp,
        razaoSocial: c.razaoSocial,
        cidade: c.cidade,
        situacao: c.situacao,
        bloqueado: c.bloqueado,
        ultimaCompra: c.ultimaCompra,
        diasSemComprar,
        venda30d: Number(c.venda30d),
        media90d: Number(c.media90d),
        difMesMedia: Number(c.venda30d) - Number(c.media90d),
        temComodato: c.temComodato,
      };
    });
  }
}
