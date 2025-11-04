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
import { PrisonerCaseService } from './prisoner-case.service';
import {
  CreateCaseDto,
  UpdateCaseDto,
  CaseResponseDto,
  CaseListQueryDto,
} from './dto/case.dto';
import { MandateResponseDto } from './dto/mandate.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationMetaDto } from '../../common/interfaces/entity.interface';

@ApiTags('Prisoner Cases')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class PrisonerCaseController {
  constructor(private readonly caseService: PrisonerCaseService) {}

  @Post('prisoners/:prisonerId/cases')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear caso judicial para un prisionero' })
  @ApiParam({ name: 'prisonerId', description: 'ID del prisionero' })
  @ApiResponse({
    status: 201,
    description: 'Caso creado exitosamente',
    type: CaseResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Prisionero no encontrado' })
  async create(
    @Param('prisonerId') prisonerId: string,
    @Body() createDto: CreateCaseDto,
    @CurrentUser() userId: string,
  ): Promise<CaseResponseDto> {
    return this.caseService.create(prisonerId, createDto, userId);
  }

  @Get('prisoners/:prisonerId/cases')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Listar casos de un prisionero con filtros y paginación',
  })
  @ApiParam({ name: 'prisonerId', description: 'ID del prisionero' })
  @ApiResponse({
    status: 200,
    description: 'Lista de casos',
    schema: {
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/CaseResponseDto' },
        },
        pagination: { $ref: '#/components/schemas/PaginationMetaDto' },
      },
    },
  })
  async findAll(
    @Param('prisonerId') prisonerId: string,
    @Query() query: CaseListQueryDto,
  ): Promise<{ data: CaseResponseDto[]; pagination: PaginationMetaDto }> {
    return this.caseService.findAll(prisonerId, query);
  }

  @Get('prisoners/:prisonerId/cases/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener perfil completo de casos y mandatos de un prisionero',
    description: 'Devuelve todos los casos con sus mandatos asociados',
  })
  @ApiParam({ name: 'prisonerId', description: 'ID del prisionero' })
  @ApiResponse({
    status: 200,
    description: 'Perfil completo de casos',
    schema: {
      properties: {
        cases: {
          type: 'array',
          items: {
            allOf: [
              { $ref: '#/components/schemas/CaseResponseDto' },
              {
                properties: {
                  mandates: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/MandateResponseDto' },
                  },
                },
              },
            ],
          },
        },
      },
    },
  })
  async getCompleteProfile(@Param('prisonerId') prisonerId: string): Promise<{
    cases: Array<CaseResponseDto & { mandates: MandateResponseDto[] }>;
  }> {
    return this.caseService.getCompleteProfile(prisonerId);
  }

  @Get('cases/:caseId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener detalle de un caso' })
  @ApiParam({ name: 'caseId', description: 'ID del caso' })
  @ApiResponse({
    status: 200,
    description: 'Detalle del caso',
    type: CaseResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Caso no encontrado' })
  async findOne(@Param('caseId') caseId: string): Promise<CaseResponseDto> {
    return this.caseService.findOne(caseId);
  }

  @Put('cases/:caseId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar datos de un caso' })
  @ApiParam({ name: 'caseId', description: 'ID del caso' })
  @ApiResponse({
    status: 200,
    description: 'Caso actualizado exitosamente',
    type: CaseResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Caso no encontrado' })
  async update(
    @Param('caseId') caseId: string,
    @Body() updateDto: UpdateCaseDto,
    @CurrentUser() userId: string,
  ): Promise<CaseResponseDto> {
    return this.caseService.update(caseId, updateDto, userId);
  }

  @Delete('cases/:caseId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar (soft delete) un caso' })
  @ApiParam({ name: 'caseId', description: 'ID del caso' })
  @ApiResponse({ status: 204, description: 'Caso eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Caso no encontrado' })
  async remove(
    @Param('caseId') caseId: string,
    @CurrentUser() userId: string,
  ): Promise<void> {
    return this.caseService.remove(caseId, userId);
  }
}
