import { ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { SystemRole, User } from "../../users/entities/user.entity";
import { Request } from "express";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorator/roles.decorator";

@Injectable()
export class AuthorizationGuard {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext) {
    try {
      //Pegando os roles autorizados
      const requiredRoles = this.reflector.getAllAndOverride<SystemRole[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

      if (!requiredRoles) {
          return true;
      }

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
        
      if (requiredRoles.length && !requiredRoles.includes(findUser.role)) {
        throw new UnauthorizedException('Unauthorized.');
      }

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