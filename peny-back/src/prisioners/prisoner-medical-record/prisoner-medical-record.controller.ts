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
import { PrisonerMedicalRecordService } from './prisoner-medical-record.service';
import {
  CreateMedicalRecordDto,
  UpdateMedicalRecordDto,
  MedicalRecordResponseDto,
  UploadMedicalFileDto,
} from './dto/medical-record.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { UploadedFile as UploadedFileType } from '../../files/interfaces/uploaded-file.interface';

@ApiTags('Prisoner Medical Records')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(CacheInterceptor)
@Controller('prisoners/:prisonerId/medical-records')
export class PrisonerMedicalRecordController {
  constructor(
    private readonly medicalRecordService: PrisonerMedicalRecordService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo registro médico' })
  @ApiParam({ name: 'prisonerId', description: 'ID del prisionero' })
  @ApiResponse({
    status: 201,
    description: 'Registro médico creado exitosamente',
    type: MedicalRecordResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Prisionero no encontrado' })
  async create(
    @Param('prisonerId') prisonerId: string,
    @Body() createDto: CreateMedicalRecordDto,
    @CurrentUser() userId: string,
  ): Promise<MedicalRecordResponseDto> {
    return this.medicalRecordService.create(prisonerId, createDto, userId);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todos los registros médicos del prisionero',
  })
  @ApiParam({ name: 'prisonerId', description: 'ID del prisionero' })
  @ApiResponse({
    status: 200,
    description: 'Lista de registros médicos',
    type: [MedicalRecordResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Prisionero no encontrado' })
  async findAll(
    @Param('prisonerId') prisonerId: string,
  ): Promise<MedicalRecordResponseDto[]> {
    return this.medicalRecordService.findAll(prisonerId);
  }

  @Get(':recordId')
  @ApiOperation({ summary: 'Obtener un registro médico específico' })
  @ApiParam({ name: 'prisonerId', description: 'ID del prisionero' })
  @ApiParam({ name: 'recordId', description: 'ID del registro médico' })
  @ApiResponse({
    status: 200,
    description: 'Registro médico encontrado',
    type: MedicalRecordResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Registro médico no encontrado' })
  async findOne(
    @Param('prisonerId') prisonerId: string,
    @Param('recordId') recordId: string,
  ): Promise<MedicalRecordResponseDto> {
    return this.medicalRecordService.findOne(prisonerId, recordId);
  }

  @Put(':recordId')
  @ApiOperation({ summary: 'Actualizar un registro médico' })
  @ApiParam({ name: 'prisonerId', description: 'ID del prisionero' })
  @ApiParam({ name: 'recordId', description: 'ID del registro médico' })
  @ApiResponse({
    status: 200,
    description: 'Registro médico actualizado exitosamente',
    type: MedicalRecordResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Registro médico no encontrado' })
  async update(
    @Param('prisonerId') prisonerId: string,
    @Param('recordId') recordId: string,
    @Body() updateDto: UpdateMedicalRecordDto,
    @CurrentUser() userId: string,
  ): Promise<MedicalRecordResponseDto> {
    return this.medicalRecordService.update(
      prisonerId,
      recordId,
      updateDto,
      userId,
    );
  }

  @Delete(':recordId')
  @ApiOperation({ summary: 'Eliminar un registro médico (soft delete)' })
  @ApiParam({ name: 'prisonerId', description: 'ID del prisionero' })
  @ApiParam({ name: 'recordId', description: 'ID del registro médico' })
  @ApiResponse({
    status: 200,
    description: 'Registro médico eliminado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Registro médico no encontrado' })
  async delete(
    @Param('prisonerId') prisonerId: string,
    @Param('recordId') recordId: string,
    @CurrentUser() userId: string,
  ): Promise<{ message: string }> {
    return this.medicalRecordService.delete(prisonerId, recordId, userId);
  }

  @Post(':recordId/upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Subir archivo médico (PDF/documento)' })
  @ApiParam({ name: 'prisonerId', description: 'ID del prisionero' })
  @ApiParam({ name: 'recordId', description: 'ID del registro médico' })
  @ApiBody({ type: UploadMedicalFileDto })
  @ApiResponse({
    status: 201,
    description: 'Archivo subido exitosamente',
    type: MedicalRecordResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Archivo inválido' })
  @ApiResponse({ status: 404, description: 'Registro médico no encontrado' })
  async uploadFile(
    @Param('prisonerId') prisonerId: string,
    @Param('recordId') recordId: string,
    @UploadedFile() file: UploadedFileType,
    @CurrentUser() userId: string,
  ): Promise<MedicalRecordResponseDto> {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }
    return this.medicalRecordService.uploadFile(
      prisonerId,
      recordId,
      file,
      userId,
    );
  }
}
