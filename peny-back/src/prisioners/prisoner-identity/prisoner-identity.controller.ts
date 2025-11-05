import {
  Controller,
  Get,
  Post,
  Put,
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
import { IdentityService } from './prisoner-identity.service';
import {
  CreateIdentityDto,
  IdentityResponseDto,
  UpdateIdentityDto,
  UploadPhotoDto,
  UploadFingerprintDto,
} from './dto/identity.dto';
import type { UploadedFile as UploadedFileType } from '../../files/interfaces/uploaded-file.interface';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Prisoner Identity')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('prisoners/:prisonerId/identity')
export class IdentityController {
  constructor(private readonly identityService: IdentityService) {}

  @Post()
  @ApiOperation({ summary: 'Crear información de identidad del prisionero' })
  @ApiParam({ name: 'prisonerId', description: 'ID del prisionero' })
  @ApiResponse({
    status: 201,
    description: 'Identidad creada exitosamente',
    type: IdentityResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o identidad ya existe',
  })
  @ApiResponse({ status: 404, description: 'Prisionero no encontrado' })
  async create(
    @Param('prisonerId') prisonerId: string,
    @Body() createDto: CreateIdentityDto,
    @CurrentUser() userId: string,
  ): Promise<IdentityResponseDto> {
    return this.identityService.create(prisonerId, createDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener información de identidad del prisionero' })
  @ApiParam({ name: 'prisonerId', description: 'ID del prisionero' })
  @ApiResponse({
    status: 200,
    description: 'Identidad encontrada',
    type: IdentityResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Identidad no encontrada' })
  async findOne(
    @Param('prisonerId') prisonerId: string,
  ): Promise<IdentityResponseDto> {
    return this.identityService.findOne(prisonerId);
  }

  @Put()
  @ApiOperation({
    summary: 'Actualizar información de identidad del prisionero',
  })
  @ApiParam({ name: 'prisonerId', description: 'ID del prisionero' })
  @ApiResponse({
    status: 200,
    description: 'Identidad actualizada exitosamente',
    type: IdentityResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Identidad no encontrada' })
  async update(
    @Param('prisonerId') prisonerId: string,
    @Body() updateDto: UpdateIdentityDto,
    @CurrentUser() userId: string,
  ): Promise<IdentityResponseDto> {
    return this.identityService.update(prisonerId, updateDto, userId);
  }

  @Post('upload-photo')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Subir foto del prisionero' })
  @ApiParam({ name: 'prisonerId', description: 'ID del prisionero' })
  @ApiBody({ type: UploadPhotoDto })
  @ApiResponse({
    status: 201,
    description: 'Foto subida exitosamente',
    type: IdentityResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Archivo inválido' })
  @ApiResponse({ status: 404, description: 'Identidad no encontrada' })
  async uploadPhoto(
    @Param('prisonerId') prisonerId: string,
    @UploadedFile() file: UploadedFileType,
    @CurrentUser() userId: string,
  ): Promise<IdentityResponseDto> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    return this.identityService.uploadPhoto(prisonerId, file, userId);
  }

  @Post('upload-fingerprint')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Subir huella dactilar del prisionero' })
  @ApiParam({ name: 'prisonerId', description: 'ID del prisionero' })
  @ApiBody({ type: UploadFingerprintDto })
  @ApiResponse({
    status: 201,
    description: 'Huella subida exitosamente',
    type: IdentityResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Archivo inválido' })
  @ApiResponse({ status: 404, description: 'Identidad no encontrada' })
  async uploadFingerprint(
    @Param('prisonerId') prisonerId: string,
    @Body('hand') hand: 'right' | 'left',
    @UploadedFile() file: UploadedFileType,
    @CurrentUser() userId: string,
  ): Promise<IdentityResponseDto> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    if (!hand || !['right', 'left'].includes(hand)) {
      throw new BadRequestException(
        'Invalid hand parameter. Must be "right" or "left"',
      );
    }
    return this.identityService.uploadFingerprint(
      prisonerId,
      file,
      hand,
      userId,
    );
  }
}
