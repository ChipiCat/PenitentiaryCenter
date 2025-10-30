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
  UploadedFile,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { PrisonerMandateService } from './prisoner-mandate.service';
import {
  CreateMandateDto,
  UpdateMandateDto,
  MandateResponseDto,
  UploadMandateFileDto,
} from './dto/mandate.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { UploadedFile as UploadedFileType } from '../../files/interfaces/uploaded-file.interface';

@ApiTags('Prisoner Mandates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(CacheInterceptor)
@Controller()
export class PrisonerMandateController {
  constructor(private readonly mandateService: PrisonerMandateService) {}

  @Post('cases/:caseId/mandates')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear mandato judicial para un caso' })
  @ApiParam({ name: 'caseId', description: 'ID del caso' })
  @ApiResponse({
    status: 201,
    description: 'Mandato creado exitosamente',
    type: MandateResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Caso no encontrado' })
  async create(
    @Param('caseId') caseId: string,
    @Body() createDto: CreateMandateDto,
    @CurrentUser() userId: string,
  ): Promise<MandateResponseDto> {
    return this.mandateService.create(caseId, createDto, userId);
  }

  @Get('cases/:caseId/mandates')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar todos los mandatos de un caso' })
  @ApiParam({ name: 'caseId', description: 'ID del caso' })
  @ApiResponse({
    status: 200,
    description: 'Lista de mandatos',
    type: [MandateResponseDto],
  })
  async findAll(
    @Param('caseId') caseId: string,
  ): Promise<MandateResponseDto[]> {
    return this.mandateService.findAll(caseId);
  }

  @Get('cases/:caseId/mandates/active')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar solo mandatos vigentes de un caso' })
  @ApiParam({ name: 'caseId', description: 'ID del caso' })
  @ApiResponse({
    status: 200,
    description: 'Lista de mandatos vigentes',
    type: [MandateResponseDto],
  })
  async findActive(
    @Param('caseId') caseId: string,
  ): Promise<MandateResponseDto[]> {
    return this.mandateService.findActive(caseId);
  }

  @Get('mandates/:mandateId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener detalle de un mandato' })
  @ApiParam({ name: 'mandateId', description: 'ID del mandato' })
  @ApiResponse({
    status: 200,
    description: 'Detalle del mandato',
    type: MandateResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Mandato no encontrado' })
  async findOne(
    @Param('mandateId') mandateId: string,
  ): Promise<MandateResponseDto> {
    return this.mandateService.findOne(mandateId);
  }

  @Put('mandates/:mandateId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar datos de un mandato' })
  @ApiParam({ name: 'mandateId', description: 'ID del mandato' })
  @ApiResponse({
    status: 200,
    description: 'Mandato actualizado exitosamente',
    type: MandateResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Mandato no encontrado' })
  async update(
    @Param('mandateId') mandateId: string,
    @Body() updateDto: UpdateMandateDto,
    @CurrentUser() userId: string,
  ): Promise<MandateResponseDto> {
    return this.mandateService.update(mandateId, updateDto, userId);
  }

  @Delete('mandates/:mandateId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar (soft delete) un mandato' })
  @ApiParam({ name: 'mandateId', description: 'ID del mandato' })
  @ApiResponse({ status: 204, description: 'Mandato eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Mandato no encontrado' })
  async remove(@Param('mandateId') mandateId: string): Promise<void> {
    return this.mandateService.remove(mandateId);
  }

  @Post('mandates/:mandateId/file')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Subir/actualizar archivo PDF del mandato' })
  @ApiParam({ name: 'mandateId', description: 'ID del mandato' })
  @ApiBody({ type: UploadMandateFileDto })
  @ApiResponse({
    status: 200,
    description: 'Archivo subido exitosamente',
    type: MandateResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Archivo inválido' })
  @ApiResponse({ status: 404, description: 'Mandato no encontrado' })
  async uploadFile(
    @Param('mandateId') mandateId: string,
    @UploadedFile() file: UploadedFileType,
    @CurrentUser() userId: string,
  ): Promise<MandateResponseDto> {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }
    return this.mandateService.uploadFile(mandateId, file, userId);
  }

  @Delete('mandates/:mandateId/file')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar archivo del mandato' })
  @ApiParam({ name: 'mandateId', description: 'ID del mandato' })
  @ApiResponse({ status: 204, description: 'Archivo eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Mandato o archivo no encontrado' })
  async deleteFile(
    @Param('mandateId') mandateId: string,
    @CurrentUser() userId: string,
  ): Promise<void> {
    return this.mandateService.deleteFile(mandateId, userId);
  }
}
