import { UnauthorizedException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';

jest.mock('uuid', () => ({
  v4: () => 'uuid-mock',
}));

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

import { AuthService } from './auth.service';
import { Usuario } from '../../entities/usuario.entity';
import { Perfil } from '../../entities/perfil.entity';
import { Parametro } from '../../entities/parametro.entity';

describe('AuthService', () => {
  let service: AuthService;

  const usuariosRepo = {
    findOne: jest.fn(),
    findOneOrFail: jest.fn(),
    save: jest.fn(),
  };

  const perfisRepo = {};
  const parametrosRepo = {
    findOne: jest.fn(),
  };

  const jwtService = {
    sign: jest.fn(() => 'jwt-token'),
  };

  const cache = {
    set: jest.fn(),
  };

  const modulosService = {
    buildModulosParaJwt: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(Usuario), useValue: usuariosRepo },
        { provide: getRepositoryToken(Perfil), useValue: perfisRepo },
        { provide: getRepositoryToken(Parametro), useValue: parametrosRepo },
        { provide: CACHE_MANAGER, useValue: cache },
        { provide: 'MODULOS_SERVICE', useValue: modulosService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  it('retorna seleção de empresas ao validar credenciais de usuário multiempresa sem empresa escolhida', async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    usuariosRepo.findOne.mockResolvedValue(criarUsuario([1, 2]));

    const resultado = await service.login({
      email: 'diretor@crm.com',
      senha: 'Senha@123',
    } as any);

    expect(resultado).toEqual({
      selecionar_empresa: true,
      usuario: {
        id: 'user-1',
        nome: 'Diretor Comercial',
        email: 'diretor@crm.com',
        perfil_nome: 'Diretor',
        primeiro_acesso: false,
      },
      empresas: [
        { id: 1, nome: 'RCG' },
        { id: 2, nome: 'CBA' },
      ],
    });
  });

  it('emite token com a empresa escolhida quando empresa_id é informado no login', async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    usuariosRepo.findOne.mockResolvedValue(criarUsuario([1, 2]));

    const resultado = await service.login({
      email: 'diretor@crm.com',
      senha: 'Senha@123',
      empresa_id: 2,
    } as any);

    expect(resultado).toMatchObject({
      access_token: 'jwt-token',
      usuario: {
        empresa_id: 2,
        empresas: [1, 2],
        empresas_detalhes: [
          { id: 1, nome: 'RCG' },
          { id: 2, nome: 'CBA' },
        ],
        empresa_nome: 'CBA',
      },
    });
  });

  it('rejeita empresa não autorizada quando empresa_id não pertence ao usuário', async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    usuariosRepo.findOne.mockResolvedValue(criarUsuario([1]));

    await expect(
      service.login({
        email: 'vendedor@crm.com',
        senha: 'Senha@123',
        empresa_id: 2,
      } as any),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('lista as empresas autorizadas ao consultar pelo login de um usuário ativo', async () => {
    usuariosRepo.findOne.mockResolvedValue(criarUsuario([1, 2]));

    const resultado = await service.buscarEmpresasPorLogin('diretor@crm.com');

    expect(resultado).toEqual({
      empresas: [
        { id: 1, nome: 'RCG' },
        { id: 2, nome: 'CBA' },
      ],
    });
  });

  it('retorna lista vazia ao consultar login inexistente ou inativo', async () => {
    usuariosRepo.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce({
      ...criarUsuario([1]),
      ativo: false,
    });

    await expect(service.buscarEmpresasPorLogin('nao-existe@crm.com')).resolves.toEqual({ empresas: [] });
    await expect(service.buscarEmpresasPorLogin('inativo@crm.com')).resolves.toEqual({ empresas: [] });
  });
});

function criarUsuario(empresas: number[]) {
  return {
    id: 'user-1',
    nome: 'Diretor Comercial',
    email: 'diretor@crm.com',
    senhaHash: 'hash',
    ativo: true,
    primeiroAcesso: false,
    perfil: {
      id: 'perfil-1',
      nome: 'Diretor',
      versao: 1,
      telas: [],
    },
    usuarioEmpresas: empresas.map((empresaId) => ({
      empresaId,
      empresa: {
        id: empresaId,
        nome: empresaId === 1 ? 'RCG' : 'CBA',
      },
    })),
  } as any;
}
