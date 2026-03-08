import { SetMetadata } from '@nestjs/common';
import { AuthType, ConditionGuard } from '../constants/auth.constants';

export const AUTH_KEY = 'auth';
export type AuthTypeDecoratorPayLoad = { authTypes: AuthType[]; options: { condition: ConditionGuard } };

export const Auth = (authTypes: AuthType[], options: { condition: ConditionGuard }) => {
  return SetMetadata(AUTH_KEY, { authTypes, options });
};

export const isPublish = () => Auth([AuthType.None], { condition: ConditionGuard.Or });
