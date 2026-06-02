import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CarteiraCliente } from '../../entities/carteira-cliente.entity';
import { Vendedor } from '../../entities/vendedor.entity';
import { TituloFinanceiro } from '../../entities/titulo-financeiro.entity';
import type { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

@Injectable()
export class HomeService {
  constructor(
    @InjectRepository(CarteiraCliente) private carteiraRepo: Repository<CarteiraCliente>,
    @InjectRepository(Vendedor) private vendedorRepo: Repository<Vendedor>,
    @InjectRepository(TituloFinanceiro) private titulosRepo: Repository<TituloFinanceiro>,
  ) {}

  async getIndicadores(usuario: JwtPayload) {
    const vendedor = await this.vendedorRepo.findOne({
      where: { usuarioId: usuario.sub, empresaId: usuario.empresa_id },
    });

    const resultado: Record<string, any> = {};

    if (vendedor) {
      const idVendedor = vendedor.id;
      const hoje = new Date();

      // Carteira total
      const totalCarteira = await this.carteiraRepo.count({
        where: { vendedorId: idVendedor, empresaId: usuario.empresa_id },
      });

      // Clientes sem compra nos últimos 30 dias
      const semCompra30 = await this.carteiraRepo
        .createQueryBuilder('cc')
        .innerJoin('cc.cliente', 'c')
        .where('cc.vendedor_id = :vid', { vid: idVendedor })
        .andWhere('cc.empresa_id = :emp', { emp: usuario.empresa_id })
        .andWhere(
          `(c.ultima_compra IS NULL OR c.ultima_compra <= :limite)`,
          { limite: new Date(hoje.getTime() - 30 * 86400000).toISOString().split('T')[0] },
        )
        .getCount();

      // Clientes bloqueados
      const bloqueados = await this.carteiraRepo
        .createQueryBuilder('cc')
        .innerJoin('cc.cliente', 'c')
        .where('cc.vendedor_id = :vid AND cc.empresa_id = :emp', {
          vid: idVendedor,
          emp: usuario.empresa_id,
        })
        .andWhere('c.bloqueado = true')
        .getCount();

      // Vendas 30 dias (soma)
      const vendas30 = await this.carteiraRepo
        .createQueryBuilder('cc')
        .innerJoin('cc.cliente', 'c')
        .select('SUM(c.venda_30d)', 'total')
        .where('cc.vendedor_id = :vid AND cc.empresa_id = :emp', {
          vid: idVendedor,
          emp: usuario.empresa_id,
        })
        .getRawOne();

      resultado.carteira = {
        total: totalCarteira,
        semCompra30,
        bloqueados,
        vendas30d: Number(vendas30?.total ?? 0),
      };
    }

    // Títulos em aberto da empresa (para perfis financeiros/admin)
    if (['Admin', 'Administrativo', 'Financeiro', 'Gerente'].includes(usuario.perfil_nome)) {
      const titulosAberto = await this.titulosRepo
        .createQueryBuilder('t')
        .select('COUNT(*)', 'qtd')
        .addSelect('SUM(t.valor)', 'total')
        .where('t.empresa_id = :emp', { emp: usuario.empresa_id })
        .getRawOne();

      resultado.financeiro = {
        titulosAbertoQtd: Number(titulosAberto?.qtd ?? 0),
        titulosAbertoTotal: Number(titulosAberto?.total ?? 0),
      };
    }

    return resultado;
  }
}
