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
import { VendedoresService } from './vendedores.service';
import { CreateVendedorDto } from './dto/create-vendedor.dto';
import { UpdateVendedorDto } from './dto/update-vendedor.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PerfilGuard } from '../../common/guards/perfil.guard';
import { Perfis } from '../../common/decorators/perfis.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

@ApiTags('Vendedores')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('vendedores')
export class VendedoresController {
  constructor(private readonly svc: VendedoresService) {}

  @Get()
  @ApiOperation({ summary: 'Listar vendedores da empresa ativa' })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.svc.findAll(user.empresa_id);
  }

  @Get('hierarquia')
  @ApiOperation({ summary: 'Hierarquia do usuário logado' })
  hierarquia(@CurrentUser() user: JwtPayload) {
    return this.svc.getHierarquia(user.sub, user.empresa_id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe do vendedor' })
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.svc.findOne(id, user.empresa_id);
  }

  @Post()
  @UseGuards(PerfilGuard)
  @Perfis('Admin', 'Administrativo')
  @ApiOperation({ summary: 'Criar vendedor (Admin/Administrativo)' })
  create(@Body() dto: CreateVendedorDto) {
    return this.svc.create(dto);
  }

  @Patch(':id')
  @UseGuards(PerfilGuard)
  @Perfis('Admin', 'Administrativo')
  @ApiOperation({ summary: 'Atualizar vendedor' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateVendedorDto,
  ) {
    return this.svc.update(id, user.empresa_id, dto);
  }
}
