import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export enum TipoVendedor {
  VENDEDOR = 'vendedor',
  SUPERVISOR = 'supervisor',
  GERENTE = 'gerente',
}

export class CreateVendedorDto {
  @ApiProperty()
  @IsInt()
  empresa_id: number;

  @ApiProperty()
  @IsString()
  @MaxLength(30)
  cod_erp: string;

  @ApiProperty()
  @IsString()
  @MaxLength(150)
  nome: string;

  @ApiPropertyOptional({ enum: TipoVendedor, default: TipoVendedor.VENDEDOR })
  @IsOptional()
  @IsEnum(TipoVendedor)
  tipo?: TipoVendedor;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  usuario_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  supervisor_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  gerente_id?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
