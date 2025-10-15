import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";


export interface IPaginatedResponse<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export class PaginationMetaDto {
  @ApiProperty({ example: 1 })
  page: number;
  @ApiProperty({ example: 10 })
  limit: number;
  @ApiProperty({ example: 100 })
  total: number;
  @ApiProperty({ example: 10 })
  totalPages: number;
}

export class ResponseListDto<T> {
  @ApiProperty({ isArray: true })
  data: T[];

  @ApiProperty({ type: PaginationMetaDto })
  @Type(() => PaginationMetaDto)
  pagination: PaginationMetaDto;

  constructor(data: T[], pagination: PaginationMetaDto) {
    this.data = data;
    this.pagination = pagination;
  }
}