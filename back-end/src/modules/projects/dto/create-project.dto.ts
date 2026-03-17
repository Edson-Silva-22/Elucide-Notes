import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateProjectDto {
  @IsNotEmpty({message: 'o título do projeto é obrigatório'})
  @IsString({message: 'o título do projeto deve ser uma string'})
  title: string;

  @IsOptional()
  @IsString({message: 'a descrição do projeto deve ser uma string'})
  description?: string;
}
