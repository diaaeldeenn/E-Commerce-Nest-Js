import { SetMetadata } from '@nestjs/common';
import { RoleEnum } from '../enum/user.enum';

export const Roles = (...roles: RoleEnum[]) =>
  SetMetadata('Roles_Enum', roles);
