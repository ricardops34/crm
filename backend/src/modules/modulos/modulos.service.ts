import {
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

import { Modulo } from '../../entities/modulo.entity';
import { Perfil } from '../../entities/perfil.entity';
import { Tela } from '../../entities/tela.entity';
import { CreateModuloDto, UpdatePerfilModulosDto } from './dto/create-modulo.dto';
import type { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

export interface ModuloComTelas {
  id: string;
  nome: string;
  icone: string;
  ordem: number;
  somenteAdmin: boolean;
  telas: Pick<Tela, 'id' | 'codigo' | 'nome' | 'icone' | 'rota' | 'ordem'>[];
}

@Injectable()
export class ModulosService {
  constructor(
    @InjectRepository(Modulo) private moduloRepo: Repository<Modulo>,
    @InjectRepository(Perfil) private perfilRepo: Repository<Perfil>,
    @InjectRepository(Tela) private telaRepo: Repository<Tela>,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  findAll() {
    return this.moduloRepo.find({
      relations: ['telas', 'perfis'],
      order: { ordem: 'ASC' },
    });
  }

  async findOne(id: string) {
    const m = await this.moduloRepo.findOne({ where: { id }, relations: ['telas', 'perfis'] });
    if (!m) throw new NotFoundException('Módulo não encontrado.');
    return m;
  }

  create(dto: CreateModuloDto) {
    const m = this.moduloRepo.create({
      nome: dto.nome,
      icone: dto.icone,
      ordem: dto.ordem ?? 0,
      somenteAdmin: dto.somente_admin ?? false,
    });
    return this.moduloRepo.save(m);
  }

  async update(id: string, dto: Partial<CreateModuloDto>) {
    const m = await this.findOne(id);
    if (dto.nome) m.nome = dto.nome;
    if (dto.icone) m.icone = dto.icone;
    if (dto.ordem !== undefined) m.ordem = dto.ordem;
    if (dto.somente_admin !== undefined) m.somenteAdmin = dto.somente_admin;
    return this.moduloRepo.save(m);
  }

  async toggleAtivo(id: string) {
    const m = await this.findOne(id);
    m.ativo = !m.ativo;
    return this.moduloRepo.save(m);
  }

  async updatePerfis(id: string, dto: UpdatePerfilModulosDto) {
    const modulo = await this.findOne(id);
    const perfis = await this.perfilRepo.findBy({ id: In(dto.perfil_ids) });
    modulo.perfis = perfis;
    await this.moduloRepo.save(modulo);
    await this.invalidarCachesPerfis(dto.perfil_ids);
    return modulo;
  }

  async addTela(moduloId: string, telaId: string) {
    const modulo = await this.findOne(moduloId);
    const tela = await this.telaRepo.findOne({ where: { id: telaId } });
    if (!tela) throw new NotFoundException('Tela não encontrada.');
    tela.moduloId = moduloId;
    await this.telaRepo.save(tela);
    return modulo;
  }

  async removeTela(moduloId: string, telaId: string) {
    const tela = await this.telaRepo.findOne({ where: { id: telaId, moduloId } });
    if (!tela) throw new NotFoundException('Tela não encontrada neste módulo.');
    tela.moduloId = null;
    await this.telaRepo.save(tela);
  }

  /** Constrói a estrutura de módulos para o JWT do usuário */
  async buildModulosParaJwt(perfilNome: string, perfilId: string): Promise<ModuloComTelas[]> {
    const isAdmin = perfilNome === 'Admin';

    let modulos: Modulo[];
    if (isAdmin) {
      modulos = await this.moduloRepo.find({
        where: { ativo: true },
        relations: ['telas'],
        order: { ordem: 'ASC' },
      });
    } else {
      const perfil = await this.perfilRepo.findOne({
        where: { id: perfilId },
        relations: ['modulos', 'modulos.telas', 'telas'],
      });
      if (!perfil) return [];
      modulos = (perfil.modulos ?? []).filter((m) => m.ativo && !m.somenteAdmin);
    }

    return modulos.map((m) => ({
      id: m.id,
      nome: m.nome,
      icone: m.icone,
      ordem: m.ordem,
      somenteAdmin: m.somenteAdmin,
      telas: (m.telas ?? [])
        .filter((t) => t.ativo)
        .sort((a, b) => a.ordem - b.ordem)
        .map((t) => ({
          id: t.id,
          codigo: t.codigo,
          nome: t.nome,
          icone: t.icone,
          rota: t.rota,
          ordem: t.ordem,
        })),
    }));
  }

  private async invalidarCachesPerfis(ids: string[]) {
    for (const id of ids) {
      await this.cache.del(`perfil:telas:${id}`);
      await this.cache.del(`perfil:versao:${id}`);
    }
  }
}
