import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

import { McvService } from './mcv.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TelaGuard } from '../../common/guards/tela.guard';
import { Tela } from '../../common/decorators/tela.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

@ApiTags('MCV')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, TelaGuard)
@Tela('mcv')
@Controller('mcv')
export class McvController {
  constructor(private readonly mcvService: McvService) {}

  @Get()
  @ApiOperation({ summary: 'Carteira de clientes do vendedor (MCV)' })
  @ApiQuery({ name: 'dias', required: false, type: Number })
  @ApiQuery({ name: 'bloqueados', required: false, type: Boolean })
  @ApiQuery({ name: 'ativos', required: false, type: Boolean })
  getCarteira(
    @CurrentUser() user: JwtPayload,
    @Query('dias') dias?: number,
    @Query('bloqueados') bloqueados?: string,
    @Query('ativos') ativos?: string,
  ) {
    return this.mcvService.getCarteira(user, {
      dias: dias ? Number(dias) : undefined,
      bloqueados: bloqueados === 'true',
      ativos: ativos === 'true',
    });
  }
}
