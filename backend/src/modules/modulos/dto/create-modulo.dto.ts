import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsInt, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateModuloDto {
  @ApiProperty({ example: 'Vendas' })
  @IsString()
  @MaxLength(100)
  nome: string;

  @ApiProperty({ example: 'an an-storefront' })
  @IsString()
  @MaxLength(100)
  icone: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  ordem?: number;

  @ApiPropertyOptional({ default: false, description: 'true = visível apenas para ADMIN' })
  @IsOptional()
  @IsBoolean()
  somente_admin?: boolean;
}

export class UpdatePerfilModulosDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  perfil_ids: string[];
}
