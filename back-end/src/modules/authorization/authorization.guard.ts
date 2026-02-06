import { ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "../users/entities/user.entity";
import { Request } from "express";

@Injectable()
export class AuthorizationGuard {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext) {
    try {
      const request = context.switchToHttp().getRequest<Request>();
      const token = this.extractTokenFromHeader(request);
      if (!token) {
        throw new UnauthorizedException('Unauthorized.');
      }
      
      const payload = await this.jwtService.verifyAsync(
        token,
        {
          secret: process.env.JWT_SECRET ?? 'secret',
        }
      );

      const findUser = await this.userModel.findById(payload.sub);
      if (!findUser) throw new UnauthorizedException('Unauthorized.')
        
      if (!findUser.isAdmin) throw new UnauthorizedException('Insufficient permissions.')

      return true;
    } catch (error) {
      console.error(error)
      if(error == 'TokenExpiredError: jwt expired') {
        throw new UnauthorizedException('Expired token.')
      }
      throw new UnauthorizedException('Unauthorized.')
    }
  }

  extractTokenFromHeader(request: Request): string | undefined {
    //pegando o token do cabeçalho da requisição
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if(type === 'Bearer' && token) return token;

    //pegando o token do cookie da requisição
    if (request.cookies?.token) return request.cookies.token;

    return undefined;
  }
}