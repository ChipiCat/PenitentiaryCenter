import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { PrisionersService } from './prisioners-core.service';
import {
  CreatePrisonerDTO,
  UpdatePrisonerDto,
  PrisonerResponseDTO,
  PrisonerListQueryDto,
  PrisonerListResponseDto,
} from './dto/prisoner.dto';
import { CompletePrisonerProfileDto } from './dto/full-prisoner.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Prisoners')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('prisoners')
export class PrisionersController {
  constructor(private readonly prisionersService: PrisionersService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo prisionero' })
  @ApiResponse({
    status: 201,
    description: 'Prisionero creado exitosamente',
    type: PrisonerResponseDTO,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos o duplicados' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async create(
    @Body() createDto: CreatePrisonerDTO,
    @CurrentUser() userId: string,
                     ): Promise<PrisonerResponseDTO> {
    return this.prisionersService.create(createDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar prisioneros con paginación y filtros' })
  @ApiResponse({
    status: 200,
    description: 'Lista de prisioneros',
    type: PrisonerListResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async findAll(
    @Query() query: PrisonerListQueryDto,
  ): Promise<PrisonerListResponseDto> {
    return this.prisionersService.findAll(query);
  }

  @Get('complete-profile/:id')
  @ApiOperation({
    summary: 'Obtener perfil completo del prisionero',
    description:
      'Obtiene toda la información del prisionero en una sola llamada (útil para visualización de perfil completo)',
  })
  @ApiParam({ name: 'id', description: 'ID del prisionero' })
  @ApiResponse({
    status: 200,
    description: 'Perfil completo del prisionero',
    type: CompletePrisonerProfileDto,
  })
  @ApiResponse({ status: 404, description: 'Prisionero no encontrado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async getCompleteProfile(
    @Param('id') id: string,
  ): Promise<CompletePrisonerProfileDto> {
    return this.prisionersService.getCompleteProfile(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un prisionero por ID' })
  @ApiParam({ name: 'id', description: 'ID del prisionero' })
  @ApiResponse({
    status: 200,
    description: 'Prisionero encontrado',
    type: PrisonerResponseDTO,
  })
  @ApiResponse({ status: 404, description: 'Prisionero no encontrado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async findOne(@Param('id') id: string): Promise<PrisonerResponseDTO> {
    return this.prisionersService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un prisionero' })
  @ApiParam({ name: 'id', description: 'ID del prisionero' })
  @ApiResponse({
    status: 200,
    description: 'Prisionero actualizado exitosamente',
    type: PrisonerResponseDTO,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Prisionero no encontrado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePrisonerDto,
    @CurrentUser() userId: string,
  ): Promise<PrisonerResponseDTO> {
    return this.prisionersService.update(id, updateDto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un prisionero (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID del prisionero' })
  @ApiResponse({
    status: 204,
    description: 'Prisionero eliminado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Prisionero no encontrado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() userId: string,
  ): Promise<void> {
    return this.prisionersService.remove(id, userId);
  }
}
