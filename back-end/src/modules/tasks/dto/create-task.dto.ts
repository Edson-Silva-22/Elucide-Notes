import { IsArray, IsNotEmpty, IsObject, IsOptional, IsString } from "class-validator";

export class CreateTaskDto {
  @IsNotEmpty({ message: 'O título deve ser informado' })
  @IsString({ message: 'O título deve ser uma string' })
  title!: string;

  @IsOptional()
  @IsObject({ message: 'A descrição deve ser um objeto' })
  description?: Record<string, any>

  @IsOptional()
  @IsArray({ message: 'As tags devem ser um array' })
  @IsString({ each: true, message: 'Cada tag deve ser uma string' })
  tags?: string[];
}
