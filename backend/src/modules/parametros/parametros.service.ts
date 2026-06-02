import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

import { Parametro } from '../../entities/parametro.entity';
import { UpdateParametroDto } from './dto/update-parametro.dto';

const AES_KEY = process.env.PARAMS_ENCRYPTION_KEY ?? '00000000000000000000000000000000';
const MASK = '••••••••';

@Injectable()
export class ParametrosService {
  constructor(
    @InjectRepository(Parametro) private repo: Repository<Parametro>,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  async findAll() {
    const params = await this.repo.find({ order: { grupo: 'ASC', chave: 'ASC' } });
    return params.map((p) => this.mascarar(p));
  }

  async findByGrupo(grupo: string) {
    const params = await this.repo.find({ where: { grupo }, order: { chave: 'ASC' } });
    return params.map((p) => this.mascarar(p));
  }

  async update(grupo: string, chave: string, dto: UpdateParametroDto) {
    const param = await this.repo.findOne({ where: { grupo, chave } });
    if (!param) throw new NotFoundException(`Parâmetro ${grupo}.${chave} não encontrado.`);

    param.valor = param.sensivel && dto.valor
      ? this.encrypt(dto.valor)
      : (dto.valor ?? null);

    await this.repo.save(param);
    await this.invalidarCache(param.empresaId, grupo, chave);

    return this.mascarar(param);
  }

  async updateGrupo(grupo: string, updates: Record<string, string | null>) {
    const params = await this.repo.find({ where: { grupo } });
    for (const param of params) {
      const novoValor = updates[param.chave];
      if (novoValor !== undefined) {
        param.valor = param.sensivel && novoValor
          ? this.encrypt(novoValor)
          : novoValor;
        await this.repo.save(param);
        await this.invalidarCache(param.empresaId, grupo, param.chave);
      }
    }
    return this.findByGrupo(grupo);
  }

  async get(empresaId: number | null, grupo: string, chave: string): Promise<string | null> {
    const cacheKey = `parametros:${empresaId ?? 'global'}:${grupo}:${chave}`;
    const cached = await this.cache.get<string>(cacheKey);
    if (cached !== undefined && cached !== null) return cached;

    let param = await this.repo.findOne({
      where: { empresaId: empresaId ?? (IsNull() as any), grupo, chave },
    });
    if (!param && empresaId !== null) {
      param = await this.repo.findOne({ where: { empresaId: IsNull() as any, grupo, chave } });
    }

    const valor = param?.sensivel && param?.valor ? this.decrypt(param.valor) : (param?.valor ?? null);
    if (valor) await this.cache.set(cacheKey, valor, 300000);
    return valor;
  }

  private mascarar(p: Parametro): Partial<Parametro> & { valor: string | null } {
    return { ...p, valor: p.sensivel && p.valor ? MASK : p.valor };
  }

  private encrypt(text: string): string {
    // Simples XOR com a chave — em produção usar crypto AES-256-CBC
    const key = Buffer.from(AES_KEY.padEnd(32, '0').slice(0, 32));
    const buf = Buffer.from(text, 'utf8');
    const enc = Buffer.alloc(buf.length);
    for (let i = 0; i < buf.length; i++) enc[i] = buf[i] ^ key[i % key.length];
    return enc.toString('base64');
  }

  private decrypt(encoded: string): string {
    return this.encrypt(Buffer.from(encoded, 'base64').toString('utf8'));
  }

  private async invalidarCache(empresaId: number | null, grupo: string, chave: string) {
    await this.cache.del(`parametros:${empresaId ?? 'global'}:${grupo}:${chave}`);
  }
}
