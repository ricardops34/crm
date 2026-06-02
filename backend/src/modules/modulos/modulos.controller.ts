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
import { ModulosService } from './modulos.service';
import { CreateModuloDto, UpdatePerfilModulosDto } from './dto/create-modulo.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PerfilGuard } from '../../common/guards/perfil.guard';
import { Perfis } from '../../common/decorators/perfis.decorator';

@ApiTags('Módulos')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('modulos')
export class ModulosController {
  constructor(private readonly svc: ModulosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar módulos com telas e perfis vinculados' })
  findAll() {
    return this.svc.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe do módulo' })
  @ApiParam({ name: 'id', description: 'UUID do módulo' })
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Post()
  @UseGuards(PerfilGuard)
  @Perfis('Admin')
  @ApiOperation({ summary: 'Criar módulo (Admin)' })
  create(@Body() dto: CreateModuloDto) {
    return this.svc.create(dto);
  }

  @Patch(':id')
  @UseGuards(PerfilGuard)
  @Perfis('Admin')
  @ApiOperation({ summary: 'Atualizar módulo' })
  @ApiParam({ name: 'id', description: 'UUID do módulo' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateModuloDto>) {
    return this.svc.update(id, dto);
  }

  @Patch(':id/toggle')
  @UseGuards(PerfilGuard)
  @Perfis('Admin')
  @ApiOperation({ summary: 'Ativar/Desativar módulo' })
  @ApiParam({ name: 'id', description: 'UUID do módulo' })
  toggleAtivo(@Param('id') id: string) {
    return this.svc.toggleAtivo(id);
  }

  @Put(':id/perfis')
  @UseGuards(PerfilGuard)
  @Perfis('Admin')
  @ApiOperation({ summary: 'Definir perfis vinculados ao módulo (batch)' })
  @ApiParam({ name: 'id', description: 'UUID do módulo' })
  updatePerfis(@Param('id') id: string, @Body() dto: UpdatePerfilModulosDto) {
    return this.svc.updatePerfis(id, dto);
  }

  @Post(':id/telas/:telaId')
  @UseGuards(PerfilGuard)
  @Perfis('Admin')
  @ApiOperation({ summary: 'Adicionar tela ao módulo' })
  @ApiParam({ name: 'id', description: 'UUID do módulo' })
  @ApiParam({ name: 'telaId', description: 'UUID da tela' })
  addTela(@Param('id') id: string, @Param('telaId') telaId: string) {
    return this.svc.addTela(id, telaId);
  }

  @Delete(':id/telas/:telaId')
  @UseGuards(PerfilGuard)
  @Perfis('Admin')
  @ApiOperation({ summary: 'Remover tela do módulo' })
  @ApiParam({ name: 'id', description: 'UUID do módulo' })
  @ApiParam({ name: 'telaId', description: 'UUID da tela' })
  removeTela(@Param('id') id: string, @Param('telaId') telaId: string) {
    return this.svc.removeTela(id, telaId);
  }
}
