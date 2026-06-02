import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';

export class UpdatePerfilTelasDto {
  @ApiProperty({ type: [String], description: 'Array de IDs das telas' })
  @IsArray()
  @IsUUID('4', { each: true })
  tela_ids: string[];
}
