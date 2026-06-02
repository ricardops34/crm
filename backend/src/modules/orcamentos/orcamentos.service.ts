import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

import { Orcamento } from '../../entities/orcamento.entity';
import { OrcamentoItem } from '../../entities/orcamento-item.entity';
import { Vendedor } from '../../entities/vendedor.entity';
import { Parametro } from '../../entities/parametro.entity';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { CreateOrcamentoDto } from './dto/create-orcamento.dto';

@Injectable()
export class OrcamentosService {
  constructor(
    @InjectRepository(Orcamento) private orcRepo: Repository<Orcamento>,
    @InjectRepository(OrcamentoItem) private itemRepo: Repository<OrcamentoItem>,
    @InjectRepository(Vendedor) private vendedorRepo: Repository<Vendedor>,
    @InjectRepository(Parametro) private paramRepo: Repository<Parametro>,
  ) {}

  async findAll(usuario: JwtPayload, clienteId?: string, status?: string) {
    const qb = this.orcRepo
      .createQueryBuilder('o')
      .where('o.empresa_id = :emp', { emp: usuario.empresa_id })
      .orderBy('o.criado_em', 'DESC');

    if (clienteId) qb.andWhere('o.cliente_id = :clienteId', { clienteId });
    if (status) qb.andWhere('o.status = :status', { status });

    const vendedor = await this.vendedorRepo.findOne({
      where: { usuarioId: usuario.sub, empresaId: usuario.empresa_id },
    });

    if (vendedor?.tipo === 'vendedor') {
      qb.andWhere('o.vendedor_id = :vendedorId', { vendedorId: vendedor.id });
    }

    return qb.getMany();
  }

  async findOne(id: string, empresaId: number) {
    const o = await this.orcRepo.findOne({
      where: { id, empresaId },
      relations: ['itens'],
    });
    if (!o) throw new NotFoundException('Orçamento não encontrado.');
    return o;
  }

  async create(dto: CreateOrcamentoDto, usuario: JwtPayload) {
    const vendedor = await this.vendedorRepo.findOne({
      where: { usuarioId: usuario.sub, empresaId: usuario.empresa_id },
    });

    const validadeDias = await this.getParametro(usuario.empresa_id, 'orcamento', 'orcamento.validade_dias');
    const dias = parseInt(validadeDias ?? '30', 10);
    const validade = new Date();
    validade.setDate(validade.getDate() + dias);

    const ultimo = await this.orcRepo
      .createQueryBuilder()
      .select('MAX(numero_portal)', 'max')
      .getRawOne();
    const numeroPortal = (ultimo?.max ?? 0) + 1;

    const itens = dto.itens.map((item) => {
      const valorTotal =
        item.quantidade * item.preco_unitario * (1 - (item.desconto_pct ?? 0) / 100);
      return this.itemRepo.create({
        codProduto: item.cod_produto,
        descricao: item.descricao,
        quantidade: item.quantidade,
        precoUnitario: item.preco_unitario,
        descontoPct: item.desconto_pct ?? 0,
        valorTotal,
        produtoId: item.produto_id ?? null,
        estoqueDisponivel: item.estoque_disponivel ?? null,
        semEstoque: (item.estoque_disponivel ?? 1) <= 0,
      });
    });

    const valorTotal = itens.reduce((sum, i) => sum + Number(i.valorTotal), 0);

    const orc = this.orcRepo.create({
      numeroPortal,
      empresaId: usuario.empresa_id,
      clienteId: dto.cliente_id,
      vendedorId: vendedor?.id ?? '',
      usuarioId: usuario.sub,
      status: 'rascunho',
      origem: dto.origem ?? null,
      observacao: dto.observacao ?? null,
      orcamentoOrigemId: dto.orcamento_origem_id ?? null,
      validade: validade.toISOString().split('T')[0],
      valorTotal,
      itens,
    });

    return this.orcRepo.save(orc);
  }

  async enviar(id: string, usuario: JwtPayload) {
    const orc = await this.findOne(id, usuario.empresa_id);
    if (orc.status !== 'rascunho') {
      throw new BadRequestException('Apenas orçamentos em rascunho podem ser enviados.');
    }
    orc.status = 'enviado';
    orc.enviadoEm = new Date();
    return this.orcRepo.save(orc);
  }

  async copiar(id: string, usuario: JwtPayload) {
    const original = await this.findOne(id, usuario.empresa_id);
    const dto: CreateOrcamentoDto = {
      cliente_id: original.clienteId,
      origem: original.origem ?? undefined,
      observacao: original.observacao ?? undefined,
      orcamento_origem_id: original.id,
      itens: original.itens.map((i) => ({
        produto_id: i.produtoId ?? undefined,
        cod_produto: i.codProduto,
        descricao: i.descricao,
        quantidade: Number(i.quantidade),
        preco_unitario: Number(i.precoUnitario),
        desconto_pct: Number(i.descontoPct),
        estoque_disponivel: i.estoqueDisponivel ? Number(i.estoqueDisponivel) : undefined,
      })),
    };
    return this.create(dto, usuario);
  }

  private async getParametro(empresaId: number, grupo: string, chave: string): Promise<string | null> {
    let p = await this.paramRepo.findOne({ where: { empresaId, grupo, chave } });
    if (!p) p = await this.paramRepo.findOne({ where: { empresaId: IsNull() as any, grupo, chave } });
    return p?.valor ?? null;
  }
}
