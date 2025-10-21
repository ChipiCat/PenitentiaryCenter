import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
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
import { PrisonerBelongingService } from './prisoner-belonging.service';
import {
  CreateBelongingDto,
  UpdateBelongingDto,
  BelongingResponseDto,
  UploadBelongingFileDto,
} from './dto/belonging.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { UploadedFile as UploadedFileType } from '../../files/interfaces/uploaded-file.interface';

@ApiTags('Prisoner Belongings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('prisoners/:prisonerId/belongings')
export class PrisonerBelongingController {
  constructor(private readonly belongingService: PrisonerBelongingService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar artículos personales' })
  @ApiParam({ name: 'prisonerId', description: 'ID del prisionero' })
  @ApiResponse({
    status: 201,
    description: 'Artículo registrado exitosamente',
    type: BelongingResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Prisionero no encontrado' })
  async create(
    @Param('prisonerId') prisonerId: string,
    @Body() createDto: CreateBelongingDto,
    @CurrentUser() userId: string,
  ): Promise<BelongingResponseDto> {
    return this.belongingService.create(prisonerId, createDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar artículos personales del prisionero' })
  @ApiParam({ name: 'prisonerId', description: 'ID del prisionero' })
  @ApiResponse({
    status: 200,
    description: 'Lista de artículos personales',
    type: [BelongingResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Prisionero no encontrado' })
  async findAll(
    @Param('prisonerId') prisonerId: string,
  ): Promise<BelongingResponseDto[]> {
    return this.belongingService.findAll(prisonerId);
  }

  @Get(':belongingId')
  @ApiOperation({ summary: 'Obtener un artículo específico' })
  @ApiParam({ name: 'prisonerId', description: 'ID del prisionero' })
  @ApiParam({ name: 'belongingId', description: 'ID del artículo' })
  @ApiResponse({
    status: 200,
    description: 'Artículo encontrado',
    type: BelongingResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Artículo no encontrado' })
  async findOne(
    @Param('prisonerId') prisonerId: string,
    @Param('belongingId') belongingId: string,
  ): Promise<BelongingResponseDto> {
    return this.belongingService.findOne(prisonerId, belongingId);
  }

  @Put(':belongingId')
  @ApiOperation({ summary: 'Actualizar un artículo personal' })
  @ApiParam({ name: 'prisonerId', description: 'ID del prisionero' })
  @ApiParam({ name: 'belongingId', description: 'ID del artículo' })
  @ApiResponse({
    status: 200,
    description: 'Artículo actualizado exitosamente',
    type: BelongingResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Artículo no encontrado' })
  async update(
    @Param('prisonerId') prisonerId: string,
    @Param('belongingId') belongingId: string,
    @Body() updateDto: UpdateBelongingDto,
    @CurrentUser() userId: string,
  ): Promise<BelongingResponseDto> {
    return this.belongingService.update(
      prisonerId,
      belongingId,
      updateDto,
      userId,
    );
  }

  @Delete(':belongingId')
  @ApiOperation({ summary: 'Eliminar un artículo personal (soft delete)' })
  @ApiParam({ name: 'prisonerId', description: 'ID del prisionero' })
  @ApiParam({ name: 'belongingId', description: 'ID del artículo' })
  @ApiResponse({
    status: 200,
    description: 'Artículo eliminado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Artículo no encontrado' })
  async delete(
    @Param('prisonerId') prisonerId: string,
    @Param('belongingId') belongingId: string,
    @CurrentUser() userId: string,
  ): Promise<{ message: string }> {
    return this.belongingService.delete(prisonerId, belongingId, userId);
  }

  @Post(':belongingId/upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Subir inventario firmado (PDF)' })
  @ApiParam({ name: 'prisonerId', description: 'ID del prisionero' })
  @ApiParam({ name: 'belongingId', description: 'ID del artículo' })
  @ApiBody({ type: UploadBelongingFileDto })
  @ApiResponse({
    status: 201,
    description: 'Inventario subido exitosamente',
    type: BelongingResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Archivo inválido' })
  @ApiResponse({ status: 404, description: 'Artículo no encontrado' })
  async uploadFile(
    @Param('prisonerId') prisonerId: string,
    @Param('belongingId') belongingId: string,
    @UploadedFile() file: UploadedFileType,
    @CurrentUser() userId: string,
  ): Promise<BelongingResponseDto> {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }
    return this.belongingService.uploadFile(
      prisonerId,
      belongingId,
      file,
      userId,
    );
  }

  @Patch(':belongingId/return')
  @ApiOperation({ summary: 'Marcar un artículo como devuelto' })
  @ApiParam({ name: 'prisonerId', description: 'ID del prisionero' })
  @ApiParam({ name: 'belongingId', description: 'ID del artículo' })
  @ApiResponse({
    status: 200,
    description: 'Artículo marcado como devuelto',
    type: BelongingResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Artículo no encontrado' })
  async markAsReturned(
    @Param('prisonerId') prisonerId: string,
    @Param('belongingId') belongingId: string,
    @CurrentUser() userId: string,
  ): Promise<BelongingResponseDto> {
    return this.belongingService.markAsReturned(prisonerId, belongingId, userId);
  }
}
