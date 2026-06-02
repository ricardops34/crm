import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Or, Repository } from 'typeorm';
import { Noticia } from '../../entities/noticia.entity';
import { CreateNoticiaDto } from './dto/create-noticia.dto';
import type { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

@Injectable()
export class NoticiasService {
  constructor(
    @InjectRepository(Noticia) private repo: Repository<Noticia>,
  ) {}

  async findParaUsuario(usuario: JwtPayload): Promise<Noticia[]> {
    const hoje = new Date().toISOString().split('T')[0];

    const todas = await this.repo
      .createQueryBuilder('n')
      .where(
        '(n.empresa_id = :emp OR n.empresa_id IS NULL)',
        { emp: usuario.empresa_id },
      )
      .andWhere('n.ativo = true')
      .andWhere('n.data_inicio <= :hoje', { hoje })
      .andWhere('(n.data_fim IS NULL OR n.data_fim >= :hoje)', { hoje })
      .orderBy('n.categoria', 'ASC')
      .addOrderBy('n.criado_em', 'DESC')
      .getMany();

    return todas.filter((n) => {
      if (!n.perfisAlvo || n.perfisAlvo.length === 0) return true;
      return n.perfisAlvo.includes(usuario.perfil_nome);
    });
  }

  findAll() {
    return this.repo.find({ order: { criadoEm: 'DESC' } });
  }

  async findOne(id: string) {
    const n = await this.repo.findOne({ where: { id } });
    if (!n) throw new NotFoundException('Notícia não encontrada.');
    return n;
  }

  create(dto: CreateNoticiaDto, autorId: string) {
    const n = this.repo.create({
      empresaId: dto.empresa_id ?? null,
      categoria: dto.categoria,
      titulo: dto.titulo,
      conteudo: dto.conteudo,
      perfisAlvo: dto.perfis_alvo ?? null,
      dataInicio: dto.data_inicio,
      dataFim: dto.data_fim ?? null,
      autorId,
    });
    return this.repo.save(n);
  }

  async update(id: string, dto: Partial<CreateNoticiaDto>) {
    const n = await this.findOne(id);
    Object.assign(n, {
      titulo: dto.titulo ?? n.titulo,
      conteudo: dto.conteudo ?? n.conteudo,
      dataInicio: dto.data_inicio ?? n.dataInicio,
      dataFim: dto.data_fim !== undefined ? dto.data_fim : n.dataFim,
      perfisAlvo: dto.perfis_alvo !== undefined ? dto.perfis_alvo : n.perfisAlvo,
    });
    return this.repo.save(n);
  }

  async toggleAtivo(id: string) {
    const n = await this.findOne(id);
    n.ativo = !n.ativo;
    return this.repo.save(n);
  }
}
