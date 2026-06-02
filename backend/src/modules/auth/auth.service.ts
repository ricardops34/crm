import {
  BadRequestException,
  Inject,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

import { Usuario } from '../../entities/usuario.entity';
import { Perfil } from '../../entities/perfil.entity';
import { Parametro } from '../../entities/parametro.entity';
import type { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { LoginDto } from './dto/login.dto';
import { AlterarSenhaDto } from './dto/alterar-senha.dto';
import { EsqueciSenhaDto } from './dto/esqueci-senha.dto';
import { RedefinirSenhaDto } from './dto/redefinir-senha.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private usuariosRepo: Repository<Usuario>,
    @InjectRepository(Perfil)
    private perfisRepo: Repository<Perfil>,
    @InjectRepository(Parametro)
    private parametrosRepo: Repository<Parametro>,
    private jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  async login(dto: LoginDto) {
    const usuario = await this.usuariosRepo.findOne({
      where: { email: dto.email.toLowerCase() },
      relations: ['perfil', 'perfil.telas', 'usuarioEmpresas'],
    });

    if (!usuario) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const senhaValida = await bcrypt.compare(dto.senha, usuario.senhaHash);
    if (!senhaValida) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (!usuario.ativo) {
      throw new UnauthorizedException('Usuário inativo');
    }

    return this.emitirToken(usuario);
  }

  async trocarEmpresa(usuarioId: string, empresaId: number) {
    const usuario = await this.usuariosRepo.findOne({
      where: { id: usuarioId },
      relations: ['perfil', 'perfil.telas', 'usuarioEmpresas'],
    });

    if (!usuario) throw new UnauthorizedException();

    const empresas = usuario.usuarioEmpresas.map((ue) => ue.empresaId);
    if (!empresas.includes(empresaId)) {
      throw new UnauthorizedException('Empresa não autorizada para este usuário.');
    }

    return this.emitirToken(usuario, empresaId);
  }

  async me(payload: JwtPayload) {
    const usuario = await this.usuariosRepo.findOne({
      where: { id: payload.sub },
      relations: ['perfil', 'perfil.telas', 'usuarioEmpresas'],
    });
    if (!usuario) throw new UnauthorizedException();
    return this.emitirToken(usuario, payload.empresa_id);
  }

  async alterarSenha(usuarioId: string, dto: AlterarSenhaDto, primeiroAcesso: boolean) {
    const usuario = await this.usuariosRepo.findOneOrFail({ where: { id: usuarioId } });

    if (!primeiroAcesso) {
      if (!dto.senha_atual) {
        throw new BadRequestException('Senha atual é obrigatória.');
      }
      const valida = await bcrypt.compare(dto.senha_atual, usuario.senhaHash);
      if (!valida) throw new BadRequestException('Senha atual incorreta.');
    }

    usuario.senhaHash = await bcrypt.hash(dto.nova_senha, 12);
    usuario.primeiroAcesso = false;
    await this.usuariosRepo.save(usuario);

    const full = await this.usuariosRepo.findOne({
      where: { id: usuarioId },
      relations: ['perfil', 'perfil.telas', 'usuarioEmpresas'],
    });
    return this.emitirToken(full!);
  }

  async esqueciSenha(dto: EsqueciSenhaDto): Promise<void> {
    const usuario = await this.usuariosRepo.findOne({
      where: { email: dto.email.toLowerCase() },
    });

    if (!usuario) return; // não revela se existe

    const token = uuidv4();
    const expira = new Date(Date.now() + 2 * 60 * 60 * 1000); // +2h

    usuario.resetToken = token;
    usuario.resetTokenExpira = expira;
    await this.usuariosRepo.save(usuario);

    await this.enviarEmailReset(usuario.email, token);
  }

  async redefinirSenha(dto: RedefinirSenhaDto): Promise<void> {
    const usuario = await this.usuariosRepo.findOne({
      where: { resetToken: dto.token },
    });

    if (!usuario || !usuario.resetTokenExpira || usuario.resetTokenExpira < new Date()) {
      throw new BadRequestException('Token inválido ou expirado.');
    }

    usuario.senhaHash = await bcrypt.hash(dto.nova_senha, 12);
    usuario.resetToken = null;
    usuario.resetTokenExpira = null;
    usuario.primeiroAcesso = false;
    await this.usuariosRepo.save(usuario);
  }

  private async emitirToken(usuario: Usuario, empresaIdOverride?: number) {
    const perfil = usuario.perfil;
    const telas = (perfil.telas ?? []).map((t) => t.codigo);
    const empresas = (usuario.usuarioEmpresas ?? []).map((ue) => ue.empresaId);
    const empresaId = empresaIdOverride ?? empresas[0] ?? 0;

    // Cache da versão do perfil (TTL 5min)
    await this.cache.set(`perfil:versao:${perfil.id}`, perfil.versao, 300000);

    const payload: JwtPayload = {
      sub: usuario.id,
      email: usuario.email,
      nome: usuario.nome,
      perfil_id: perfil.id,
      perfil_nome: perfil.nome,
      perfil_versao: perfil.versao,
      telas,
      empresa_id: empresaId,
      empresas,
      primeiro_acesso: usuario.primeiroAcesso,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil_nome: perfil.nome,
        empresas,
        empresa_id: empresaId,
        primeiro_acesso: usuario.primeiroAcesso,
      },
    };
  }

  private async enviarEmailReset(email: string, token: string): Promise<void> {
    const urlParam = await this.parametrosRepo.findOne({
      where: { grupo: 'sistema', chave: 'sistema.url_frontend' },
    });
    const url = urlParam?.valor ?? process.env.FRONTEND_URL ?? 'http://localhost:4200';

    const smtpHost = await this.parametrosRepo.findOne({
      where: { grupo: 'smtp', chave: 'smtp.host' },
    });

    if (!smtpHost?.valor) {
      throw new ServiceUnavailableException(
        'Serviço de e-mail não configurado. Contate o administrador.',
      );
    }

    // nodemailer — importação dinâmica para não falhar se SMTP não configurado
    const nodemailer = await import('nodemailer');
    const smtpPort = await this.parametrosRepo.findOne({ where: { grupo: 'smtp', chave: 'smtp.port' } });
    const smtpUser = await this.parametrosRepo.findOne({ where: { grupo: 'smtp', chave: 'smtp.user' } });
    const smtpPass = await this.parametrosRepo.findOne({ where: { grupo: 'smtp', chave: 'smtp.pass' } });
    const smtpFrom = await this.parametrosRepo.findOne({ where: { grupo: 'smtp', chave: 'smtp.from' } });
    const smtpSecure = await this.parametrosRepo.findOne({ where: { grupo: 'smtp', chave: 'smtp.secure' } });

    const transporter = (nodemailer as any).createTransport({
      host: smtpHost.valor,
      port: parseInt(smtpPort?.valor ?? '587', 10),
      secure: smtpSecure?.valor === 'true',
      auth: { user: smtpUser?.valor, pass: smtpPass?.valor },
    });

    await transporter.sendMail({
      from: smtpFrom?.valor ?? 'CRM 360',
      to: email,
      subject: 'Redefinição de senha - CRM Comercial 360',
      html: `<p>Clique no link para redefinir sua senha:</p>
             <p><a href="${url}/redefinir-senha?token=${token}">${url}/redefinir-senha?token=${token}</a></p>
             <p>O link expira em 2 horas.</p>`,
    });
  }
}
