import {
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
	CreateChildDto,
	UpdateChildDto,
	ChildResponseDto,
} from './dto/childre.dto';

@Injectable()
export class PrisonerChildrenService {
	constructor(private readonly prisma: PrismaService) {}

	/**
	 * Agregar información de un hijo
	 */
	async create(
		prisonerId: string,
		createDto: CreateChildDto,
		userId: string,
	): Promise<ChildResponseDto> {
		// Verificar que el prisionero exista
		const prisoner = await this.prisma.prisoner.findUnique({
			where: { id: prisonerId, isDeleted: false },
		});

		if (!prisoner) {
			throw new NotFoundException(`Prisionero con ID ${prisonerId} no encontrado`);
		}

		// Crear el registro del hijo
		const child = await this.prisma.prisonerChild.create({
			data: {
				prisonerId,
				fullName: createDto.full_name,
				birthDate: createDto.birth_date
					? new Date(createDto.birth_date)
					: null,
				createdBy: userId,
				updatedBy: userId,
			},
		});

		return this.mapToResponseDto(child);
	}

	/**
	 * Listar todos los hijos del prisionero
	 */
	async findAll(prisonerId: string): Promise<ChildResponseDto[]> {
		// Verificar que el prisionero exista
		const prisoner = await this.prisma.prisoner.findUnique({
			where: { id: prisonerId, isDeleted: false },
		});

		if (!prisoner) {
			throw new NotFoundException(`Prisionero con ID ${prisonerId} no encontrado`);
		}

		const children = await this.prisma.prisonerChild.findMany({
			where: {
				prisonerId,
				isDeleted: false,
			},
			orderBy: {
				createdAt: 'desc',
			},
		});

		return children.map((child) => this.mapToResponseDto(child));
	}

	/**
	 * Obtener información de un hijo específico
	 */
	async findOne(
		prisonerId: string,
		childId: string,
	): Promise<ChildResponseDto> {
		const child = await this.prisma.prisonerChild.findFirst({
			where: {
				id: childId,
				prisonerId,
				isDeleted: false,
			},
		});

		if (!child) {
			throw new NotFoundException(
				`Hijo con ID ${childId} no encontrado para el prisionero ${prisonerId}`,
			);
		}

		return this.mapToResponseDto(child);
	}

	/**
	 * Actualizar información de un hijo
	 */
	async update(
		prisonerId: string,
		childId: string,
		updateDto: UpdateChildDto,
		userId: string,
	): Promise<ChildResponseDto> {
		// Verificar que el registro exista
		const existingChild = await this.prisma.prisonerChild.findFirst({
			where: {
				id: childId,
				prisonerId,
				isDeleted: false,
			},
		});

		if (!existingChild) {
			throw new NotFoundException(
				`Hijo con ID ${childId} no encontrado para el prisionero ${prisonerId}`,
			);
		}

		// Actualizar el registro
		const updatedChild = await this.prisma.prisonerChild.update({
			where: { id: childId },
			data: {
				fullName: updateDto.full_name,
				birthDate: updateDto.birth_date
					? new Date(updateDto.birth_date)
					: undefined,
				updatedBy: userId,
			},
		});

		return this.mapToResponseDto(updatedChild);
	}

	/**
	 * Eliminar (soft delete) registro de un hijo
	 */
	async delete(
		prisonerId: string,
		childId: string,
		userId: string,
	): Promise<{ message: string }> {
		// Verificar que el registro exista
		const existingChild = await this.prisma.prisonerChild.findFirst({
			where: {
				id: childId,
				prisonerId,
				isDeleted: false,
			},
		});

		if (!existingChild) {
			throw new NotFoundException(
				`Hijo con ID ${childId} no encontrado para el prisionero ${prisonerId}`,
			);
		}

		// Soft delete
		await this.prisma.prisonerChild.update({
			where: { id: childId },
			data: {
				isDeleted: true,
				updatedBy: userId,
			},
		});

		return { message: 'Registro de hijo eliminado exitosamente' };
	}

	/**
	 * Mapear entidad Prisma a DTO de respuesta
	 */
	private mapToResponseDto(child: any): ChildResponseDto {
		return {
			id: child.id,
			prisoner_id: child.prisonerId,
			full_name: child.fullName,
			birth_date: child.birthDate
				? child.birthDate.toISOString().split('T')[0]
				: undefined,
			created_by: child.createdBy,
			updated_by: child.updatedBy,
			created_at: child.createdAt.toISOString(),
			updated_at: child.updatedAt.toISOString(),
		};
	}
}
