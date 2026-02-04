import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class CreateAuthDto {
  @IsNotEmpty({message: 'O Email é obrigatório.'})
  @IsEmail({},{message: 'Formato de Email inválido.'})
  email: string;

  @IsNotEmpty({message: 'A Senha é obrigatória.'})
  @IsString({message: 'A Senha deve ser uma string.'})
  password: string;
}