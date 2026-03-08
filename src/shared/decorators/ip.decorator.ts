import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import requestIp from 'request-ip';

export const IP = createParamDecorator((data, ctx: ExecutionContext): string => {
  return String(requestIp.getClientIp(ctx.switchToHttp().getRequest()));
});
