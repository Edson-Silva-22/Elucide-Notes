import { IsOptional, IsString } from "class-validator";

export class ListTagDto {
  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;
}
