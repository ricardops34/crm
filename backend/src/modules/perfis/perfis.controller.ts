import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { PerfisService } from './perfis.service';
import { CreatePerfilDto } from './dto/create-perfil.dto';
import { UpdatePerfilTelasDto } from './dto/update-perfil-telas.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PerfilGuard } from '../../common/guards/perfil.guard';
import { Perfis } from '../../common/decorators/perfis.decorator';

@ApiTags('Perfis')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, PerfilGuard)
@Perfis('Admin', 'Diretor')
@Controller('perfis')
export class PerfisController {
  constructor(private readonly perfisService: PerfisService) {}

  @Get()
  @ApiOperation({ summary: 'Listar perfis' })
  findAll() {
    return this.perfisService.findAll();
  }

  @Get('telas')
  @ApiOperation({ summary: 'Catálogo de todas as telas' })
  findAllTelas() {
    return this.perfisService.findAllTelas();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe do perfil com telas' })
  @ApiParam({ name: 'id', description: 'UUID do perfil' })
  findOne(@Param('id') id: string) {
    return this.perfisService.findOne(id);
  }

  @Post()
  @Perfis('Admin')
  @ApiOperation({ summary: 'Criar perfil' })
  create(@Body() dto: CreatePerfilDto) {
    return this.perfisService.create(dto);
  }

  @Patch(':id')
  @Perfis('Admin')
  @ApiOperation({ summary: 'Atualizar nome/descrição do perfil' })
  @ApiParam({ name: 'id', description: 'UUID do perfil' })
  update(@Param('id') id: string, @Body() dto: CreatePerfilDto) {
    return this.perfisService.update(id, dto);
  }

  @Delete(':id')
  @Perfis('Admin')
  @ApiOperation({ summary: 'Excluir perfil' })
  @ApiParam({ name: 'id', description: 'UUID do perfil' })
  remove(@Param('id') id: string) {
    return this.perfisService.remove(id);
  }

  @Get(':id/telas')
  @ApiOperation({ summary: 'Telas do perfil' })
  @ApiParam({ name: 'id', description: 'UUID do perfil' })
  getTelas(@Param('id') id: string) {
    return this.perfisService.getTelas(id);
  }

  @Put(':id/telas')
  @Perfis('Admin')
  @ApiOperation({ summary: 'Substituir conjunto de telas do perfil (batch)' })
  @ApiParam({ name: 'id', description: 'UUID do perfil' })
  updateTelas(@Param('id') id: string, @Body() dto: UpdatePerfilTelasDto) {
    return this.perfisService.updateTelas(id, dto);
  }

  @Post(':id/telas/:telaId')
  @Perfis('Admin')
  @ApiOperation({ summary: 'Adicionar tela ao perfil' })
  @ApiParam({ name: 'id', description: 'UUID do perfil' })
  @ApiParam({ name: 'telaId', description: 'UUID da tela' })
  addTela(@Param('id') id: string, @Param('telaId') telaId: string) {
    return this.perfisService.addTela(id, telaId);
  }

  @Delete(':id/telas/:telaId')
  @Perfis('Admin')
  @ApiOperation({ summary: 'Remover tela do perfil' })
  @ApiParam({ name: 'id', description: 'UUID do perfil' })
  @ApiParam({ name: 'telaId', description: 'UUID da tela' })
  removeTela(@Param('id') id: string, @Param('telaId') telaId: string) {
    return this.perfisService.removeTela(id, telaId);
  }
}
