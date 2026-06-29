import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleEnum } from '../enum/user.enum';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const roles = this.reflector.get<RoleEnum[]>(
        'Roles_Enum',
        context.getHandler(),
      );
      let req: any;
      if (context.getType() === 'http') {
        req = context.switchToHttp().getRequest();
      } else if (context.getType() === 'rpc') {
        req = context.switchToRpc().getContext();
      } else if (context.getType() === 'ws') {
        req = context.switchToWs().getClient();
      }
      if (!req.user) {
        throw new UnauthorizedException('User not authenticated');
      }
      if (!roles) {
        return true;
      }
      if (!roles.includes(req.user.role)) {
        throw new UnauthorizedException("You don't have permission");
      }
      return true;
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }
}
