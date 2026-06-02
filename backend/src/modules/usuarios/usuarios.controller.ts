import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PerfilGuard } from '../../common/guards/perfil.guard';
import { Perfis } from '../../common/decorators/perfis.decorator';

@ApiTags('Usuários')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, PerfilGuard)
@Perfis('Admin', 'Diretor')
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar usuários' })
  findAll() {
    return this.usuariosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe do usuário' })
  findOne(@Param('id') id: string) {
    return this.usuariosService.findOne(id);
  }

  @Post()
  @Perfis('Admin')
  @ApiOperation({ summary: 'Criar usuário (gera senha temporária)' })
  create(@Body() dto: CreateUsuarioDto) {
    return this.usuariosService.create(dto);
  }

  @Patch(':id')
  @Perfis('Admin')
  @ApiOperation({ summary: 'Atualizar dados e perfil' })
  update(@Param('id') id: string, @Body() dto: UpdateUsuarioDto) {
    return this.usuariosService.update(id, dto);
  }

  @Patch(':id/reset-senha')
  @Perfis('Admin')
  @ApiOperation({ summary: 'Forçar reset de senha (gera nova senha temporária)' })
  resetSenha(@Param('id') id: string) {
    return this.usuariosService.resetSenha(id);
  }

  @Patch(':id/ativo')
  @Perfis('Admin')
  @ApiOperation({ summary: 'Ativar / Desativar usuário' })
  toggleAtivo(@Param('id') id: string, @Body('ativo') ativo: boolean) {
    return this.usuariosService.toggleAtivo(id, ativo);
  }
}
