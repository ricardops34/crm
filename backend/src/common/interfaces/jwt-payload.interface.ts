export interface JwtPayload {
  sub: string;
  email: string;
  nome: string;
  perfil_id: string;
  perfil_nome: string;
  perfil_versao: number;
  telas: string[];
  empresa_id: number;
  empresas: number[];
  primeiro_acesso: boolean;
  iat?: number;
  exp?: number;
}
