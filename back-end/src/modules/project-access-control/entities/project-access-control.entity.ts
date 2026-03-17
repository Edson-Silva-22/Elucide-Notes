import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";

export enum ProjectsAccessControlRole {
  OWNER = 'owner',
  COLLABORATOR = 'collaborator',
}

export enum ProjectsAccessControlStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  REMOVED = 'removed',
}

@Schema({ timestamps: true , collection: 'project-access-controls' })
export class ProjectAccessControl {
  @Prop({
    ref: 'Project',
    type: mongoose.Schema.Types.ObjectId,
  })
  projectId: string;

  @Prop({
    ref: 'User',
    type: mongoose.Schema.Types.ObjectId,
  })
  userId: string;

  @Prop({
    type: String,
    enum: ProjectsAccessControlRole,
  })
  role: ProjectsAccessControlRole;

  @Prop({
    type: String,
    enum: ProjectsAccessControlStatus,
    default: ProjectsAccessControlStatus.PENDING
  })
  status: ProjectsAccessControlStatus

  @Prop({
    ref: 'User',
    type: mongoose.Schema.Types.String,
    required: false,
  })
  invitedBy?: string;

  @Prop({ default: Date.now() })
  joinedAt: Date;

  @Prop()
  removedAt: Date;

  @Prop()
  description?: string;
}

export const ProjectAccessControlSchema = SchemaFactory.createForClass(ProjectAccessControl);
