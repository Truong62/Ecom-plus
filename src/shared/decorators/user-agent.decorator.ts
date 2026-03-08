import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserAgent = createParamDecorator((data, ctx: ExecutionContext): string => {
  const req = ctx.switchToHttp().getRequest();
  return (req.headers['user-agent'] as string) || '';
});
