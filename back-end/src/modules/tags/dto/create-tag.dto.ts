import { IsNotEmpty, IsString } from "class-validator";

export class CreateTagDto {
  @IsNotEmpty({ message: 'O título deve ser informado' })
  @IsString({ message: 'O título deve ser uma string' })
  title!: string;
}
