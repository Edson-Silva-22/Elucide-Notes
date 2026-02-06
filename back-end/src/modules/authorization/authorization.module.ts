import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "../users/entities/user.entity";
import { AuthorizationGuard } from "./authorization.guard";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema }
    ])
  ],
  controllers: [],
  providers: [AuthorizationGuard],
  exports: [MongooseModule]
})
export class AuthorizationModule {}