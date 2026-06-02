import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HomeService } from './home.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

@ApiTags('Home')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('home')
export class HomeController {
  constructor(private readonly svc: HomeService) {}

  @Get('indicadores')
  @ApiOperation({ summary: 'Indicadores da Home por perfil do usuário' })
  getIndicadores(@CurrentUser() user: JwtPayload) {
    return this.svc.getIndicadores(user);
  }
}
