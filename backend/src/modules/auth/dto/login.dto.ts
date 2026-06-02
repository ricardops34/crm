import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@crm.local' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Admin@123' })
  @IsString()
  @MinLength(6)
  senha: string;

  @ApiPropertyOptional({ example: 1, description: 'Empresa escolhida para iniciar a sessão' })
  @IsOptional()
  @IsInt()
  empresa_id?: number;
}
