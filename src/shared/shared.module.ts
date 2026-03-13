import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from './prisma.service';
import { TokenService } from './token.service';
import { HashingService } from './hashing.service';
import { AuthenticationGuard } from './guards/authentication.guard';
import { AccessTokenGuard } from './guards/access-token.guard';
import { ApiKeyGuard } from './guards/api-key.guard';
import { APP_GUARD } from '@nestjs/core';
import { SharedUserRepository } from './repository/shared-user.repo';
import { EmailService } from './email.service';
import { TwoFactorAuthService } from './TwoFa.service';

@Global()
@Module({
  imports: [JwtModule],
  providers: [
    PrismaService,
    HashingService,
    TwoFactorAuthService,
    SharedUserRepository,
    TokenService,
    EmailService,
    AuthenticationGuard,
    AccessTokenGuard,
    ApiKeyGuard,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
  ],
  exports: [
    PrismaService,
    HashingService,
    EmailService,
    TwoFactorAuthService,
    SharedUserRepository,
    TokenService,
    AuthenticationGuard,
    AccessTokenGuard,
    ApiKeyGuard,
  ],
})
export class SharedModule {}
