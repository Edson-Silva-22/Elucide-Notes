import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export enum SystemRole {
  ADMIN = 'admin',
  USER = 'user',
}

@Schema({
  timestamps: true,
})
export class User {
  @Prop()
  name: string;

  @Prop()
  email: string;
  
  @Prop()
  password: string;

  @Prop({
    enum: SystemRole,
    default: SystemRole.USER
  })
  role: SystemRole;
}

export const UserSchema = SchemaFactory.createForClass(User);