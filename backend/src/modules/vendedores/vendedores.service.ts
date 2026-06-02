import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vendedor } from '../../entities/vendedor.entity';
import { CreateVendedorDto } from './dto/create-vendedor.dto';
import { UpdateVendedorDto } from './dto/update-vendedor.dto';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

@Injectable()
export class VendedoresService {
  constructor(
    @InjectRepository(Vendedor) private repo: Repository<Vendedor>,
  ) {}

  findAll(empresaId: number) {
    return this.repo.find({
      where: { empresaId },
      relations: ['usuario'],
      order: { tipo: 'ASC', nome: 'ASC' },
    });
  }

  async findOne(id: string, empresaId: number) {
    const v = await this.repo.findOne({
      where: { id, empresaId },
      relations: ['usuario', 'supervisor', 'subordinados'],
    });
    if (!v) throw new NotFoundException('Vendedor não encontrado.');
    return v;
  }

  async findByUsuario(usuarioId: string, empresaId: number): Promise<Vendedor | null> {
    return this.repo.findOne({ where: { usuarioId, empresaId } });
  }

  async create(dto: CreateVendedorDto) {
    if (dto.usuario_id) {
      const jaVinculado = await this.repo.findOne({
        where: { usuarioId: dto.usuario_id, empresaId: dto.empresa_id },
      });
      if (jaVinculado) {
        throw new BadRequestException('Este usuário já está vinculado a um vendedor nesta empresa.');
      }
    }

    const vendedor = this.repo.create({
      empresaId: dto.empresa_id,
      codErp: dto.cod_erp,
      nome: dto.nome,
      tipo: dto.tipo ?? 'vendedor',
      usuarioId: dto.usuario_id ?? null,
      supervisorId: dto.supervisor_id ?? null,
      gerenteId: dto.gerente_id ?? null,
      ativo: dto.ativo ?? true,
    });
    return this.repo.save(vendedor);
  }

  async update(id: string, empresaId: number, dto: UpdateVendedorDto) {
    const v = await this.findOne(id, empresaId);
    Object.assign(v, {
      nome: dto.nome ?? v.nome,
      tipo: dto.tipo ?? v.tipo,
      usuarioId: dto.usuario_id !== undefined ? dto.usuario_id : v.usuarioId,
      supervisorId: dto.supervisor_id !== undefined ? dto.supervisor_id : v.supervisorId,
      gerenteId: dto.gerente_id !== undefined ? dto.gerente_id : v.gerenteId,
      ativo: dto.ativo ?? v.ativo,
    });
    return this.repo.save(v);
  }

  async getSubordinados(vendedorId: string): Promise<Vendedor[]> {
    return this.repo.find({ where: { supervisorId: vendedorId } });
  }

  async getHierarquia(usuarioId: string, empresaId: number) {
    const vendedor = await this.repo.findOne({
      where: { usuarioId, empresaId },
      relations: ['supervisor', 'supervisor.usuario'],
    });
    if (!vendedor) return null;

    if (vendedor.tipo === 'vendedor') {
      return { vendedor, supervisor: vendedor.supervisor ?? null, gerente: null };
    }

    if (vendedor.tipo === 'supervisor') {
      const subordinados = await this.repo.find({
        where: { supervisorId: vendedor.id },
        relations: ['usuario'],
      });
      return { vendedor, subordinados };
    }

    if (vendedor.tipo === 'gerente') {
      const supervisores = await this.repo.find({
        where: { gerenteId: vendedor.id },
        relations: ['usuario', 'subordinados'],
      });
      return { vendedor, supervisores };
    }

    return { vendedor };
  }
}
