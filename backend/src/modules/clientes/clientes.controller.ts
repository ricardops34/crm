import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ClientesService } from './clientes.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TelaGuard } from '../../common/guards/tela.guard';
import { Tela } from '../../common/decorators/tela.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

@ApiTags('Clientes')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, TelaGuard)
@Tela('clientes')
@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Cadastro/Resumo do cliente (aba padrão do Cliente 360)' })
  getCadastro(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.clientesService.getCadastro(id, user);
  }

  @Get(':id/financeiro')
  @ApiOperation({ summary: 'Títulos em aberto do cliente' })
  getFinanceiro(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.clientesService.getFinanceiro(id, user.empresa_id);
  }

  @Get(':id/notas-fiscais')
  @ApiOperation({ summary: 'Notas fiscais do cliente' })
  getNotasFiscais(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.clientesService.getNotasFiscais(id, user.empresa_id);
  }

  @Get(':id/orcamentos')
  @ApiOperation({ summary: 'Orçamentos do cliente' })
  getOrcamentos(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.clientesService.getOrcamentos(id, user.empresa_id);
  }

  @Get(':id/mix')
  @ApiOperation({ summary: 'Mix de produtos comprados pelo cliente' })
  getMix(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.clientesService.getMix(id, user.empresa_id);
  }
}
