import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

import { OrcamentosService } from './orcamentos.service';
import { CreateOrcamentoDto } from './dto/create-orcamento.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TelaGuard } from '../../common/guards/tela.guard';
import { Tela } from '../../common/decorators/tela.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

@ApiTags('Orçamentos')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, TelaGuard)
@Tela('orcamentos')
@Controller('orcamentos')
export class OrcamentosController {
  constructor(private readonly orcamentosService: OrcamentosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar orçamentos' })
  @ApiQuery({ name: 'cliente_id', required: false })
  @ApiQuery({ name: 'status', required: false })
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('cliente_id') clienteId?: string,
    @Query('status') status?: string,
  ) {
    return this.orcamentosService.findAll(user, clienteId, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe do orçamento com itens' })
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.orcamentosService.findOne(id, user.empresa_id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar orçamento (apenas vendedor)' })
  create(@Body() dto: CreateOrcamentoDto, @CurrentUser() user: JwtPayload) {
    return this.orcamentosService.create(dto, user);
  }

  @Post(':id/enviar')
  @ApiOperation({ summary: 'Enviar orçamento ao cliente (PDF)' })
  enviar(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.orcamentosService.enviar(id, user);
  }

  @Post(':id/copiar')
  @ApiOperation({ summary: 'Copiar orçamento (gera novo número sequencial)' })
  copiar(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.orcamentosService.copiar(id, user);
  }
}
