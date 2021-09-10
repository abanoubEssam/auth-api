import { SetMetadata } from '@nestjs/common';
import { AppRoles } from '../constants';

export const ROLES_KEY = 'role';
export const Roles = (...roles: AppRoles[]) => SetMetadata(ROLES_KEY, roles);