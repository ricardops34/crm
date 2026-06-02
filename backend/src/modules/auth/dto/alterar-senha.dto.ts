import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class AlterarSenhaDto {
  @ApiPropertyOptional({ description: 'Obrigatório quando não é primeiro acesso' })
  @IsOptional()
  @IsString()
  senha_atual?: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'A senha deve ter letra maiúscula, minúscula e número.',
  })
  nova_senha: string;
}
