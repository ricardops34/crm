import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { Usuario } from '../../entities/usuario.entity';
import { UsuarioEmpresa } from '../../entities/usuario-empresa.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario) private usuariosRepo: Repository<Usuario>,
    @InjectRepository(UsuarioEmpresa) private ueRepo: Repository<UsuarioEmpresa>,
  ) {}

  findAll() {
    return this.usuariosRepo.find({
      relations: ['perfil', 'usuarioEmpresas'],
      select: {
        id: true, nome: true, email: true, ativo: true,
        primeiroAcesso: true, criadoEm: true, perfilId: true,
      },
    });
  }

  async findOne(id: string) {
    const u = await this.usuariosRepo.findOne({
      where: { id },
      relations: ['perfil', 'usuarioEmpresas'],
    });
    if (!u) throw new NotFoundException('Usuário não encontrado.');
    return u;
  }

  async create(dto: CreateUsuarioDto) {
    const existe = await this.usuariosRepo.findOne({ where: { email: dto.email.toLowerCase() } });
    if (existe) throw new BadRequestException('E-mail já cadastrado.');

    const senhaTemp = uuidv4().slice(0, 8) + 'A1!';
    const senhaHash = await bcrypt.hash(senhaTemp, 12);

    const usuario = this.usuariosRepo.create({
      nome: dto.nome,
      email: dto.email.toLowerCase(),
      senhaHash,
      perfilId: dto.perfil_id,
      ativo: dto.ativo ?? true,
      primeiroAcesso: true,
    });

    const saved = await this.usuariosRepo.save(usuario);

    for (const eid of dto.empresa_ids) {
      const ue = this.ueRepo.create({ usuarioId: saved.id, empresaId: eid });
      await this.ueRepo.save(ue);
    }

    return { ...saved, senha_temporaria: senhaTemp };
  }

  async update(id: string, dto: UpdateUsuarioDto) {
    const u = await this.findOne(id);
    if (dto.nome) u.nome = dto.nome;
    if (dto.email) u.email = dto.email.toLowerCase();
    if (dto.perfil_id) u.perfilId = dto.perfil_id;

    if (dto.empresa_ids) {
      await this.ueRepo.delete({ usuarioId: id });
      for (const eid of dto.empresa_ids) {
        await this.ueRepo.save(this.ueRepo.create({ usuarioId: id, empresaId: eid }));
      }
    }

    return this.usuariosRepo.save(u);
  }

  async resetSenha(id: string) {
    const u = await this.findOne(id);
    const senhaTemp = uuidv4().slice(0, 8) + 'A1!';
    u.senhaHash = await bcrypt.hash(senhaTemp, 12);
    u.primeiroAcesso = true;
    await this.usuariosRepo.save(u);
    return { senha_temporaria: senhaTemp };
  }

  async toggleAtivo(id: string, ativo: boolean) {
    const u = await this.findOne(id);
    u.ativo = ativo;
    return this.usuariosRepo.save(u);
  }
}
