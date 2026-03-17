import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: true })
export class Project {
  @Prop()
  title: string;

  @Prop({required: false})
  description?: string;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
