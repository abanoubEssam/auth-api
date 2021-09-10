import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Principal } from '../models/principal.model';

export const CurrentPrincipal = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const principal = new Principal(request.user, request.user?.role);
    return { user: {...principal.user , id: (principal.user as any).userId}, role: principal.role };
  },
);
