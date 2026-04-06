export const ROLE_NAME = {
  ADMIN: 'admin',
  CLIENT: 'client',
  SELLER: 'seller',
} as const;

export const HTTP_METHOD = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
  OPTIONS: 'OPTIONS',
  HEAD: 'HEAD',
} as const;

export type HTTPMethodType = (typeof HTTP_METHOD)[keyof typeof HTTP_METHOD];
