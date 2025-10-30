import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { PrisonerChildrenService } from './prisoner-children.service';
import {
  CreateChildDto,
  UpdateChildDto,
  ChildResponseDto,
} from './dto/childre.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Prisoner Children')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(CacheInterceptor)
@Controller('prisoners/:prisonerId/children')
export class PrisonerChildrenController {
  constructor(private readonly childrenService: PrisonerChildrenService) {}

  @Post()
  @ApiOperation({ summary: 'Agregar información de un hijo' })
  @ApiParam({ name: 'prisonerId', description: 'ID del prisionero' })
  @ApiResponse({
    status: 201,
    description: 'Hijo agregado exitosamente',
    type: ChildResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Prisionero no encontrado' })
  async create(
    @Param('prisonerId') prisonerId: string,
    @Body() createDto: CreateChildDto,
    @CurrentUser() userId: string,
  ): Promise<ChildResponseDto> {
    return this.childrenService.create(prisonerId, createDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar hijos del prisionero' })
  @ApiParam({ name: 'prisonerId', description: 'ID del prisionero' })
  @ApiResponse({
    status: 200,
    description: 'Lista de hijos',
    type: [ChildResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Prisionero no encontrado' })
  async findAll(
    @Param('prisonerId') prisonerId: string,
  ): Promise<ChildResponseDto[]> {
    return this.childrenService.findAll(prisonerId);
  }

  @Get(':childId')
  @ApiOperation({ summary: 'Obtener información de un hijo específico' })
  @ApiParam({ name: 'prisonerId', description: 'ID del prisionero' })
  @ApiParam({ name: 'childId', description: 'ID del hijo' })
  @ApiResponse({
    status: 200,
    description: 'Hijo encontrado',
    type: ChildResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Hijo no encontrado' })
  async findOne(
    @Param('prisonerId') prisonerId: string,
    @Param('childId') childId: string,
  ): Promise<ChildResponseDto> {
    return this.childrenService.findOne(prisonerId, childId);
  }

  @Put(':childId')
  @ApiOperation({ summary: 'Actualizar información de un hijo' })
  @ApiParam({ name: 'prisonerId', description: 'ID del prisionero' })
  @ApiParam({ name: 'childId', description: 'ID del hijo' })
  @ApiResponse({
    status: 200,
    description: 'Hijo actualizado exitosamente',
    type: ChildResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Hijo no encontrado' })
  async update(
    @Param('prisonerId') prisonerId: string,
    @Param('childId') childId: string,
    @Body() updateDto: UpdateChildDto,
    @CurrentUser() userId: string,
  ): Promise<ChildResponseDto> {
    return this.childrenService.update(prisonerId, childId, updateDto, userId);
  }

  @Delete(':childId')
  @ApiOperation({ summary: 'Eliminar registro de un hijo (soft delete)' })
  @ApiParam({ name: 'prisonerId', description: 'ID del prisionero' })
  @ApiParam({ name: 'childId', description: 'ID del hijo' })
  @ApiResponse({
    status: 200,
    description: 'Registro eliminado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Hijo no encontrado' })
  async delete(
    @Param('prisonerId') prisonerId: string,
    @Param('childId') childId: string,
    @CurrentUser() userId: string,
  ): Promise<{ message: string }> {
    return this.childrenService.delete(prisonerId, childId, userId);
  }
}
