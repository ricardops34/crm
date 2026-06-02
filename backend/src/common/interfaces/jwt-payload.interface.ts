export interface JwtModulo {
  id: string;
  nome: string;
  icone: string;
  ordem: number;
  telas: JwtTela[];
}

export interface JwtTela {
  id: string;
  codigo: string;
  nome: string;
  icone: string;
  rota: string;
  ordem: number;
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
  empresas: number[];
  primeiro_acesso: boolean;
  iat?: number;
  exp?: number;
}
