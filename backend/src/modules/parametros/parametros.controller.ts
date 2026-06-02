import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

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
  @ApiParam({ name: 'grupo', description: 'Nome do grupo de parâmetros (ex: smtp, geral)' })
  findByGrupo(@Param('grupo') grupo: string) {
    return this.parametrosService.findByGrupo(grupo);
  }

  @Put(':grupo/:chave')
  @Perfis('Admin')
  @ApiOperation({ summary: 'Atualizar um parâmetro' })
  @ApiParam({ name: 'grupo', description: 'Nome do grupo' })
  @ApiParam({ name: 'chave', description: 'Chave do parâmetro' })
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
  @ApiParam({ name: 'grupo', description: 'Nome do grupo' })
  @ApiBody({
    schema: {
      type: 'object',
      additionalProperties: { type: 'string', nullable: true },
      example: { smtp_host: 'smtp.exemplo.com', smtp_porta: '587' },
    },
  })
  updateGrupo(
    @Param('grupo') grupo: string,
    @Body() updates: Record<string, string | null>,
  ) {
    return this.parametrosService.updateGrupo(grupo, updates);
  }
}
