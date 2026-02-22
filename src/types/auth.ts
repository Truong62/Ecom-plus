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

export interface RefreshTokenPayloadCreate {
  userId: number;
}
