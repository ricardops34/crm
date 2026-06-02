import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class BuscarEmpresasLoginDto {
  @ApiProperty({ example: 'admin@crm.local' })
  @IsEmail()
  email: string;
}
