import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import envConfig from '../shared/config';
import { AuthRepository } from './auth.repo';
import { RolesService } from './roles.service';
import { HashingService } from '../shared/hashing.service';
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleService {
  private readonly oAuth2Client: OAuth2Client;
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly roleService: RolesService,
    private readonly hashingService: HashingService,
    private readonly authService: AuthService,
  ) {
    this.oAuth2Client = new google.auth.OAuth2(
      envConfig.GOOGLE_CLIENT_ID,
      envConfig.GOOGLE_CLIENT_SECRET,
      envConfig.GOOGLE_REDIRECT_URI,
    );
  }

  getAuthorizationUrl({ ip, userAgent }: { userAgent: string; ip: string }) {
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ];

    const stateString = Buffer.from(JSON.stringify({ ip, userAgent })).toString('base64');

    const url = this.oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      include_granted_scopes: true,
      state: stateString,
    });

    return { url };
  }

  async googleCallback({
    code,
    state,
  }: {
    code: string;
    state: string;
  }): Promise<{ accessToken: string; refreshToken: string }> {
    let userAgent = 'Unknown';
    let ip = 'Unknown';
    try {
      if (state) {
        const clientInfo = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
        userAgent = clientInfo.userAgent || 'Unknown';
        ip = clientInfo.ip;
      }

      const { tokens } = await this.oAuth2Client.getToken(code);
      this.oAuth2Client.setCredentials(tokens);

      const oauth2 = google.oauth2({
        auth: this.oAuth2Client,
        version: 'v2',
      });

      const { data } = await oauth2.userinfo.get();
      if (!data?.email) throw new Error('Failed to retrieve email from Google account');
      let user = await this.authRepository.findUniqueUserIncludeRole({
        email: data.email,
      });

      if (!user) {
        const [clientRoleId, hashedPassword] = await Promise.all([
          this.roleService.getClientRoleId(),
          this.hashingService.hashPassword(uuidv4()),
        ]);

        user = await this.authRepository.createUserIncludeRole({
          email: data.email,
          name: data.name || '',
          password: hashedPassword,
          roleId: clientRoleId,
          phoneNumber: '',
          avatar: data.picture || null,
        });
      }

      const device = await this.authRepository.createDevice({
        userId: user.id,
        userAgent,
        ip,
      });

      return this.authService.generateTokens({
        userId: user.id,
        deviceId: device.id,
        roleId: user.roleId,
        roleName: user.role.name,
      });
    } catch (e) {
      console.error('Failed to parse state:', e);
      throw new Error('Failed to authenticate with Google');
    }
  }
}
