import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateParametroDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  valor?: string | null;
}
