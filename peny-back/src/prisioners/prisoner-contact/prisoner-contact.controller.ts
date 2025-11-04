import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { PrisonerContactService } from './prisoner-contact.service';
import {
  CreateContactDto,
  UpdateContactDto,
  ContactResponseDto,
} from './dto/contact.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Prisoner Contacts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('prisoners/:prisonerId/contacts')
export class PrisonerContactController {
  constructor(private readonly contactService: PrisonerContactService) {}

  @Post()
  @ApiOperation({ summary: 'Agregar contacto de emergencia' })
  @ApiParam({ name: 'prisonerId', description: 'ID del prisionero' })
  @ApiResponse({
    status: 201,
    description: 'Contacto agregado exitosamente',
    type: ContactResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Prisionero no encontrado' })
  async create(
    @Param('prisonerId') prisonerId: string,
    @Body() createDto: CreateContactDto,
    @CurrentUser() userId: string,
  ): Promise<ContactResponseDto> {
    return this.contactService.create(prisonerId, createDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar contactos de emergencia' })
  @ApiParam({ name: 'prisonerId', description: 'ID del prisionero' })
  @ApiResponse({
    status: 200,
    description: 'Lista de contactos de emergencia',
    type: [ContactResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Prisionero no encontrado' })
  async findAll(
    @Param('prisonerId') prisonerId: string,
  ): Promise<ContactResponseDto[]> {
    return this.contactService.findAll(prisonerId);
  }

  @Get(':contactId')
  @ApiOperation({ summary: 'Obtener un contacto específico' })
  @ApiParam({ name: 'prisonerId', description: 'ID del prisionero' })
  @ApiParam({ name: 'contactId', description: 'ID del contacto' })
  @ApiResponse({
    status: 200,
    description: 'Contacto encontrado',
    type: ContactResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Contacto no encontrado' })
  async findOne(
    @Param('prisonerId') prisonerId: string,
    @Param('contactId') contactId: string,
  ): Promise<ContactResponseDto> {
    return this.contactService.findOne(prisonerId, contactId);
  }

  @Put(':contactId')
  @ApiOperation({ summary: 'Actualizar contacto de emergencia' })
  @ApiParam({ name: 'prisonerId', description: 'ID del prisionero' })
  @ApiParam({ name: 'contactId', description: 'ID del contacto' })
  @ApiResponse({
    status: 200,
    description: 'Contacto actualizado exitosamente',
    type: ContactResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Contacto no encontrado' })
  async update(
    @Param('prisonerId') prisonerId: string,
    @Param('contactId') contactId: string,
    @Body() updateDto: UpdateContactDto,
    @CurrentUser() userId: string,
  ): Promise<ContactResponseDto> {
    return this.contactService.update(prisonerId, contactId, updateDto, userId);
  }

  @Delete(':contactId')
  @ApiOperation({ summary: 'Eliminar contacto de emergencia (soft delete)' })
  @ApiParam({ name: 'prisonerId', description: 'ID del prisionero' })
  @ApiParam({ name: 'contactId', description: 'ID del contacto' })
  @ApiResponse({
    status: 200,
    description: 'Contacto eliminado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Contacto no encontrado' })
  async delete(
    @Param('prisonerId') prisonerId: string,
    @Param('contactId') contactId: string,
    @CurrentUser() userId: string,
  ): Promise<{ message: string }> {
    return this.contactService.delete(prisonerId, contactId, userId);
  }
}
