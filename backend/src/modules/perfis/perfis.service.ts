import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

import { Perfil } from '../../entities/perfil.entity';
import { Tela } from '../../entities/tela.entity';
import { CreatePerfilDto } from './dto/create-perfil.dto';
import { UpdatePerfilTelasDto } from './dto/update-perfil-telas.dto';

@Injectable()
export class PerfisService {
  constructor(
    @InjectRepository(Perfil) private perfisRepo: Repository<Perfil>,
    @InjectRepository(Tela) private telasRepo: Repository<Tela>,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  findAll() {
    return this.perfisRepo.find({ relations: ['telas'] });
  }

  async findOne(id: string) {
    const perfil = await this.perfisRepo.findOne({ where: { id }, relations: ['telas'] });
    if (!perfil) throw new NotFoundException('Perfil não encontrado.');
    return perfil;
  }

  async create(dto: CreatePerfilDto) {
    const perfil = this.perfisRepo.create({ ...dto, versao: 1 });
    return this.perfisRepo.save(perfil);
  }

  async update(id: string, dto: CreatePerfilDto) {
    const perfil = await this.findOne(id);
    Object.assign(perfil, dto);
    return this.perfisRepo.save(perfil);
  }

  async remove(id: string) {
    const perfil = await this.findOne(id);
    if (perfil.sistema) throw new BadRequestException('Perfil de sistema não pode ser excluído.');
    if (perfil.usuarios?.length) throw new BadRequestException('Perfil possui usuários vinculados.');
    return this.perfisRepo.remove(perfil);
  }

  async getTelas(id: string) {
    const perfil = await this.findOne(id);
    return perfil.telas ?? [];
  }

  async updateTelas(id: string, dto: UpdatePerfilTelasDto) {
    const perfil = await this.findOne(id);
    if (perfil.nome === 'Admin') {
      throw new BadRequestException('Não é permitido alterar telas do perfil Admin por esta rota.');
    }

    const telas = await this.telasRepo.findBy({ id: In(dto.tela_ids) });
    perfil.telas = telas;
    perfil.versao += 1;

    await this.perfisRepo.save(perfil);

    // Invalida cache
    await this.cache.del(`perfil:telas:${id}`);
    await this.cache.del(`perfil:versao:${id}`);

    return perfil;
  }

  async addTela(id: string, telaId: string) {
    const perfil = await this.findOne(id);
    const tela = await this.telasRepo.findOne({ where: { id: telaId } });
    if (!tela) throw new NotFoundException('Tela não encontrada.');

    perfil.telas = [...(perfil.telas ?? []), tela];
    perfil.versao += 1;
    await this.perfisRepo.save(perfil);
    await this.invalidarCache(id);
    return perfil;
  }

  async removeTela(id: string, telaId: string) {
    const perfil = await this.findOne(id);
    if (perfil.nome === 'Admin') {
      throw new BadRequestException('Não é permitido remover telas do perfil Admin.');
    }
    perfil.telas = (perfil.telas ?? []).filter((t) => t.id !== telaId);
    perfil.versao += 1;
    await this.perfisRepo.save(perfil);
    await this.invalidarCache(id);
    return perfil;
  }

  findAllTelas() {
    return this.telasRepo.find({ order: { modulo: 'ASC', ordem: 'ASC' } });
  }

  private async invalidarCache(perfilId: string) {
    await this.cache.del(`perfil:telas:${perfilId}`);
    await this.cache.del(`perfil:versao:${perfilId}`);
  }
}
