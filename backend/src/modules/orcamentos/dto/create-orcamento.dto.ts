import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrcamentoItemDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  produto_id?: string;

  @ApiProperty()
  @IsString()
  cod_produto: string;

  @ApiProperty()
  @IsString()
  descricao: string;

  @ApiProperty()
  @IsNumber()
  @Min(0.001)
  quantidade: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  preco_unitario: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  desconto_pct?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  estoque_disponivel?: number;
}

export class CreateOrcamentoDto {
  @ApiProperty()
  @IsUUID()
  cliente_id: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  origem?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observacao?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  orcamento_origem_id?: string;

  @ApiProperty({ type: [CreateOrcamentoItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrcamentoItemDto)
  itens: CreateOrcamentoItemDto[];
}
