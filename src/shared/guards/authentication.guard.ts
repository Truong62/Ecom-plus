import { AccessTokenGuard } from './access-token.guard';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AUTH_KEY, AuthTypeDecoratorPayLoad } from '../decorators/auth.decorator';
import { Reflector } from '@nestjs/core';
import { ApiKeyGuard } from './api-key.guard';
import { AuthType, ConditionGuard } from '../constants/auth.constants';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokenGuard: AccessTokenGuard,
    private readonly apiKeyGuard: ApiKeyGuard,
  ) {}

  private get authTypeGuardMap() {
    return {
      [AuthType.Bearer]: this.accessTokenGuard,
      [AuthType.ApiKey]: this.apiKeyGuard,
      [AuthType.None]: { canActivate: () => true },
    };
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authTypes = this.reflector.getAllAndOverride<AuthTypeDecoratorPayLoad | undefined>(AUTH_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) ?? { authTypes: [AuthType.Bearer], options: { condition: ConditionGuard.And } };
    const guards = authTypes.authTypes.map((authType) => this.authTypeGuardMap[authType]);

    if (authTypes.options.condition === ConditionGuard.Or) {
      for (const guard of guards) {
        const result = await Promise.resolve(guard.canActivate(context)).catch(() => false);
        if (result) return true;
      }
      return false;
    }

    for (const guard of guards) {
      await guard.canActivate(context);
    }
    return true;
  }
}
