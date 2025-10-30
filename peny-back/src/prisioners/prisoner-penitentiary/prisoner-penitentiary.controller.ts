import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PrisonerPenitentiaryService } from './prisoner-penitentiary.service';
import {
  CreatePenitentiaryDto,
  PenitentiaryResponseDto,
} from './dto/penitentiary.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Prisoners - Penitentiary')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(CacheInterceptor)
@Controller('prisoners/:prisonerId/penitentiary')
export class PrisonerPenitentiaryController {
  constructor(
    private readonly penitentiaryService: PrisonerPenitentiaryService,
  ) {}

  /**
   * POST /api/prisoners/:prisoner_id/penitentiary
   * Crea información penitenciaria (ubicación)
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear información penitenciaria del prisionero' })
  @ApiResponse({
    status: 201,
    description: 'Información penitenciaria creada exitosamente',
    type: PenitentiaryResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Información penitenciaria ya existe',
  })
  @ApiResponse({ status: 404, description: 'Prisionero no encontrado' })
  async create(
    @Param('prisonerId') prisonerId: string,
    @Body() createDto: CreatePenitentiaryDto,
    @CurrentUser() userId: string,
  ): Promise<PenitentiaryResponseDto> {
    return this.penitentiaryService.create(prisonerId, createDto, userId);
  }

  /**
   * GET /api/prisoners/:prisoner_id/penitentiary
   * Obtiene información penitenciaria
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener información penitenciaria del prisionero' })
  @ApiResponse({
    status: 200,
    description: 'Información penitenciaria obtenida exitosamente',
    type: PenitentiaryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Información penitenciaria no encontrada',
  })
  async findOne(
    @Param('prisonerId') prisonerId: string,
  ): Promise<PenitentiaryResponseDto> {
    return this.penitentiaryService.findOne(prisonerId);
  }

  /**
   * PUT /api/prisoners/:prisoner_id/penitentiary
   * Actualiza información penitenciaria
   */
  @Put()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Actualizar información penitenciaria del prisionero',
  })
  @ApiResponse({
    status: 200,
    description: 'Información penitenciaria actualizada exitosamente',
    type: PenitentiaryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Información penitenciaria no encontrada',
  })
  async update(
    @Param('prisonerId') prisonerId: string,
    @Body() updateDto: CreatePenitentiaryDto,
    @CurrentUser() userId: string,
  ): Promise<PenitentiaryResponseDto> {
    return this.penitentiaryService.update(prisonerId, updateDto, userId);
  }
}
