import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { TipoVendedor } from './create-vendedor.dto';

export class UpdateVendedorDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(150)
  nome?: string;

  @ApiPropertyOptional({ enum: TipoVendedor })
  @IsOptional()
  @IsEnum(TipoVendedor)
  tipo?: TipoVendedor;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  usuario_id?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  supervisor_id?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  gerente_id?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
