import { IsArray, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateTaskDto {
  @IsNotEmpty({ message: 'O título deve ser informado' })
  @IsString({ message: 'O título deve ser uma string' })
  title!: string;

  @IsOptional()
  @IsString({ message: 'A descrição deve ser uma string' })
  description?: string;

  @IsOptional()
  @IsArray({ message: 'As tags devem ser um array' })
  @IsString({ each: true, message: 'Cada tag deve ser uma string' })
  tags?: string[];
}
