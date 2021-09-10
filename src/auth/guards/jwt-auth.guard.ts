import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
  handleRequest(err, user, info, context: ExecutionContext) {
    const isPublicOnMethod = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );
    const isPublicOnClass = this.reflector.get<boolean>(
      'isPublic',
      context.getClass(),
    );
    if (
      (typeof isPublicOnMethod !== 'undefined' && !!isPublicOnMethod) ||
      (typeof isPublicOnMethod === 'undefined' && !!isPublicOnClass)
    ) {
      if (user) return user;
      else return null;
    }
    if (err || !user) {
      throw err || new UnauthorizedException('you are not allowed');
    }
    return user;
  }
}
