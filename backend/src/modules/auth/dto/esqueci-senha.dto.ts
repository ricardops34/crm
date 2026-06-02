import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class EsqueciSenhaDto {
  @ApiProperty({ example: 'usuario@empresa.com.br' })
  @IsEmail()
  email: string;
}
