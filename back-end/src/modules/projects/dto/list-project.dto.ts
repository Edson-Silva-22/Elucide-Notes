import { IsOptional, IsString } from "class-validator"

export class ListProjectDto {
  @IsOptional()
  keyword?: string

  @IsOptional()
  page?: number

  @IsOptional()
  limit?: number

  @IsOptional()
  @IsString()
  sortBy?: string

  @IsOptional()
  sortOrder?: 1 | -1
}