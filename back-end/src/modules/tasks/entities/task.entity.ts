import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

export enum TaskStatus {
  NOT_STARTED = 'not started',
  IN_PROGRESS = 'in progress',
  IN_REVIEW = 'in review',
  DONE = 'done',
}

@Schema({ timestamps: true })
export class Task {
  @Prop()
  code!: number;

  @Prop()
  title!: string;
  
  @Prop({ type: Object, default: {} })
  description!: Record<string, any>;

  @Prop({ default: TaskStatus.NOT_STARTED })
  status!: TaskStatus;

  @Prop({ default: [] })
  tags!: string[];

  @Prop({
    type: Types.ObjectId,
    ref: 'Project',
    required: true
  })
  projectId!: Types.ObjectId;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
