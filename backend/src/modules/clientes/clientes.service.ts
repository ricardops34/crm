import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Cliente } from '../../entities/cliente.entity';
import { TituloFinanceiro } from '../../entities/titulo-financeiro.entity';
import { NotaFiscal } from '../../entities/nota-fiscal.entity';
import { Orcamento } from '../../entities/orcamento.entity';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente) private clientesRepo: Repository<Cliente>,
    @InjectRepository(TituloFinanceiro) private titulosRepo: Repository<TituloFinanceiro>,
    @InjectRepository(NotaFiscal) private notasRepo: Repository<NotaFiscal>,
    @InjectRepository(Orcamento) private orcamentosRepo: Repository<Orcamento>,
  ) {}

  async findOne(id: string, empresaId: number) {
    const c = await this.clientesRepo.findOne({ where: { id, empresaId } });
    if (!c) throw new NotFoundException('Cliente não encontrado.');
    return c;
  }

  async getCadastro(id: string, usuario: JwtPayload) {
    const cliente = await this.findOne(id, usuario.empresa_id);

    const hoje = new Date();
    const ultimaCompra = cliente.ultimaCompra ? new Date(cliente.ultimaCompra) : null;
    const diasSemComprar = ultimaCompra
      ? Math.floor((hoje.getTime() - ultimaCompra.getTime()) / 86400000)
      : null;

    const titulosAberto = await this.titulosRepo
      .createQueryBuilder('t')
      .select('SUM(t.valor)', 'total')
      .where('t.cliente_id = :id AND t.empresa_id = :emp', { id, emp: usuario.empresa_id })
      .getRawOne();

    return {
      ...cliente,
      diasSemComprar,
      titulosAberto: Number(titulosAberto?.total ?? 0),
    };
  }

  async getFinanceiro(id: string, empresaId: number) {
    return this.titulosRepo.find({
      where: { clienteId: id, empresaId },
      order: { vencimento: 'ASC' },
    });
  }

  async getNotasFiscais(id: string, empresaId: number) {
    return this.notasRepo.find({
      where: { clienteId: id, empresaId },
      relations: ['itens'],
      order: { dataEmissao: 'DESC' },
    });
  }

  async getOrcamentos(id: string, empresaId: number) {
    return this.orcamentosRepo.find({
      where: { clienteId: id, empresaId },
      order: { criadoEm: 'DESC' },
    });
  }

  async getMix(id: string, empresaId: number) {
    return this.notasRepo
      .createQueryBuilder('nf')
      .innerJoin('nf.itens', 'i')
      .select([
        'i.cod_produto AS "codProduto"',
        'i.descricao AS descricao',
        'SUM(i.quantidade) AS quantidade',
        'MAX(nf.data_emissao) AS "ultimaCompra"',
        'SUM(i.valor_total) AS "valorTotal"',
        'COUNT(DISTINCT nf.id) AS frequencia',
      ])
      .where('nf.cliente_id = :id AND nf.empresa_id = :emp', { id, emp: empresaId })
      .groupBy('i.cod_produto, i.descricao')
      .orderBy('"ultimaCompra"', 'DESC')
      .getRawMany();
  }
}
