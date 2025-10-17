import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PrisonerPersonalService } from './prisoner-personal.service';
import { CreatePersonalDto, PersonalResponseDto } from './dto/personal.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Prisoners - Personal')
@ApiBearerAuth()
@Controller('prisoners/:prisonerId/personal')
export class PrisonerPersonalController {
  constructor(private readonly personalService: PrisonerPersonalService) {}

  /**
   * POST /api/prisoners/:prisoner_id/personal
   * Crea información personal y familiar
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear información personal del prisionero' })
  @ApiResponse({
    status: 201,
    description: 'Información personal creada exitosamente',
    type: PersonalResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Información personal ya existe' })
  @ApiResponse({ status: 404, description: 'Prisionero no encontrado' })
  async create(
    @Param('prisonerId') prisonerId: string,
    @Body() createDto: CreatePersonalDto,
    @CurrentUser() userId: string,
  ): Promise<PersonalResponseDto> {
    return this.personalService.create(prisonerId, createDto, userId);
  }

  /**
   * GET /api/prisoners/:prisoner_id/personal
   * Obtiene información personal
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener información personal del prisionero' })
  @ApiResponse({
    status: 200,
    description: 'Información personal obtenida exitosamente',
    type: PersonalResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Información personal no encontrada' })
  async findOne(
    @Param('prisonerId') prisonerId: string,
  ): Promise<PersonalResponseDto> {
    return this.personalService.findOne(prisonerId);
  }

  /**
   * PUT /api/prisoners/:prisoner_id/personal
   * Actualiza información personal
   */
  @Put()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar información personal del prisionero' })
  @ApiResponse({
    status: 200,
    description: 'Información personal actualizada exitosamente',
    type: PersonalResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Información personal no encontrada' })
  async update(
    @Param('prisonerId') prisonerId: string,
    @Body() updateDto: CreatePersonalDto,
    @CurrentUser() userId: string,
  ): Promise<PersonalResponseDto> {
    return this.personalService.update(prisonerId, updateDto, userId);
  }
}
