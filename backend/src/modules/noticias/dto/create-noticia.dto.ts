import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export enum CategoriaNoticia {
  NOTICIA = 'noticia',
  AVISO = 'aviso',
}

export class CreateNoticiaDto {
  @ApiPropertyOptional({ description: 'null = todas as empresas' })
  @IsOptional()
  @IsInt()
  empresa_id?: number | null;

  @ApiProperty({ enum: CategoriaNoticia, default: CategoriaNoticia.NOTICIA })
  @IsEnum(CategoriaNoticia)
  categoria: CategoriaNoticia;

  @ApiProperty()
  @IsString()
  @MaxLength(200)
  titulo: string;

  @ApiProperty()
  @IsString()
  conteudo: string;

  @ApiPropertyOptional({ type: [String], description: 'Perfis que podem ver (null = todos)' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  perfis_alvo?: string[] | null;

  @ApiProperty({ example: '2026-06-01' })
  @IsDateString()
  data_inicio: string;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsOptional()
  @IsDateString()
  data_fim?: string | null;
}
