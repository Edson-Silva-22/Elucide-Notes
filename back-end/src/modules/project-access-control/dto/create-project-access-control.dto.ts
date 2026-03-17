import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { ProjectsAccessControlStatus } from "../entities/project-access-control.entity";
import { Transform } from "class-transformer";
import mongoose from "mongoose";

export class CreateProjectAccessControlDto {
  @IsNotEmpty({ message: 'O campo projectId é obrigatório.' })
  @Transform(({ value }) => new mongoose.Types.ObjectId(value))
  projectId: string;

  @IsNotEmpty({ message: 'O campo userId é obrigatório.' })
  @Transform(({ value }) => new mongoose.Types.ObjectId(value))
  userId: string;

  @IsNotEmpty({ message: 'O campo role é obrigatório.' })
  role: string;

  @IsOptional()
  status?: ProjectsAccessControlStatus;

  @IsOptional()
  @IsString({ message: 'O campo invitedBy deve ser uma string.' })
  invitedBy?: string;

  @IsOptional()
  @IsString({ message: 'O campo description deve ser uma string.' })
  description?: string;
}
