import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ParametrosService } from './parametros.service';
import { UpdateParametroDto } from './dto/update-parametro.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PerfilGuard } from '../../common/guards/perfil.guard';
import { Perfis } from '../../common/decorators/perfis.decorator';

@ApiTags('Parâmetros')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, PerfilGuard)
@Perfis('Admin', 'Diretor')
@Controller('parametros')
export class ParametrosController {
  constructor(private readonly parametrosService: ParametrosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os parâmetros' })
  findAll() {
    return this.parametrosService.findAll();
  }

  @Get(':grupo')
  @ApiOperation({ summary: 'Parâmetros de um grupo' })
  findByGrupo(@Param('grupo') grupo: string) {
    return this.parametrosService.findByGrupo(grupo);
  }

  @Put(':grupo/:chave')
  @Perfis('Admin')
  @ApiOperation({ summary: 'Atualizar um parâmetro' })
  update(
    @Param('grupo') grupo: string,
    @Param('chave') chave: string,
    @Body() dto: UpdateParametroDto,
  ) {
    return this.parametrosService.update(grupo, chave, dto);
  }

  @Put(':grupo')
  @Perfis('Admin')
  @ApiOperation({ summary: 'Atualizar grupo inteiro (batch)' })
  updateGrupo(
    @Param('grupo') grupo: string,
    @Body() updates: Record<string, string | null>,
  ) {
    return this.parametrosService.updateGrupo(grupo, updates);
  }
}
