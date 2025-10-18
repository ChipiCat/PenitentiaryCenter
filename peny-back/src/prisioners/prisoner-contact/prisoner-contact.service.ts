import {
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
	CreateContactDto,
	UpdateContactDto,
	ContactResponseDto,
} from './dto/contact.dto';

@Injectable()
export class PrisonerContactService {
	constructor(private readonly prisma: PrismaService) {}

	/**
	 * Agregar un contacto de emergencia
	 */
	async create(
		prisonerId: string,
		createDto: CreateContactDto,
		userId: string,
	): Promise<ContactResponseDto> {
		// Verificar que el prisionero exista
		const prisoner = await this.prisma.prisoner.findUnique({
			where: { id: prisonerId, isDeleted: false },
		});

		if (!prisoner) {
			throw new NotFoundException(`Prisionero con ID ${prisonerId} no encontrado`);
		}

		// Crear el contacto
		const contact = await this.prisma.prisonerContact.create({
			data: {
				prisonerId,
				name: createDto.name,
				relationship: createDto.relationship,
				phone: createDto.phone,
				createdBy: userId,
				updatedBy: userId,
			},
		});

		return this.mapToResponseDto(contact);
	}

	/**
	 * Listar todos los contactos de emergencia del prisionero
	 */
	async findAll(prisonerId: string): Promise<ContactResponseDto[]> {
		// Verificar que el prisionero exista
		const prisoner = await this.prisma.prisoner.findUnique({
			where: { id: prisonerId, isDeleted: false },
		});

		if (!prisoner) {
			throw new NotFoundException(`Prisionero con ID ${prisonerId} no encontrado`);
		}

		const contacts = await this.prisma.prisonerContact.findMany({
			where: {
				prisonerId,
				isDeleted: false,
			},
			orderBy: {
				createdAt: 'desc',
			},
		});

		return contacts.map((contact) => this.mapToResponseDto(contact));
	}

	/**
	 * Obtener un contacto específico
	 */
	async findOne(
		prisonerId: string,
		contactId: string,
	): Promise<ContactResponseDto> {
		const contact = await this.prisma.prisonerContact.findFirst({
			where: {
				id: contactId,
				prisonerId,
				isDeleted: false,
			},
		});

		if (!contact) {
			throw new NotFoundException(
				`Contacto con ID ${contactId} no encontrado para el prisionero ${prisonerId}`,
			);
		}

		return this.mapToResponseDto(contact);
	}

	/**
	 * Actualizar un contacto de emergencia
	 */
	async update(
		prisonerId: string,
		contactId: string,
		updateDto: UpdateContactDto,
		userId: string,
	): Promise<ContactResponseDto> {
		// Verificar que el contacto exista
		const existingContact = await this.prisma.prisonerContact.findFirst({
			where: {
				id: contactId,
				prisonerId,
				isDeleted: false,
			},
		});

		if (!existingContact) {
			throw new NotFoundException(
				`Contacto con ID ${contactId} no encontrado para el prisionero ${prisonerId}`,
			);
		}

		// Actualizar el contacto
		const updatedContact = await this.prisma.prisonerContact.update({
			where: { id: contactId },
			data: {
				name: updateDto.name,
				relationship: updateDto.relationship,
				phone: updateDto.phone,
				updatedBy: userId,
			},
		});

		return this.mapToResponseDto(updatedContact);
	}

	/**
	 * Eliminar (soft delete) un contacto de emergencia
	 */
	async delete(
		prisonerId: string,
		contactId: string,
		userId: string,
	): Promise<{ message: string }> {
		// Verificar que el contacto exista
		const existingContact = await this.prisma.prisonerContact.findFirst({
			where: {
				id: contactId,
				prisonerId,
				isDeleted: false,
			},
		});

		if (!existingContact) {
			throw new NotFoundException(
				`Contacto con ID ${contactId} no encontrado para el prisionero ${prisonerId}`,
			);
		}

		// Soft delete
		await this.prisma.prisonerContact.update({
			where: { id: contactId },
			data: {
				isDeleted: true,
				updatedBy: userId,
			},
		});

		return { message: 'Contacto de emergencia eliminado exitosamente' };
	}

	/**
	 * Mapear entidad Prisma a DTO de respuesta
	 */
	private mapToResponseDto(contact: any): ContactResponseDto {
		return {
			id: contact.id,
			prisoner_id: contact.prisonerId,
			name: contact.name,
			relationship: contact.relationship,
			phone: contact.phone,
			created_by: contact.createdBy,
			updated_by: contact.updatedBy,
			created_at: contact.createdAt.toISOString(),
			updated_at: contact.updatedAt.toISOString(),
		};
	}
}
