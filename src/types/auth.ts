export type createUserType = {
  name: string;
  email: string;
  password: string;
};

export interface TokenPayload {
  userId: number;
  deviceId: number;
  roleId: number;
  roleName: string;
}

export interface AccessTokenPayload extends TokenPayload {
  exp: number;
  iat: number;
}
export interface RefreshTokenPayloadCreate {
  userId: number;
}

export interface RefreshTokenPayload extends RefreshTokenPayloadCreate {
  exp: number;
  iat: number;
}
