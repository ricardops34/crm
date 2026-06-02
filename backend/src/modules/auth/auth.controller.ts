import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AlterarSenhaDto } from './dto/alterar-senha.dto';
import { EsqueciSenhaDto } from './dto/esqueci-senha.dto';
import { RedefinirSenhaDto } from './dto/redefinir-senha.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import type { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

@ApiTags('Auth')
@Controller('auth')
@UseGuards(JwtAuthGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 900000 } })
  @ApiOperation({ summary: 'Login com e-mail e senha' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Dados do usuário logado' })
  me(@CurrentUser() user: JwtPayload) {
    return this.authService.me(user);
  }

  @Post('empresa/:id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Trocar empresa ativa' })
  trocarEmpresa(@CurrentUser() user: JwtPayload, @Param('id', ParseIntPipe) id: number) {
    return this.authService.trocarEmpresa(user.sub, id);
  }

  @Post('alterar-senha')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Alterar própria senha' })
  alterarSenha(@CurrentUser() user: JwtPayload, @Body() dto: AlterarSenhaDto) {
    return this.authService.alterarSenha(user.sub, dto, user.primeiro_acesso);
  }

  @Public()
  @Post('esqueci-senha')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Solicitar redefinição de senha por e-mail' })
  async esqueciSenha(@Body() dto: EsqueciSenhaDto) {
    await this.authService.esqueciSenha(dto);
    return { message: 'Se o e-mail existir, você receberá as instruções.' };
  }

  @Public()
  @Post('redefinir-senha')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Redefinir senha via token' })
  async redefinirSenha(@Body() dto: RedefinirSenhaDto) {
    await this.authService.redefinirSenha(dto);
    return { message: 'Senha redefinida com sucesso.' };
  }
}
