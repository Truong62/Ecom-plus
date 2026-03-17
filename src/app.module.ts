import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from './shared/shared.module';
import { AuthModule } from './auth/auth.module';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import MyZodValidationPipe from './shared/pipes/customZodValidation';
import { PrismaExceptionFilter } from './shared/filter/http-exception.filter';
import { ZodSerializerInterceptor } from 'nestjs-zod';
import { TransformInterceptor } from './shared/interceptor/transform.interceptor';
import { LanguageModule } from './language/language.module';

@Module({
  imports: [SharedModule, AuthModule, LanguageModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: MyZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: PrismaExceptionFilter,
    },
  ],
})
export class AppModule {}
