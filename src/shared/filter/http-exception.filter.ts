import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    console.log(response);

    let status: number;
    let body: object;

    switch (exception.code) {
      case 'P2002': {
        const fields = exception.meta?.target as string[] | undefined;
        status = HttpStatus.CONFLICT;
        body = {
          statusCode: status,
          code: 'UNIQUE_CONSTRAINT_FAILED',
          fields,
          message: fields ? `Duplicate value for field(s): ${fields.join(', ')}` : 'Duplicate value',
        };
        break;
      }

      case 'P2025': {
        status = HttpStatus.NOT_FOUND;
        body = {
          statusCode: status,
          code: 'RECORD_NOT_FOUND',
          message: 'Record not found',
        };
        break;
      }

      default: {
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        body = {
          statusCode: status,
          code: 'PRISMA_ERROR',
          prismaCode: exception.code,
          message: exception.message,
        };
      }
    }

    response.status(status).json(body);
  }
}
