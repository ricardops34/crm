import { SetMetadata } from '@nestjs/common';

export const TELA_KEY = 'tela';
export const Tela = (codigo: string) => SetMetadata(TELA_KEY, codigo);
