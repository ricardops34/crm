import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePerfilDto {
  @ApiProperty({ example: 'Coordenador' })
  @IsString()
  @MaxLength(100)
  nome: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  descricao?: string;
}
