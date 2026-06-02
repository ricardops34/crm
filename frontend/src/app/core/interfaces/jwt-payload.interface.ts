export interface JwtTela {
  id: string;
  codigo: string;
  nome: string;
  icone: string;
  rota: string;
  ordem: number;
}

export interface JwtModulo {
  id: string;
  nome: string;
  icone: string;
  ordem: number;
  telas: JwtTela[];
}

export interface EmpresaAcesso {
  id: number;
  nome: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  nome: string;
  perfil_id: string;
  perfil_nome: string;
  perfil_versao: number;
  telas: string[];
  modulos: JwtModulo[];
  empresa_id: number;
  empresa_nome: string;
  empresas: number[];
  empresas_detalhes: EmpresaAcesso[];
  primeiro_acesso: boolean;
  iat: number;
  exp: number;
}

export interface LoginResponse {
  access_token: string;
  usuario: {
    id: string;
    nome: string;
    email: string;
    perfil_nome: string;
    empresas: number[];
    empresas_detalhes: EmpresaAcesso[];
    empresa_id: number;
    empresa_nome: string;
    primeiro_acesso: boolean;
  };
}

export interface LoginSelecaoEmpresaResponse {
  selecionar_empresa: true;
  usuario: {
    id: string;
    nome: string;
    email: string;
    perfil_nome: string;
    primeiro_acesso: boolean;
  };
  empresas: EmpresaAcesso[];
}

export type AuthLoginResult = LoginResponse | LoginSelecaoEmpresaResponse;

export interface BuscarEmpresasLoginResponse {
  empresas: EmpresaAcesso[];
}
