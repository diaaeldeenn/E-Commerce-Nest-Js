import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Types } from 'mongoose';
import UserRepository from '../../DB/repository/user.repository';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private readonly userModel: UserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    let req: any;
    if (context.getType() === 'http') {
      req = context.switchToHttp().getRequest();
    } else if (context.getType() === 'rpc') {
      req = context.switchToRpc().getContext();
    } else if (context.getType() === 'ws') {
      req = context.switchToWs().getClient();
    }

    try {
      const { token } = req.headers;
      if (!token || typeof token !== 'string') {
        throw new UnauthorizedException('Token Not Provided');
      }

      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_TOKEN!,
      });

      if (typeof decoded === 'string') {
        throw new UnauthorizedException('Invalid Token');
      }

      const userId = decoded.userId;
      if (!Types.ObjectId.isValid(userId)) {
        throw new UnauthorizedException('Invalid Token Payload');
      }

      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException('User Not Found');
      }

      req.user = user;
      req.decoded = decoded;
    } catch (error: any) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new UnauthorizedException('Invalid Token or Expired');
    }

    return true;
  }
}
