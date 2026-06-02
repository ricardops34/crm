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
import { NoticiasService } from './noticias.service';
import { CreateNoticiaDto } from './dto/create-noticia.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PerfilGuard } from '../../common/guards/perfil.guard';
import { Perfis } from '../../common/decorators/perfis.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

@ApiTags('Notícias')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('noticias')
export class NoticiasController {
  constructor(private readonly svc: NoticiasService) {}

  @Get()
  @ApiOperation({ summary: 'Notícias e avisos do usuário logado (Home)' })
  findParaUsuario(@CurrentUser() user: JwtPayload) {
    return this.svc.findParaUsuario(user);
  }

  @Get('admin')
  @UseGuards(PerfilGuard)
  @Perfis('Admin', 'Gerente', 'Administrativo')
  @ApiOperation({ summary: 'Todas as notícias (Admin/Gerente)' })
  findAll() {
    return this.svc.findAll();
  }

  @Post()
  @UseGuards(PerfilGuard)
  @Perfis('Admin', 'Gerente', 'Administrativo')
  @ApiOperation({ summary: 'Criar notícia ou aviso' })
  create(@Body() dto: CreateNoticiaDto, @CurrentUser() user: JwtPayload) {
    return this.svc.create(dto, user.sub);
  }

  @Patch(':id')
  @UseGuards(PerfilGuard)
  @Perfis('Admin', 'Gerente', 'Administrativo')
  @ApiOperation({ summary: 'Atualizar notícia' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateNoticiaDto>) {
    return this.svc.update(id, dto);
  }

  @Patch(':id/toggle')
  @UseGuards(PerfilGuard)
  @Perfis('Admin', 'Gerente', 'Administrativo')
  @ApiOperation({ summary: 'Ativar / Desativar notícia' })
  toggleAtivo(@Param('id') id: string) {
    return this.svc.toggleAtivo(id);
  }
}
