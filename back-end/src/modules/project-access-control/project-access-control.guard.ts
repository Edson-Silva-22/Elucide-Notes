import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ProjectAccessControlService } from "./project-access-control.service";

@Injectable()
export class ProjectAccessControlGuard implements CanActivate {
  constructor(private readonly projectAccessControlService: ProjectAccessControlService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const projectId = request.params.id;
    const authUser = request.user;

    if (!authUser) throw new UnauthorizedException('Usuário não autenticado.');

    if (authUser.role === 'admin') return true;
    
    await this.projectAccessControlService.checkUserAccess(projectId, authUser.sub);

    return true;
  }
}