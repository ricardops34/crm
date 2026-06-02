import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

import { OrcamentosService } from './orcamentos.service';
import { OrcamentoPdfService } from './orcamento-pdf.service';
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
  constructor(
    private readonly orcamentosService: OrcamentosService,
    private readonly pdfService: OrcamentoPdfService,
  ) {}

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

  @Get(':id/pdf')
  @ApiOperation({ summary: 'Gerar e baixar PDF do orçamento' })
  async gerarPdf(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Res() res: Response,
  ) {
    const buffer = await this.pdfService.gerarPdf(id, user.sub);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="orcamento-${id.slice(0, 8)}.pdf"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Get(':id/logs')
  @ApiOperation({ summary: 'Histórico de envios do orçamento' })
  getLogs(@Param('id') id: string) {
    return this.pdfService.getLogs(id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar orçamento (apenas vendedor)' })
  create(@Body() dto: CreateOrcamentoDto, @CurrentUser() user: JwtPayload) {
    return this.orcamentosService.create(dto, user);
  }

  @Post(':id/enviar')
  @ApiOperation({ summary: 'Enviar orçamento → gera PDF e registra log' })
  async enviar(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Res() res: Response,
  ) {
    const orc = await this.orcamentosService.enviar(id, user);
    const buffer = await this.pdfService.gerarPdf(id, user.sub);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="orcamento-${orc.numeroPortal}.pdf"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Post(':id/copiar')
  @ApiOperation({ summary: 'Copiar orçamento (gera novo número sequencial)' })
  copiar(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.orcamentosService.copiar(id, user);
  }
}
