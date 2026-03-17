import { PartialType } from '@nestjs/mapped-types';
import { CreateProjectAccessControlDto } from './create-project-access-control.dto';

export class UpdateProjectAccessControlDto extends PartialType(CreateProjectAccessControlDto) {}
